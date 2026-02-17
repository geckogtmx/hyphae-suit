import { z } from 'zod';

// --- API Request Schemas ---

export const AnalyzePayloadSchema = z.object({
    transactions: z.array(z.any()).optional(), // Refine type later if possible
    menu: z.array(z.any()), // Refine type later if possible
});

export const KitchenNotePayloadSchema = z.object({
    productName: z.string().min(1),
});

export const CheckoutPayloadSchema = z.object({
    id: z.string(),
    items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        modifiers: z.string().optional(),
    })),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    orderType: z.string(),
    payment: z.object({
        method: z.string(),
        amount: z.number(),
        transactionId: z.string().optional(),
    }),
    staffId: z.string().optional(),
    loyaltyProfileId: z.string().optional(),
    storeId: z.string().optional().default('default-store'),
    terminalId: z.string().optional().default('pos-1'),
});

export type AnalyzePayload = z.infer<typeof AnalyzePayloadSchema>;
export type KitchenNotePayload = z.infer<typeof KitchenNotePayloadSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
