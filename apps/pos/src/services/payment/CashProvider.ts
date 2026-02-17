/**
 * @author Hyphae POS Team
 * @description Cash payment provider implementation.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { PaymentProvider, PaymentResult } from './types';

export class CashProvider implements PaymentProvider {
    name = 'Cash';
    method = 'CASH' as const;

    async process(amount: number, orderId: string): Promise<PaymentResult> {
        console.log(`[Cash] Recording cash payment of $${amount} for order ${orderId}...`);

        // Cash is handled locally and is immediately successful
        return {
            success: true,
            amount,
            method: this.method,
            transactionId: `cash_${Date.now()}`
        };
    }
}
