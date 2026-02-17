/**
 * @author Hyphae POS Team
 * @description Mock Stripe payment provider implementation.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { PaymentProvider, PaymentResult } from './types';

export class StripeMockProvider implements PaymentProvider {
    name = 'Stripe (Mock)';
    method = 'CARD' as const;

    async process(amount: number, orderId: string): Promise<PaymentResult> {
        console.log(`[Stripe] Processing payment of $${amount} for order ${orderId}...`);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple mock logic: fail if amount is exactly 99.99
        if (amount === 99.99) {
            return {
                success: false,
                amount,
                method: this.method,
                error: 'Insufficient Funds (Mock Error)'
            };
        }

        return {
            success: true,
            amount,
            method: this.method,
            transactionId: `strp_${Math.random().toString(36).substring(7)}`
        };
    }
}
