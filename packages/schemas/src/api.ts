import { z } from 'zod';

// --- API Request Schemas ---

export const AnalyzePayloadSchema = z.object({
    transactions: z.array(z.any()).optional(), // Refine type later if possible
    menu: z.array(z.any()), // Refine type later if possible
});

export const KitchenNotePayloadSchema = z.object({
    productName: z.string().min(1),
});

export type AnalyzePayload = z.infer<typeof AnalyzePayloadSchema>;
export type KitchenNotePayload = z.infer<typeof KitchenNotePayloadSchema>;
