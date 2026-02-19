import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Crown } from 'lucide-react';
import { LoyaltyService } from '../services/LoyaltyService';
import TouchKeypad from './TouchKeypad';

interface LuckyWinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LuckyWinnerModal: React.FC<LuckyWinnerModalProps> = ({ isOpen, onClose }) => {
    const [scannedCard, setScannedCard] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'LINKING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    const handleRegister = async () => {
        if (!scannedCard || scannedCard.length < 4) return;
        setStatus('LINKING');
        try {
            await LoyaltyService.registerProfile({
                name: 'Lucky Customer',
                cardNumber: scannedCard
            });
            setStatus('SUCCESS');
            setTimeout(onClose, 2000);
        } catch (err: any) {
            console.error(err);
            setStatus('ERROR');
            setErrorMsg(err.message || 'Card already in use');
        }
    };

    const handleInput = (char: string) => {
        if (scannedCard.length < 12) {
            setScannedCard(prev => prev + char);
            setStatus('IDLE');
        }
    };

    const handleBackspace = () => {
        setScannedCard(prev => prev.slice(0, -1));
        setStatus('IDLE');
    };

    const handleClear = () => {
        setScannedCard('');
        setStatus('IDLE');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-zinc-50 border border-zinc-200 rounded-3xl p-8 shadow-2xl overflow-hidden shadow-black/50"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 z-20"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mb-6 border border-yellow-400/30">
                                <Crown size={40} className="text-yellow-400" />
                            </div>

                            <h2 className="text-3xl font-black text-zinc-900 mb-2 uppercase tracking-widest">
                                Lucky Winner!
                            </h2>
                            <p className="text-zinc-400 mb-8 max-w-xs font-medium">
                                This order has won a <span className="text-yellow-400 font-bold">Loyalty Status</span> upgrade.
                            </p>

                            {status === 'SUCCESS' ? (
                                <div className="flex flex-col items-center animate-in zoom-in py-12">
                                    <CheckCircle size={80} className="text-lime-400 mb-6" />
                                    <p className="text-lime-400 font-bold text-2xl uppercase tracking-widest">Card Activated!</p>
                                    <p className="text-zinc-400 text-sm mt-2">Closing in 2 seconds...</p>
                                </div>
                            ) : (
                                <div className="bg-zinc-100 p-4 rounded-xl border border-zinc-200 w-full mb-2">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 text-center">
                                        Scan or Type New Token
                                    </label>
                                    <div className="h-16 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                                        <span className="font-mono text-3xl tracking-[0.2em] text-zinc-900 font-black uppercase">
                                            {scannedCard || (
                                                <span className="text-zinc-300 text-lg tracking-normal font-sans uppercase opacity-50">
                                                    Enter Token ID
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <TouchKeypad
                                        onInput={handleInput}
                                        onClear={handleClear}
                                        onBackspace={handleBackspace}
                                        onSubmit={handleRegister}
                                        submitDisabled={status === 'LINKING' || !scannedCard}
                                        themeColor="yellow"
                                    />

                                    {status === 'ERROR' && (
                                        <p className="text-red-400 text-xs mt-4 font-bold text-center">{errorMsg}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LuckyWinnerModal;
