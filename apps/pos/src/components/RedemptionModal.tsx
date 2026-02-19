/**
 * @author Hyphae POS Team
 * @description Modal for redeeming loyalty points.
 * @version 1.0.0
 * @last-updated 2026-02-19
 */

import React, { useState } from 'react';
import { X, Gift, CheckCircle } from 'lucide-react';
import { LoyaltyProfile } from '../types';
import { LoyaltyService } from '../services/LoyaltyService';
import { useToast } from '../context/ToastContext';

interface RedemptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: LoyaltyProfile;
    onRedeemSuccess: (newBalance: number) => void;
}

const RedemptionModal: React.FC<RedemptionModalProps> = ({
    isOpen,
    onClose,
    profile,
    onRedeemSuccess,
}) => {
    const [pointsToRedeem, setPointsToRedeem] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const { addToast } = useToast();

    if (!isOpen) return null;

    const points = parseInt(pointsToRedeem) || 0;
    const isValid = points > 0 && points <= (profile.currentPoints || 0);

    const handleRedeem = async () => {
        if (!isValid) return;

        setIsProcessing(true);
        try {
            const result = await LoyaltyService.redeemPoints(profile.id, points);
            if (result.success && result.newBalance !== undefined) {
                addToast({
                    title: 'Redemption Successful',
                    description: `Redeemed ${points} points. New Balance: ${result.newBalance}`,
                    type: 'success',
                });
                onRedeemSuccess(result.newBalance);
                onClose();
            }
        } catch (error: any) {
            addToast({
                title: 'Redemption Failed',
                description: error.message,
                type: 'error',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-zinc-50 dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <Gift className="text-purple-500" size={24} />
                        <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200">Redeem Points</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors">
                        <X size={20} className="text-zinc-500" />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div className="text-center mb-6">
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono uppercase tracking-wide mb-1">Available Balance</p>
                        <div className="text-4xl font-bold text-zinc-900 dark:text-white font-mono">
                            {Math.floor(profile.currentPoints)} <span className="text-lg text-zinc-400">PTS</span>
                        </div>
                    </div>

                    <div className="w-full mb-6">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Points to Redeem</label>
                        <input
                            type="number"
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(e.target.value)}
                            placeholder="0"
                            className="w-full text-center text-3xl font-bold p-4 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="w-full grid grid-cols-4 gap-2 mb-6">
                        {[10, 50, 100, 500].map(amt => (
                            <button
                                key={amt}
                                onClick={() => setPointsToRedeem(amt.toString())}
                                disabled={amt > profile.currentPoints}
                                className={`py-2 rounded-lg font-bold text-xs border border-zinc-200 dark:border-zinc-700 ${amt > profile.currentPoints ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 active:bg-zinc-200 dark:active:bg-zinc-700'}`}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRedeem}
                        disabled={!isValid || isProcessing}
                        className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all
                    ${isValid && !isProcessing
                                ? 'bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.98]'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'}
                `}
                    >
                        {isProcessing ? 'Processing...' : (
                            <>
                                <CheckCircle size={20} /> Redeem
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RedemptionModal;
