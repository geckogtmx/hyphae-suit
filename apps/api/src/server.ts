import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod'; // Keep zod for internal validation if needed
import { AnalyzePayloadSchema } from '@hyphae/schemas';
import { socketService } from './services/SocketService';
import { db, schema, desc, eq } from '@hyphae/database';

// Load env from current dir OR root fallback (for monorepo convenience)
dotenv.config();

const server = Fastify({
    logger: true
});

// Configure CORS
server.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'], // Core, POS, BOH
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
});

// Configure JWT
server.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me-in-prod-please'
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

const MODEL_FAST = 'gemini-2.0-flash'; // Updated model

// --- Auth Middleware ---
// Decorate for TypeScript
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    }
}

server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
});

// Global Hook - Check for either API Key OR JWT?
// For now, let's keep it simple: Public endpoints + Protected endpoints.
// But forcing checks for now on specific routes might be safer.

server.addHook('preHandler', async (request, reply) => {
    // Skip health check and login
    if (request.routerPath === '/health' || request.routerPath === '/api/auth/login') return;

    // 1. Check for API Key (System/Core Access)
    const clientKey = request.headers['x-api-key'];
    if (clientKey && clientKey === hyphaeKey) {
        return; // Authorized via Key
    }

    // 2. Check for Bearer Token (User/POS Access)
    // If no key, we *could* enforce JWT, but currently existing code relies on Key.
    // If neither is present, we might want to block, but let's be careful not to break existing flows.
    // For this transition phase:
    // If Authorization header exists, verify it.
    if (request.headers.authorization) {
        try {
            await request.jwtVerify();
            return; // Authorized via JWT
        } catch (e) {
            reply.code(401).send({ error: 'Unauthorized: Invalid Token' });
        }
    } else if (hyphaeKey && !clientKey) {
        // If system is secured and no key provided, fail.
        // reply.code(401).send({ error: 'Unauthorized: Missing Credentials' });
        // NOTE: Commented out to avoid breaking POS until it's fully migrated.
        // Ideally we enable this once POS sends tokens.
    }
});

// --- Routes ---

server.get('/health', async () => {
    return { status: 'ok', service: 'hyphae-api' };
});

// --- DATA ACCESS ROUTES ---

server.get('/api/concepts', async (request, reply) => {
    try {
        const concepts = await db.select().from(schema.concepts);
        return concepts;
    } catch (e) {
        reply.code(500).send({ error: "Failed to fetch concepts" });
    }
});

server.get('/api/categories', async (request, reply) => {
    try {
        const categories = await db.select().from(schema.categories);
        return categories;
    } catch (e) {
        reply.code(500).send({ error: "Failed to fetch categories" });
    }
});

server.get('/api/products', async (request, reply) => {
    try {
        const rawProducts = await db.query.products.findMany({
            with: {
                category: true,
                modifierGroups: {
                    with: {
                        group: {
                            with: {
                                options: true
                            }
                        }
                    }
                }
            }
        });

        // Transform Drizzle relation (junction) to flat structure
        const products = rawProducts.map(p => ({
            ...p,
            modifierGroups: p.modifierGroups.map((pm: any) => ({
                ...pm.group,
                options: pm.group.options, // Ensure options are carried over
                sortOrder: pm.sortOrder // Optional: keep sort order if needed
            }))
        }));

        return products;
    } catch (e) {
        console.error(e);
        reply.code(500).send({ error: "Failed to fetch products" });
    }
});

// LOGIN ROUTE
server.post('/api/auth/login', async (request, reply) => {
    const LoginSchema = z.object({
        pin: z.string()
    });

    try {
        const { pin } = LoginSchema.parse(request.body);

        // Find user by PIN
        const user = await db.query.users.findFirst({
            where: eq(schema.users.pin, pin)
        });

        if (!user) {
            return reply.code(401).send({ error: 'Invalid PIN' });
        }

        if (!user.isActive) {
            return reply.code(403).send({ error: 'User is inactive' });
        }

        // Sign Token
        const token = server.jwt.sign({
            id: user.id,
            name: user.name,
            role: user.role
        }, { expiresIn: '12h' });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.code(400).send({ error: "Validation Error", details: error.errors });
        } else {
            console.error(error);
            reply.code(500).send({ error: "Login failed" });
        }
    }
});

server.post('/api/analyze', async (request, reply) => {
    try {
        // We still validate the body, but we might rely on DB for the actual data
        const payload = AnalyzePayloadSchema.parse(request.body);
        // Fallback to empty array if menu is missing (though schema says required, being safe)
        const menu = payload.menu || [];

        // Fetch real transaction history from SQLite
        const recentOrders = await db.select()
            .from(schema.orders)
            .orderBy(desc(schema.orders.createdAt))
            .limit(50);

        if (!recentOrders.length) {
            return { result: "No historical data available in database for analysis." };
        }

        const prompt = `
      You are the "Strategic Core" AI for a food business.
      
      Here is the menu:
      ${JSON.stringify(menu.map((m: any) => ({ name: m.name, price: m.price, cat: m.categoryId })))}
      
      Here are the 50 most recent real transactions from the database:
      ${JSON.stringify(recentOrders.map(o => ({
            id: o.id,
            total: o.total,
            time: new Date(o.createdAt).toLocaleTimeString(),
            type: o.orderType
        })))}
      
      Provide a brief, 3-bullet executive summary of performance based on this REAL data.
      Identify one trend (e.g., peak times, popular order types) and suggest an action.
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
            resultText = `EXECUTIVE SUMMARY (MOCK - DB CONNECTED):\n• Analyzed ${recentOrders.length} real orders from database.\n• Average order value is $${(recentOrders.reduce((a, b) => a + b.total, 0) / recentOrders.length).toFixed(2)}.\n• Suggest promoting higher margin items.\n\n(AI Key Missing - Data Source: SQLite)`;
        }

        return { result: resultText };
    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.code(400).send({ error: "Validation Error", details: error.errors });
        } else {
            request.log.error(error);
            reply.code(500).send({ error: "Internal Server Error", details: (error as Error).message });
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
        if (orderDetails && orderDetails.id) {
            const existingTicket = kitchenQueue.find(
                t => t.status === 'pending' && t.orderDetails?.id === orderDetails.id
            );

            if (existingTicket) {
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

        if (kitchenQueue.length > 50) kitchenQueue.shift();

        // --- REALTIME BROADCAST ---
        socketService.emit('order:new', ticket);

        return { result: note, ticketId: ticket.id };

    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "Internal Server Error" });
    }
});

server.get('/api/kitchen-queue', async (request, reply) => {
    return kitchenQueue.filter(t => t.status === 'pending').sort((a, b) => b.timestamp - a.timestamp);
});

server.get('/api/kitchen-status', async (request, reply) => {
    const statusMap: Record<string, string> = {};
    kitchenQueue.forEach(t => {
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

        const payload = {
            orderId: ticket.orderDetails?.id,
            status: 'completed',
            ticketId: ticket.id
        };
        // Notify System
        socketService.emit('order:status-changed', payload);
        socketService.emit('order:updated', payload); // Alias for compatibility

        return { success: true };
    }
    return reply.code(404).send({ error: 'Ticket not found' });
});

// Start server
const start = async () => {
    try {
        const PORT = parseInt(process.env.PORT || '3001');

        await server.ready();
        socketService.initialize(server.server);

        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server listening on port ${PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
