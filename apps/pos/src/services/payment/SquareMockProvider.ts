/**
 * @author Hyphae POS Team
 * @description Mock Square payment provider implementation.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { PaymentProvider, PaymentResult } from './types';

export class SquareMockProvider implements PaymentProvider {
    name = 'Square (Mock)';
    method = 'CARD' as const;

    async process(amount: number, orderId: string): Promise<PaymentResult> {
        console.log(`[Square] Processing payment of $${amount} for order ${orderId}...`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return {
            success: true,
            amount,
            method: this.method,
            transactionId: `squr_${Math.random().toString(36).substring(7)}`
        };
    }
}
