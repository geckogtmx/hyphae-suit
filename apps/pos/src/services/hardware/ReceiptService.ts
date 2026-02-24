/**
 * @author Hyphae POS Team
 * @description Hardware abstraction for Thermal Receipt Printers using Web Bluetooth / Web USB.
 * @version 1.0.0
 * @last-updated 2026-02-24
 */

import { SavedOrder } from '../../types';

export interface PrintOptions {
    copies?: number;
    printLogo?: boolean;
    connectionType?: 'bluetooth' | 'usb';
}

export interface IReceiptService {
    connect(type?: 'bluetooth' | 'usb'): Promise<boolean>;
    printReceipt(order: SavedOrder, options?: PrintOptions): Promise<boolean>;
    printKitchenTicket(order: SavedOrder): Promise<boolean>;
    disconnect(): void;
}

// Basic ESC/POS commands
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;
const INIT = [ESC, 0x40];
const ALIGN_LEFT = [ESC, 0x61, 0x00];
const ALIGN_CENTER = [ESC, 0x61, 0x01];
const ALIGN_RIGHT = [ESC, 0x61, 0x02];
const BOLD_ON = [ESC, 0x45, 0x01];
const BOLD_OFF = [ESC, 0x45, 0x00];
const TEXT_DOUBLE_W_H = [GS, 0x21, 0x11];
const TEXT_NORMAL = [GS, 0x21, 0x00];
const CUT_PAPER = [GS, 0x56, 0x41, 0x03]; // Full cut with feed

class EscPosEncoder {
    private buffer: number[] = [];

    init() { this.buffer.push(...INIT); return this; }
    text(str: string) {
        // Simple ASCII encoding
        for (let i = 0; i < str.length; i++) {
            this.buffer.push(str.charCodeAt(i));
        }
        return this;
    }
    newline(lines = 1) {
        for (let i = 0; i < lines; i++) this.buffer.push(LF);
        return this;
    }
    line(str: string) { this.text(str).newline(); return this; }
    alignCenter() { this.buffer.push(...ALIGN_CENTER); return this; }
    alignLeft() { this.buffer.push(...ALIGN_LEFT); return this; }
    alignRight() { this.buffer.push(...ALIGN_RIGHT); return this; }
    boldOn() { this.buffer.push(...BOLD_ON); return this; }
    boldOff() { this.buffer.push(...BOLD_OFF); return this; }
    sizeDouble() { this.buffer.push(...TEXT_DOUBLE_W_H); return this; }
    sizeNormal() { this.buffer.push(...TEXT_NORMAL); return this; }
    cut() { this.buffer.push(...CUT_PAPER); return this; }

    // Draw a dotted line separator
    separator(width = 32) {
        this.line('-'.repeat(width));
        return this;
    }

    encode(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
}

export class ReceiptService implements IReceiptService {
    private btDevice: any = null;
    private btCharacteristic: any = null;

    private usbDevice: any = null;

    /**
     * Connects to a printer using either Web Bluetooth or Web USB API
     */
    async connect(type: 'bluetooth' | 'usb' = 'bluetooth'): Promise<boolean> {
        try {
            if (type === 'bluetooth') {
                return await this.connectBluetooth();
            } else {
                return await this.connectUSB();
            }
        } catch (e) {
            console.error(`[ReceiptService] ${type} connection failed:`, e);
            return false;
        }
    }

    private async connectBluetooth(): Promise<boolean> {
        if (!(navigator as any).bluetooth) {
            throw new Error('Web Bluetooth API not supported in this browser.');
        }

        const device = await (navigator as any).bluetooth.requestDevice({
            // Accept all devices but ask for Generic Serial or Printer services
            acceptAllDevices: true,
            optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '49535343-fe7d-4ae5-8fa9-9fafd205e455'] // Standard printer UUID & generic SPP
        });

        const server = await device.gatt.connect();
        let activeCharacteristic = null;

        // Try standard ESCPOS UUID
        try {
            const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
            const characteristics = await service.getCharacteristics();
            activeCharacteristic = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
        } catch (e) {
            // Fallback for some non-standard SPP profiles
            const services = await server.getPrimaryServices();
            for (const s of services) {
                const chars = await s.getCharacteristics();
                const writable = chars.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
                if (writable) {
                    activeCharacteristic = writable;
                    break;
                }
            }
        }

        if (!activeCharacteristic) {
            throw new Error('Could not find writable characteristic on the Bluetooth device.');
        }

        this.btDevice = device;
        this.btCharacteristic = activeCharacteristic;
        return true;
    }

    private async connectUSB(): Promise<boolean> {
        if (!(navigator as any).usb) {
            throw new Error('Web USB API not supported in this browser.');
        }

        // Printer interface class is 7
        const device = await (navigator as any).usb.requestDevice({
            filters: [{ classCode: 7 }]
        });

        await device.open();
        // Select the configuration and interface
        await device.selectConfiguration(1);
        await device.claimInterface(0);

        this.usbDevice = device;
        return true;
    }

    disconnect(): void {
        if (this.btDevice && this.btDevice.gatt.connected) {
            this.btDevice.gatt.disconnect();
            this.btDevice = null;
            this.btCharacteristic = null;
        }
        if (this.usbDevice && this.usbDevice.opened) {
            this.usbDevice.close();
            this.usbDevice = null;
        }
    }

    private async printRaw(data: Uint8Array): Promise<boolean> {
        try {
            if (this.btCharacteristic) {
                // BLE usually has MTU limits, chunk the data
                const chunkSize = 512;
                for (let i = 0; i < data.length; i += chunkSize) {
                    const chunk = data.slice(i, i + chunkSize);
                    await this.btCharacteristic.writeValue(chunk);
                }
                return true;
            } else if (this.usbDevice) {
                // USB interface 0, out endpoint (usually 1 or 2)
                const endpoints = this.usbDevice.configuration.interfaces[0].alternate.endpoints;
                const outEndpoint = endpoints.find((e: any) => e.direction === 'out');
                if (!outEndpoint) throw new Error('No OUT endpoint found for USB device.');

                await this.usbDevice.transferOut(outEndpoint.endpointNumber, data);
                return true;
            } else {
                console.warn('[ReceiptService] Printer not connected. Dumping receipt to console.');
                return false;
            }
        } catch (e) {
            console.error('[ReceiptService] Raw printing failed:', e);
            return false;
        }
    }

    /**
     * Generates a thermal receipt layout and sends it to the ESC/POS printer.
     */
    async printReceipt(order: SavedOrder, options?: PrintOptions): Promise<boolean> {
        const encoder = new EscPosEncoder();

        encoder.init()
            .alignCenter()
            .sizeDouble()
            .boldOn()
            .line(`STORE ${order.systemInfo.storeId || 'HYPHAE'}`)
            .sizeNormal()
            .boldOff()
            .line(`Hyphae Suite - POS Platform`)
            .newline()
            .alignLeft()
            .line(`Order #: ${order.id.slice(0, 8)}`)
            .line(`Time: ${new Date(order.time).toLocaleString()}`)
            .line(`Payment: ${order.paymentStatus.toUpperCase()}`)
            .separator();

        order.items.forEach(item => {
            const quantityStr = `${item.quantity || 1}x `;
            const priceStr = `$${item.finalPrice.toFixed(2)}`;
            const nameSpace = 32 - quantityStr.length - priceStr.length;

            // Truncate name if it's too long for the line
            let itemLine = quantityStr + item.name.substring(0, Math.max(0, nameSpace - 1)).padEnd(Math.max(0, nameSpace), ' ') + priceStr;
            encoder.line(itemLine);

            // Render modifiers indented
            if (item.selectedModifiers && item.selectedModifiers.length > 0) {
                item.selectedModifiers.forEach(mod => {
                    const modName = `  + ${mod.name}`;
                    const modPrice = mod.price > 0 ? `$${mod.price.toFixed(2)}` : '';
                    const mSpace = 32 - modName.length - modPrice.length;

                    let modLine = modName.substring(0, Math.max(0, mSpace - 1)).padEnd(Math.max(0, mSpace), ' ') + modPrice;
                    encoder.line(modLine);
                });
            }
        });

        encoder.separator()
            .alignRight()
            .sizeDouble()
            .boldOn()
            .line(`TOTAL: $${order.total.toFixed(2)}`)
            .sizeNormal()
            .boldOff()
            .alignCenter()
            .newline(2)
            .line('Thank you for dining with us!')
            .line('Powered by Hyphae Engine')
            .newline(3)
            .cut();

        const rawBytes = encoder.encode();
        const printed = await this.printRaw(rawBytes);

        if (!printed) {
            // Mock output if no printer is connected
            console.group(`[ReceiptService Mock] Order #${order.id}`);
            console.log(`TOTAL: $${order.total.toFixed(2)} [MOCK ESC/POS]`);
            console.log(new TextDecoder().decode(rawBytes));
            console.groupEnd();
        }

        return true;
    }

    async printKitchenTicket(order: SavedOrder): Promise<boolean> {
        const encoder = new EscPosEncoder();

        encoder.init()
            .alignCenter()
            .sizeDouble()
            .boldOn()
            .line(`KITCHEN TICKET`)
            .sizeNormal()
            .boldOff()
            .newline()
            .alignLeft()
            .line(`Order #: ${order.id.slice(0, 8)}`)
            .line(`Time: ${new Date(order.time).toLocaleTimeString()}`)
            .separator();

        order.items.forEach(item => {
            encoder.sizeDouble()
                .boldOn()
                .line(`${item.quantity || 1}x ${item.name}`)
                .sizeNormal()
                .boldOff();

            if (item.selectedModifiers && item.selectedModifiers.length > 0) {
                item.selectedModifiers.forEach(mod => {
                    encoder.line(`  > ${mod.name}`);
                });
            }
            encoder.newline();
        });

        encoder.separator()
            .newline(3)
            .cut();

        const rawBytes = encoder.encode();
        const printed = await this.printRaw(rawBytes);

        if (!printed) {
            console.log(`[ReceiptService Mock] KITCHEN TICKET FOR #${order.id} SENT.`);
            console.log(new TextDecoder().decode(rawBytes));
        }
        return true;
    }
}

export const receiptPrinter = new ReceiptService();
