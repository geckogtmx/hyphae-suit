import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, RefreshCw } from 'lucide-react';
import { LoyaltyService } from '../services/LoyaltyService';
import TouchKeypad from './TouchKeypad';

interface SwapCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCard: string;
    onSuccess: (newCard: string) => void;
}

const SwapCardModal: React.FC<SwapCardModalProps> = ({ isOpen, onClose, currentCard, onSuccess }) => {
    const [newCard, setNewCard] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'SWAPPING' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    const handleInput = (char: string) => {
        if (newCard.length < 12) {
            setNewCard(prev => prev + char);
            setStatus('IDLE');
        }
    };

    const handleBackspace = () => {
        setNewCard(prev => prev.slice(0, -1));
        setStatus('IDLE');
    };

    const handleClear = () => {
        setNewCard('');
        setStatus('IDLE');
    };

    const handleSwap = async () => {
        if (!newCard || newCard.length < 4) return;
        setStatus('SWAPPING');
        setErrorMsg('');

        try {
            await LoyaltyService.swapCard(currentCard, newCard);
            onSuccess(newCard);
            onClose();
        } catch (err: any) {
            console.error(err);
            setStatus('ERROR');
            setErrorMsg(err.message || 'Swap failed. Check if card is already in use.');
        }
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
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-2xl overflow-hidden shadow-black/50"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center mb-4 border border-blue-400/30">
                                <RefreshCw size={32} className="text-blue-400" />
                            </div>

                            <h2 className="text-xl font-black text-zinc-900 mb-1 uppercase tracking-widest">Swap Physical Card</h2>
                            <p className="text-zinc-400 text-sm mb-6 font-medium">
                                Transfer <span className="font-mono text-zinc-900 bg-zinc-100 px-1 rounded">{currentCard}</span> to new token.
                            </p>

                            <div className="w-full">
                                <div className="bg-zinc-100 p-4 rounded-xl border border-zinc-200 mb-4">
                                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                        <CreditCard size={14} /> Scan or Type New Token
                                    </label>

                                    <div className="h-16 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                                        <span className="font-mono text-3xl tracking-[0.2em] text-zinc-900 font-black uppercase transition-all">
                                            {newCard || (
                                                <span className="text-zinc-300 text-lg tracking-normal opacity-50 font-sans uppercase">
                                                    Enter Token ID
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    <TouchKeypad
                                        onInput={handleInput}
                                        onClear={handleClear}
                                        onBackspace={handleBackspace}
                                        onSubmit={handleSwap}
                                        submitDisabled={status === 'SWAPPING' || !newCard}
                                        themeColor="blue"
                                    />

                                    {status === 'ERROR' && (
                                        <p className="text-red-400 text-xs mt-4 font-bold text-center animate-pulse">{errorMsg}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SwapCardModal;
