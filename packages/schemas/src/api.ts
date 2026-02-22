import { z } from 'zod';

// --- API Request Schemas ---

export const AnalyzePayloadSchema = z.object({
    transactions: z.array(z.any()).optional(), // Refine type later if possible
    menu: z.array(z.any()), // Refine type later if possible
}).strict();

export const KitchenNotePayloadSchema = z.object({
    productName: z.string().min(1),
}).strict();

// --- Domain Entity Schemas ---

export const InventoryItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    type: z.enum(['RAW', 'PREP', 'READY']),
    stockUnit: z.string().min(1),
    costPerUnit: z.number().min(0),
    stockKitchen: z.number().optional(),
    stockStand: z.number().optional(),
    preferredSupplierId: z.string().optional()
}).superRefine((data, ctx) => {
    if (data.type === 'RAW' && (!data.preferredSupplierId || data.preferredSupplierId.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "RAW items MUST have an assigned preferredSupplierId.",
            path: ['preferredSupplierId']
        });
    }
});

export const ProductSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    categoryId: z.string().min(1),
    price: z.number().min(0),
    requiresMods: z.boolean().default(false),
    isActive: z.boolean().default(true),
    kitchenLabel: z.string().optional(),
    packagingSku: z.string().optional(),
    recipeId: z.string().min(1, "Products MUST be linked to an Assembly Recipe."),
    inventoryItemId: z.string().optional() // Direct link for simple items
});

export const CheckoutPayloadSchema = z.object({
    id: z.string(),
    items: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        modifiers: z.string().optional(),
    }).strict()),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    orderType: z.string(),
    payment: z.object({
        method: z.string(),
        amount: z.number(),
        transactionId: z.string().optional(),
    }).strict(),
    staffId: z.string().optional(),
    loyaltyProfileId: z.string().optional(),
    storeId: z.string().optional().default('default-store'),
    terminalId: z.string().optional().default('pos-1'),
}).strict();

export type AnalyzePayload = z.infer<typeof AnalyzePayloadSchema>;
export type KitchenNotePayload = z.infer<typeof KitchenNotePayloadSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
export type ValidatedInventoryItem = z.infer<typeof InventoryItemSchema>;
export type ValidatedProduct = z.infer<typeof ProductSchema>;
