import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { z } from 'zod'; // Keep zod for internal validation if needed
import { AnalyzePayloadSchema, CheckoutPayloadSchema } from '@hyphae/schemas';
import { socketService } from './services/SocketService';
import { InventoryService } from './services/InventoryService';
import { db, schema, desc, eq, sql } from '@hyphae/database';

// Load env from current dir OR root fallback (for monorepo convenience)
dotenv.config();

const server = Fastify({
    logger: {
        level: 'info',
        redact: ['req.body.pin', 'body.pin', 'pin'], // Protect PINs from logs
    }
});

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175',
        'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'
    ];

server.register(cors, {
    origin: allowedOrigins, // Configurable via .env
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
});

// Security Headers
server.register(helmet, {
    contentSecurityPolicy: false, // Disable for API-only to avoid complexity with Gemini URLs
});

// Rate Limiting - Optimized for Multiple POS Terminals
server.register(rateLimit, {
    max: 200, // Higher limit to accommodate active shifts across terminals
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'], // Allow local traffic if needed (careful in prod)
    errorResponseBuilder: (request, context) => ({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${context.after}`,
        expiresIn: context.after
    })
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
    if (request.headers.authorization) {
        try {
            await request.jwtVerify();
            return; // Authorized via JWT
        } catch (e) {
            reply.code(401).send({ error: 'Unauthorized: Invalid Token' });
        }
    } else {
        // Strict Mode: Enforce credentials if configured
        if (hyphaeKey) {
            reply.code(401).send({ error: 'Unauthorized: Missing or Invalid Credentials' });
        }
    }
});

// --- GLOBAL ERROR HANDLER ---
server.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Validation Errors (Zod) - handled per-route mostly but this is a safety net
    if (error.validation) {
        return reply.code(400).send({
            error: 'Validation Failed',
            message: error.message,
            details: error.validation
        });
    }

    // Default 500
    const statusCode = error.statusCode || 500;
    const isProd = process.env.NODE_ENV === 'production';

    reply.code(statusCode).send({
        error: error.name || 'Internal Server Error',
        message: isProd ? 'An unexpected error occurred' : error.message,
        ...(isProd ? {} : { stack: error.stack })
    });
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

        // Fetch Loyalty metrics
        const loyaltyCount = await db.select({ count: sql`count(*)` }).from(schema.loyaltyProfiles);
        const totalLoyaltyMembers = (loyaltyCount[0] as any).count || 0;

        const prompt = `
      You are the "Strategic Core" AI for a food business.
      
      Business Health:
      - Total Loyalty Members: ${totalLoyaltyMembers}
      
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

server.post('/api/order/checkout', async (request, reply) => {
    try {
        // Sanitize Payload: Convert explicit 'null' to undefined for optional fields to satisfy Zod
        const rawBody = request.body as any;
        if (rawBody.loyaltyProfileId === null) rawBody.loyaltyProfileId = undefined;
        if (rawBody.staffId === null) rawBody.staffId = undefined;
        if (rawBody.payment && rawBody.payment.transactionId === null) rawBody.payment.transactionId = undefined;

        const payload = CheckoutPayloadSchema.parse(rawBody);

        // 1. Transactional Insert (Drizzle doesn't support nested inserts well with SQLite in one go, so we use manual transaction)
        await db.transaction(async (tx) => {
            // A. Create Order
            await tx.insert(schema.orders).values({
                id: payload.id,
                storeId: payload.storeId || 'default-store',
                terminalId: payload.terminalId || 'pos-1',
                staffId: payload.staffId || null,
                loyaltyProfileId: payload.loyaltyProfileId || null,
                status: 'Pending',
                paymentStatus: 'Paid',
                orderType: payload.orderType || 'DineIn',
                subtotal: payload.subtotal || 0,
                tax: payload.tax || 0,
                total: payload.total || 0,
                createdAt: Date.now(),
            });

            // B. Create Order Items
            for (const item of payload.items) {
                await tx.insert(schema.orderItems).values({
                    id: `oi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    orderId: payload.id,
                    productId: item.productId,
                    name: item.name || 'Unknown Item',
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    modifiers: item.modifiers || null,
                });
            }

            // C. Create Payment Record
            await tx.insert(schema.payments).values({
                id: `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                orderId: payload.id,
                method: payload.payment.method,
                amount: payload.payment.amount || 0,
                status: 'COMPLETED',
                transactionId: payload.payment.transactionId || null,
                timestamp: Date.now(),
            });

            // D. Loyalty Logic
            if (payload.loyaltyProfileId) {
                const pointsToEarn = Math.floor(payload.total);

                // Update Profile
                await tx.update(schema.loyaltyProfiles)
                    .set({
                        currentPoints: sql`${schema.loyaltyProfiles.currentPoints} + ${pointsToEarn}`,
                        totalPunches: sql`${schema.loyaltyProfiles.totalPunches} + 1`
                    })
                    .where(eq(schema.loyaltyProfiles.id, payload.loyaltyProfileId));

                // Record Transaction
                await tx.insert(schema.loyaltyTransactions).values({
                    id: `ltx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    profileId: payload.loyaltyProfileId,
                    type: 'EARN',
                    points: pointsToEarn,
                    orderId: payload.id,
                    timestamp: Date.now(),
                });
            }
        });

        // 2. Async Inventory Deduction (Non-blocking)
        // Note: Handled within Service with its own error handling
        InventoryService.deductOrderInventory(payload.id, payload.items).catch((err: any) => {
            console.error('[CheckoutAPI] Inventory deduction background failure:', err);
        });

        // 3. Lucky Issuance Logic (10% Chance for Guests)
        let luckyCardNumber: string | undefined;
        if (!payload.loyaltyProfileId) {
            const isLucky = Math.random() < 0.1; // 10% chance
            if (isLucky) {
                // Generate a temporary "Claim Me" profile or just return a code?
                // Plan said: Create "Unclaimed" profile.
                luckyCardNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
                const newProfileId = `cust_lucky_${Date.now()}`;

                // We create a shell profile that the cashier can "Swap" into or just link.
                // Actually, the simplest is: POS shows code -> Cashier grabs physical card -> "Register" flow used to claim it?
                // Or: Cashier scans NEW card to claim the "Lucky" status?
                // Let's just return the signal and let POS handle the "Scan to Claim" UI.
                // We won't pre-create the profile here to avoid database litter if ignored.
                // We'll just tell POS "You Won!".
            }
        }

        return {
            success: true,
            orderId: payload.id,
            message: "Order processed successfully",
            luckyWinner: !!luckyCardNumber // Simple boolean trigger for now
        };

    } catch (error) {
        if (error instanceof z.ZodError) {
            reply.code(400).send({ error: "Validation Error", details: error.errors });
        } else {
            request.log.error(error);

            // Return actual error message for debugging
            reply.code(500).send({
                error: "Internal Server Error",
                message: (error as Error).message || "Unknown Error",
                stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
            });
        }
    }
});

// --- CARD SWAP / PHYSICAL TOKEN LINKING ---
server.post('/api/loyalty/swap-card', async (request, reply) => {
    const SwapSchema = z.object({
        currentCardNumber: z.string(),
        newCardNumber: z.string().min(4)
    });

    try {
        const { currentCardNumber, newCardNumber } = SwapSchema.parse(request.body);

        // 1. Verify Old Card Exists
        const oldProfiles = await db.select()
            .from(schema.loyaltyProfiles)
            .where(eq(schema.loyaltyProfiles.cardNumber, currentCardNumber))
            .limit(1);

        const oldProfile = oldProfiles[0];

        if (!oldProfile) {
            return reply.code(404).send({ error: 'Current loyalty profile not found' });
        }

        // 2. Verify New Card is Empty (Not already claimed)
        const newCardProfiles = await db.select()
            .from(schema.loyaltyProfiles)
            .where(eq(schema.loyaltyProfiles.cardNumber, newCardNumber))
            .limit(1);

        if (newCardProfiles.length > 0) {
            return reply.code(409).send({ error: 'New card is already registered' });
        }

        // 3. Perform Swap
        await db.update(schema.loyaltyProfiles)
            .set({
                cardNumber: newCardNumber,
                isPhysicalCard: true // Assume swaps are to physical tokens
            })
            .where(eq(schema.loyaltyProfiles.id, oldProfile.id));

        // 4. Log Event (Optional Transaction or specific log table)
        // For now, simple console log
        request.log.info(`[Loyalty] Swapped Card ${currentCardNumber} -> ${newCardNumber} for ${oldProfile.name}`);

        return { success: true, newCardNumber };

    } catch (e: any) {
        request.log.error(e);
        const msg = e instanceof z.ZodError ? "Validation failed" : (e.message || "Swap failed");
        reply.code(400).send({ error: msg });
    }
});

// --- LOYALTY ROUTES ---

server.get('/api/loyalty/:cardNumber', async (request, reply) => {
    const { cardNumber } = request.params as { cardNumber: string };

    try {
        const results = await db.select()
            .from(schema.loyaltyProfiles)
            .where(eq(schema.loyaltyProfiles.cardNumber, cardNumber))
            .limit(1);

        const profile = results[0];

        if (!profile) {
            return reply.code(404).send({ error: 'Loyalty profile not found' });
        }

        // Fetch transactions separately if needed, or join. 
        // For simplicity and matching previous 'limit 10' logic:
        const transactions = await db.select()
            .from(schema.loyaltyTransactions)
            .where(eq(schema.loyaltyTransactions.profileId, profile.id))
            .orderBy(desc(schema.loyaltyTransactions.timestamp))
            .limit(10);

        return { ...profile, transactions };
    } catch (e) {
        request.log.error(e);
        reply.code(500).send({ error: 'Failed to fetch loyalty profile' });
    }
});

server.get('/api/loyalty/profiles/:id/history', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
        const history = await db.query.loyaltyTransactions.findMany({
            where: eq(schema.loyaltyTransactions.profileId, id),
            orderBy: [desc(schema.loyaltyTransactions.timestamp)],
            limit: 50
        });

        return history;
    } catch (e) {
        request.log.error(e);
        reply.code(500).send({ error: 'Failed to fetch loyalty history' });
    }
});

// --- LOYALTY REGISTRATION ---

server.post('/api/loyalty/register', async (request, reply) => {
    const RegisterSchema = z.object({
        name: z.string().min(2),
        phone: z.string().min(10).optional(),
        email: z.string().email().optional(),
        cardNumber: z.string().min(4).optional() // Optional, auto-generate if missing
    });

    try {
        const payload = RegisterSchema.parse(request.body);

        // Auto-generate card number if not provided
        // Simple 8-char alphanumeric for now
        const cardNumber = payload.cardNumber || Math.random().toString(36).substring(2, 10).toUpperCase();

        // Check for duplicates
        const existing = await db.select()
            .from(schema.loyaltyProfiles)
            .where(eq(schema.loyaltyProfiles.cardNumber, cardNumber))
            .limit(1);

        if (existing.length > 0) {
            return reply.code(409).send({ error: 'Card number already exists' });
        }

        const newProfileId = `cust_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        await db.insert(schema.loyaltyProfiles).values({
            id: newProfileId,
            name: payload.name,
            phone: payload.phone || null,
            email: payload.email || null,
            cardNumber: cardNumber,
            currentPoints: 0,
            totalPunches: 0,
            currentTierId: 'tier_starter',
            createdAt: Date.now()
        });

        // Fetch back to confirm
        const profiles = await db.select()
            .from(schema.loyaltyProfiles)
            .where(eq(schema.loyaltyProfiles.id, newProfileId))
            .limit(1);

        const profile = profiles[0];

        return { success: true, profile };

    } catch (e: any) {
        request.log.error(e);
        const msg = e instanceof z.ZodError ? "Validation failed" : (e.message || "Registration failed");
        reply.code(400).send({ error: msg, details: e });
    }
});

// --- LOYALTY REDEMPTION ---

server.post('/api/loyalty/redeem', async (request, reply) => {
    const RedeemSchema = z.object({
        profileId: z.string(),
        points: z.number().positive(),
        description: z.string().optional()
    });

    try {
        const { profileId, points, description } = RedeemSchema.parse(request.body);

        await db.transaction(async (tx) => {
            const results = await tx.select()
                .from(schema.loyaltyProfiles)
                .where(eq(schema.loyaltyProfiles.id, profileId))
                .limit(1);

            const profile = results[0];

            if (!profile) throw new Error('Profile not found');
            if ((profile.currentPoints || 0) < points) throw new Error('Insufficient points');

            // Deduct Points
            await tx.update(schema.loyaltyProfiles)
                .set({
                    currentPoints: sql`${schema.loyaltyProfiles.currentPoints} - ${points}`
                })
                .where(eq(schema.loyaltyProfiles.id, profileId));

            // Log Transaction
            await tx.insert(schema.loyaltyTransactions).values({
                id: `ltx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                profileId,
                type: 'REDEEM',
                points: -points, // Negative for redemption display logic usually, or keep positive and use type? 
                // Schema comment says "points", usually standardized to inputs. 
                // Let's store as negative to make sum() easy if needed, OR keep positive and rely on type.
                // Looking at EARN in checkout: `points: pointsToEarn` (positive).
                // Let's use NEGATIVE for Redemptions to allow simple SUM queries.
                orderId: null, // Optional connection to order if we had it
                timestamp: Date.now(),
                // Description isn't in schema? 'type' is text. 
                // Wait, schema has NO description field. 
                // 'type' is strict? No, it's text.
                // Let's use 'REDEEM' as type. 
            });
        });

        const updatedProfile = await db.query.loyaltyProfiles.findFirst({
            where: eq(schema.loyaltyProfiles.id, profileId)
        });

        return { success: true, newBalance: updatedProfile?.currentPoints };
    } catch (e: any) {
        request.log.error(e);
        reply.code(400).send({ error: e.message || "Redemption failed" });
    }
});

server.get('/api/loyalty-summary', async (request, reply) => {
    try {
        const totalCount = await db.select({ count: sql`count(*)` }).from(schema.loyaltyProfiles);
        const totalMembers = (totalCount[0] as any).count || 0;

        const recentEnrollments = await db.select({ count: sql`count(*)` })
            .from(schema.loyaltyProfiles)
            .where(sql`${schema.loyaltyProfiles.createdAt} > ${Date.now() - 30 * 24 * 60 * 60 * 1000}`);

        return {
            totalMembers,
            recentEnrollments: (recentEnrollments[0] as any).count || 0
        };
    } catch (e) {
        request.log.error(e);
        reply.code(500).send({
            error: 'Failed to fetch loyalty summary',
            details: (e as Error).message
        });
    }
});

// --- KITCHEN QUEUE ROUTES ---

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

        // Bind to 127.0.0.1 explicitly to match client requests and avoid IPv6 confusion
        await server.listen({ port: PORT, host: '127.0.0.1' });
        console.log(`Server listening on port ${PORT}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
