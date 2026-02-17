/**
 * @author Hyphae POS Team
 * @description Hardware abstraction for Cash Drawer management.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

export interface ICashDrawerService {
    open(): Promise<boolean>;
    getStatus(): Promise<'OPEN' | 'CLOSED' | 'UNKNOWN'>;
}

export class CashDrawerService implements ICashDrawerService {
    private status: 'OPEN' | 'CLOSED' | 'UNKNOWN' = 'CLOSED';

    /**
     * Triggers the cash drawer kick solenoid.
     * In a real app, this would talk to:
     * 1. Window.print() (legacy kick codes)
     * 2. WebSerial API (direct serial)
     * 3. Local Hardware Bridge (Electron/Node)
     */
    async open(): Promise<boolean> {
        console.log('[CashDrawer] Kicking drawer open...');
        this.status = 'OPEN';

        // Simulate hardware delay
        await new Promise(resolve => setTimeout(resolve, 200));

        // Simulate auto-close event listening (mock)
        setTimeout(() => {
            this.status = 'CLOSED';
            console.log('[CashDrawer] Drawer closed.');
        }, 5000);

        return true;
    }

    async getStatus(): Promise<'OPEN' | 'CLOSED' | 'UNKNOWN'> {
        return this.status;
    }
}

export const cashDrawer = new CashDrawerService();
