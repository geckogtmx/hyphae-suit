/**
 * @author Hyphae POS Team
 * @description State management for the checkout process, including payment processing.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentProvider, PaymentResult, StripeMockProvider, SquareMockProvider, CashProvider } from '../services/payment';
import { cashDrawer } from '../services/hardware/CashDrawerService';
import { receiptPrinter } from '../services/hardware/ReceiptService';
import { OrderService } from '../services/OrderService';
import { SavedOrder } from '../types';
import { PaymentMethod } from '../types';
import { useToast } from './ToastContext';

interface CheckoutContextType {
    isProcessing: boolean;
    error: string | null;
    paymentProviders: PaymentProvider[];
    processPayment: (method: PaymentMethod, amount: number, orderId: string) => Promise<PaymentResult>;
    resetCheckout: () => void;
    luckyWinner: boolean;
    setLuckyWinner: (val: boolean) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const paymentProviders = [
        new CashProvider(),
        new StripeMockProvider(),
        new SquareMockProvider(),
    ];

    const [luckyWinner, setLuckyWinner] = useState(false);

    const processPayment = async (method: PaymentMethod, amount: number, orderId: string): Promise<PaymentResult> => {
        setIsProcessing(true);
        setError(null);
        setLuckyWinner(false);

        try {
            // Map UI methods to provider methods
            let provider: PaymentProvider | undefined;

            if (method === 'Cash') {
                provider = paymentProviders.find(p => p.method === 'CASH');
            } else if (method === 'Clip') {
                // For now, mapping Clip to Stripe Mock as an example
                provider = paymentProviders.find(p => p.method === 'CARD' && p.name.includes('Stripe'));
            } else {
                // Default to first available card provider or cash
                provider = paymentProviders.find(p => p.method === 'CARD');
            }

            if (!provider) {
                throw new Error(`No payment provider found for method: ${method}`);
            }

            const result = await provider.process(amount, orderId);

            if (!result.success) {
                setError(result.error || 'Payment failed');
                addToast({
                    title: 'Payment Failed',
                    description: result.error || 'The transaction could not be completed.',
                    type: 'error',
                });
            } else {
                addToast({
                    title: 'Payment Successful',
                    description: `Amount: $${amount.toFixed(2)}`,
                    type: 'success',
                });

                if (result.luckyWinner) {
                    setLuckyWinner(true);
                }

                // --- HARDWARE INTEGRATION ---
                if (method === 'Cash') {
                    // 1. Kick Drawer
                    cashDrawer.open().catch(e => console.error('Failed to open drawer:', e));
                }

                // 2. We can't actually print the FULL receipt here because we don't have the final SavedOrder object 
                //    until it's created in `Stage.tsx`. 
                //    However, we *could* print a payment slip if needed.
                //    For now, we'll let Stage handle the full receipt, but we log here.
                console.log('[Checkout] Payment Successful. Hardware triggers ready.');
            }

            return result;
        } catch (err: any) {
            const msg = err.message || 'An unexpected error occurred during payment';
            setError(msg);
            addToast({
                title: 'System Error',
                description: msg,
                type: 'error',
            });
            return { success: false, error: msg, amount, method: 'OTHER' as any };
        } finally {
            setIsProcessing(false);
        }
    };

    const resetCheckout = () => {
        setIsProcessing(false);
        setError(null);
        setLuckyWinner(false);
    };

    return (
        <CheckoutContext.Provider value={{ isProcessing, error, paymentProviders, processPayment, resetCheckout, luckyWinner, setLuckyWinner }}>
            {children}
        </CheckoutContext.Provider>
    );
};

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCheckout must be used within a CheckoutProvider');
    }
    return context;
};
