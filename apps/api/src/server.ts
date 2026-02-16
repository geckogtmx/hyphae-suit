import Fastify from 'fastify';
import cors from '@fastify/cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const server = Fastify({
    logger: true
});

// Configure CORS
server.register(cors, {
    origin: '*', // For development - tighten in production
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY missing from environment variables');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });
const MODEL_FAST = 'gemini-2.5-flash';

// --- Validation Schemas ---
const AnalyzePayloadSchema = z.object({
    transactions: z.array(z.any()), // Refine type later if possible
    menu: z.array(z.any()), // Refine type later if possible
});

const KitchenNotePayloadSchema = z.object({
    productName: z.string().min(1),
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

        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
        });

        return { result: response.text || "No suitable response generated." };
    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.code(400).send({ error: "Validation Error", details: error.errors });
        } else {
            request.log.error(error);
            reply.code(500).send({ error: "Internal Server Error" });
        }
    }
});

server.post('/api/kitchen-note', async (request, reply) => {
    try {
        const { productName } = KitchenNotePayloadSchema.parse(request.body);

        const prompt = `
      Write a very short (max 5 words) kitchen shorthand label for "${productName}".
      Example: "Double Chz Bgr"
    `;

        try {
            const response = await ai.models.generateContent({
                model: MODEL_FAST,
                contents: prompt,
            });
            return { result: response.text || "Double Chz Bgr" };
        } catch (apiError) {
            // Fallback
            return { result: productName.substring(0, 10) };
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.code(400).send({ error: "Validation Error", details: error.errors });
        } else {
            request.log.error(error);
            reply.code(500).send({ error: "Internal Server Error" });
        }
    }
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
