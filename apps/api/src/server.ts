import Fastify from 'fastify';
import cors from '@fastify/cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod'; // Keep zod for internal validation if needed
import { AnalyzePayloadSchema, KitchenNotePayloadSchema } from '@hyphae/schemas';

// Load env from current dir OR root fallback (for monorepo convenience)
dotenv.config();
// Env loaded. Force restart check.
// attempt root if not found? keeping simple for now.

const server = Fastify({
    logger: true
});

// Configure CORS
server.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Core, POS, BOH
    methods: ['GET', 'POST'],
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const hyphaeKey = process.env.HYPHAE_API_KEY;

if (!apiKey || apiKey === 'PLACEHOLDER_CHANGE_ME') {
    console.warn('WARNING: GEMINI_API_KEY missing or invalid. AI features will be MOCKED.');
}

if (!hyphaeKey) {
    console.warn('WARNING: HYPHAE_API_KEY not set. API is unsecured.');
}

const ai = apiKey && apiKey !== 'PLACEHOLDER_CHANGE_ME'
    ? new GoogleGenAI({ apiKey })
    : null;

const MODEL_FAST = 'gemini-2.5-flash';

// --- Auth Middleware ---
server.addHook('preHandler', async (request, reply) => {
    // Skip health check
    if (request.routerPath === '/health') return;

    if (!hyphaeKey) return; // Open if no key set (dev mode fallback)

    const clientKey = request.headers['x-api-key'];
    if (clientKey !== hyphaeKey) {
        reply.code(401).send({ error: 'Unauthorized: Invalid API Key' });
    }
});

// --- Routes ---

server.get('/health', async () => {
    return { status: 'ok', service: 'hyphae-api' };
});

server.post('/api/analyze', async (request, reply) => {
    try {
        const { transactions, menu } = AnalyzePayloadSchema.parse(request.body);

        if (!transactions.length) {
            return { result: "No data available for analysis." };
        }

        const prompt = `
      You are the "Strategic Core" AI for a food business.
      
      Here is the menu:
      ${JSON.stringify(menu.map((m: any) => ({ name: m.name, price: m.price, cat: m.categoryId })))}
      
      Here are the recent transactions:
      ${JSON.stringify(transactions.slice(0, 50))} // Limit context window
      
      Provide a brief, 3-bullet executive summary of performance.
      Identify one underperforming item and suggest a strategic price adjustment or marketing angle.
      Keep the tone professional but operational.
    `;

        let resultText = "No suitable response generated.";

        if (ai) {
            const response = await ai.models.generateContent({
                model: MODEL_FAST,
                contents: prompt,
            });
            resultText = response.text || resultText;
        } else {
            // Mock Response
            resultText = "EXECUTIVE SUMMARY (MOCK):\n• Sales are steady but lunch rush is down 15%.\n• 'Spicy Chicken Sandwich' is underperforming.\n• Suggest running a BOGO promo for lunch.\n\n(AI Key Missing - This is a simulation)";
        }

        return { result: resultText };
    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.code(400).send({ error: "Validation Error", details: error.errors });
        } else {
            request.log.error(error);
            reply.code(500).send({ error: "Internal Server Error" });
        }
    }
});

// In-memory store for Kitchen Notes (KDS)
interface KitchenTicket {
    id: string;
    productName: string;
    note: string;
    timestamp: number;
    status: 'pending' | 'completed';
    orderDetails?: any; // Full SavedOrder object
}

const kitchenQueue: KitchenTicket[] = [];

server.post('/api/kitchen-note', async (request, reply) => {
    try {
        // Allow richer payload: either just productName (legacy) or full structure
        const body = request.body as any;
        const productName = body.productName || "Unknown Order";
        const orderDetails = body.orderDetails || null;

        const prompt = `
      You are a kitchen expediter.
      Convert this full product name into a strict 20-character limit SHORTHAND for a ticket printer.
      
      Rules:
      1. ALL CAPS.
      2. No special characters (only A-Z, 0-9, spaces).
      3. Max 20 characters length.
      4. Use standard abbreviations (CHK, BGR, DBL, SM, LG).
      
      Input: "${productName}"
      Output (just the shorthand text):
    `;

        let note = "";
        try {
            if (ai) {
                const response = await ai.models.generateContent({
                    model: MODEL_FAST,
                    contents: prompt,
                });
                note = response.text?.trim().toUpperCase().substring(0, 20) || "DBL CHZ BGR";
            } else {
                // Mock
                note = "MOCK: " + productName.substring(0, 10).toUpperCase();
            }
        } catch (apiError) {
            // Fallback
            note = productName.substring(0, 15).toUpperCase();
        }

        // --- IDEMPOTENCY CHECK ---
        // If a ticket for this Order ID already exists and is pending, don't create a new one.
        // This prevents duplicates if the POS retries or "Resends".
        if (orderDetails && orderDetails.id) {
            const existingTicket = kitchenQueue.find(
                t => t.status === 'pending' && t.orderDetails?.id === orderDetails.id
            );

            if (existingTicket) {
                // Update note if changed? For now, just return existing to be safe.
                request.log.info(`Idempotency: Returned existing ticket ${existingTicket.id} for Order ${orderDetails.id}`);
                return { result: existingTicket.note, ticketId: existingTicket.id };
            }
        }

        // --- PERSISTENCE ---
        const ticket: KitchenTicket = {
            id: `kt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            productName,
            note,
            timestamp: Date.now(),
            status: 'pending',
            orderDetails // Store the full object
        };
        kitchenQueue.push(ticket);

        // Keep queue size manageable for demo
        if (kitchenQueue.length > 50) kitchenQueue.shift();

        return { result: note, ticketId: ticket.id };

    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "Internal Server Error" });
    }
});

server.get('/api/kitchen-queue', async (request, reply) => {
    // Return only pending
    return kitchenQueue.filter(t => t.status === 'pending').sort((a, b) => b.timestamp - a.timestamp);
});

server.get('/api/kitchen-status', async (request, reply) => {
    // Return status of all tickets in memory
    // Map orderId -> status
    const statusMap: Record<string, string> = {};
    kitchenQueue.forEach(t => {
        // If ticket was created with a full order object, use that ID. Otherwise try to parse or fallback.
        const orderId = t.orderDetails?.id;
        if (orderId) {
            statusMap[orderId] = t.status;
        }
    });
    return statusMap;
});

server.post('/api/kitchen-queue/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };
    const ticket = kitchenQueue.find(t => t.id === id);
    if (ticket) {
        ticket.status = 'completed';
        return { success: true };
    }
    return reply.code(404).send({ error: 'Ticket not found' });
});

// Start server
const start = async () => {
    try {
        const PORT = parseInt(process.env.PORT || '3001');
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server listening on port ${PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
