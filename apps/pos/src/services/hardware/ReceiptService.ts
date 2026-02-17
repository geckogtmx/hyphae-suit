/**
 * @author Hyphae POS Team
 * @description Hardware abstraction for Thermal Receipt Printers.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { SavedOrder } from '../../types';

export interface PrintOptions {
    copies?: number;
    printLogo?: boolean;
}

export interface IReceiptService {
    printReceipt(order: SavedOrder, options?: PrintOptions): Promise<boolean>;
    printKitchenTicket(order: SavedOrder): Promise<boolean>;
}

export class ReceiptService implements IReceiptService {
    /**
     * Generates a thermal receipt layout and sends it to the printer.
     * Currently mocks the output to console.
     */
    async printReceipt(order: SavedOrder, options?: PrintOptions): Promise<boolean> {
        const { copies = 1 } = options || {};

        console.group(`[ReceiptService] Printing ${copies} copie(s) for Order #${order.id}`);
        console.log(`STORE: ${order.systemInfo.storeId}`);
        console.log(`TIME: ${order.time}`);
        console.log('--------------------------------');
        order.items.forEach(item => {
            console.log(`${item.quantity || 1}x ${item.name} ... $${item.finalPrice.toFixed(2)}`);
        });
        console.log('--------------------------------');
        console.log(`TOTAL: $${order.total.toFixed(2)}`);
        console.log(`PAYMENT: ${order.paymentStatus}`);
        console.groupEnd();

        return true;
    }

    async printKitchenTicket(order: SavedOrder): Promise<boolean> {
        console.log(`[ReceiptService] KITCHEN TICKET FOR #${order.id} SENT.`);
        return true;
    }
}

export const receiptPrinter = new ReceiptService();
