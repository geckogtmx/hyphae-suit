import React, { useState } from 'react';
import { Bluetooth, Usb, X, AlertCircle, CheckCircle, Printer as PrinterIcon, Receipt } from 'lucide-react';
import { receiptPrinter } from '../services/hardware/ReceiptService';

interface HardwareSettingsModalProps {
    onClose: () => void;
}

export const HardwareSettingsModal: React.FC<HardwareSettingsModalProps> = ({ onClose }) => {
    const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');
    const [activeType, setActiveType] = useState<'bluetooth' | 'usb' | null>(null);

    const handleConnect = async (type: 'bluetooth' | 'usb') => {
        setStatus('CONNECTING');
        setActiveType(type);
        setMessage(`Requesting ${type} device...`);

        try {
            const success = await receiptPrinter.connect(type);
            if (success) {
                setStatus('CONNECTED');
                setMessage(`Successfully connected to ${type} printer.`);
            } else {
                setStatus('ERROR');
                setMessage(`Failed to connect to ${type} printer. See console for details.`);
            }
        } catch (e: any) {
            setStatus('ERROR');
            setMessage(e.message || 'Unknown connection error occurred.');
        }
    };

    const handleTestPrint = async () => {
        const mockOrder = {
            id: `TEST-${Math.floor(Math.random() * 10000)}`,
            userId: 'test',
            time: Date.now(),
            total: 42.00,
            status: 'completed',
            paymentStatus: 'paid',
            items: [
                {
                    id: '1',
                    productId: 'p1',
                    name: 'Diagnostic Print Test',
                    basePrice: 42.00,
                    finalPrice: 42.00,
                    quantity: 1
                }
            ],
            systemInfo: {
                deviceId: 'POS-TEST',
                storeId: 'HYPHAE-HQ',
                version: '1.0.0',
                conceptId: 'test'
            }
        };

        try {
            await receiptPrinter.printReceipt(mockOrder as any);
        } catch (e) {
            console.error('Test print failed:', e);
        }
    };

    const handleDisconnect = () => {
        receiptPrinter.disconnect();
        setStatus('IDLE');
        setActiveType(null);
        setMessage('');
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <h2 className="text-xl font-bold flex items-center text-white">
                        <PrinterIcon className="mr-2 text-brand" size={24} />
                        Hardware Settings
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Status Display */}
                    <div className={`p-4 rounded-xl border flex items-start gap-4 ${status === 'CONNECTED' ? 'bg-emerald-500/10 border-emerald-500/30' :
                            status === 'ERROR' ? 'bg-red-500/10 border-red-500/30' :
                                'bg-black/40 border-white/10'
                        }`}>
                        {status === 'CONNECTED' ? <CheckCircle className="text-emerald-500 mt-0.5" size={20} /> :
                            status === 'ERROR' ? <AlertCircle className="text-red-500 mt-0.5" size={20} /> :
                                status === 'CONNECTING' ? <PrinterIcon className="text-brand mt-0.5 animate-pulse" size={20} /> :
                                    <AlertCircle className="text-gray-500 mt-0.5" size={20} />}

                        <div className="flex-1">
                            <h3 className={`font-bold text-sm ${status === 'CONNECTED' ? 'text-emerald-400' :
                                    status === 'ERROR' ? 'text-red-400' :
                                        'text-gray-300'
                                }`}>
                                {status === 'IDLE' ? 'No Printer Connected' :
                                    status === 'CONNECTING' ? 'Pairing...' :
                                        status === 'ERROR' ? 'Connection Error' :
                                            'Printer Ready'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {message || 'Pair an ESC/POS compatible thermal printer to enable physical receipts and kitchen tickets.'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    {status !== 'CONNECTED' ? (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleConnect('bluetooth')}
                                disabled={status === 'CONNECTING'}
                                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-brand/10 hover:border-brand/40 hover:text-brand transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Bluetooth size={32} className="mb-2 text-gray-400 group-hover:text-brand transition-colors" />
                                <span className="font-bold text-sm">Bluetooth</span>
                                <span className="text-[10px] text-gray-500 text-center mt-1">Wireless ESC/POS</span>
                            </button>

                            <button
                                onClick={() => handleConnect('usb')}
                                disabled={status === 'CONNECTING'}
                                className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/40 hover:text-blue-400 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Usb size={32} className="mb-2 text-gray-400 group-hover:text-blue-400 transition-colors" />
                                <span className="font-bold text-sm">WebUSB</span>
                                <span className="text-[10px] text-gray-500 text-center mt-1">Direct Cable</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleTestPrint}
                                className="w-full flex items-center justify-center p-3 bg-brand/10 border border-brand/30 rounded-xl text-brand hover:bg-brand hover:text-black font-bold transition-all gap-2"
                            >
                                <Receipt size={18} />
                                PRINT DIAGNOSTIC SLIP
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 font-bold text-sm transition-all"
                            >
                                DISCONNECT PRINTER
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
