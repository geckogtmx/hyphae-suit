/**
 * @author Hyphae POS Team
 * @description Payment provider interfaces and types.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { PaymentMethod } from '@hyphae/schemas';

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
    amount: number;
    method: PaymentMethod;
    luckyWinner?: boolean;
}

export interface PaymentProvider {
    /**
     * Human-readable name of the provider (e.g. "Stripe", "Cash")
     */
    name: string;

    /**
     * The payment method this provider handles
     */
    method: PaymentMethod;

    /**
     * Processes a payment for the specified amount
     * @param amount The amount to charge
     * @param orderId Reference order ID
     */
    process(amount: number, orderId: string): Promise<PaymentResult>;
}
