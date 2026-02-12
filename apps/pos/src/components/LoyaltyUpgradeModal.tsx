/**
 * @link e:\git\hyphae-pos\src\components\LoyaltyUpgradeModal.tsx
 * @author Hyphae POS Team
 * @description Notification and card linking for tier upgrades.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState } from 'react';
import { useOrder } from '../context/OrderContext';
import { Crown, ArrowRight, CreditCard, X, AlertTriangle } from 'lucide-react';
import { LOYALTY_TIERS } from '../data/mock_data';

const LoyaltyUpgradeModal = () => {
  const { state, dispatch } = useOrder();
  const { upgradeTriggered } = state;
  const [newCardInput, setNewCardInput] = useState('');

  if (!upgradeTriggered) return null;

  const { profile, newTier, prevTier } = upgradeTriggered;

  const oldTierData = LOYALTY_TIERS.find((t) => t.id === prevTier);
  const newTierData = LOYALTY_TIERS.find((t) => t.id === newTier);

  const handleInput = (char: string) => {
    if (newCardInput.length < 8) {
      setNewCardInput((prev) => prev + char);
    }
  };

  const handleBackspace = () => setNewCardInput((prev) => prev.slice(0, -1));

  const handleConfirm = () => {
    if (newCardInput.length === 8) {
      dispatch({ type: 'CONFIRM_TIER_UPGRADE', payload: { newCardNumber: newCardInput } });
    }
  };

  // Numpad + Alpha keys similar to Stage
  const KEYBOARD_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const KEYBOARD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-lime-900/50 to-zinc-900 p-6 flex items-center justify-between border-b border-lime-500/30">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-lime-400 text-zinc-900 flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.4)] animate-bounce">
              <Crown size={32} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-wider">
                Tier Upgrade!
              </h2>
              <p className="text-lime-400 font-mono text-sm">
                Customer has reached the next level.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 flex gap-8">
          {/* LEFT: INFO */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Customer
              </span>
              <div className="text-xl font-bold text-white">{profile.name}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 p-4 bg-zinc-950 rounded-xl border border-zinc-800 opacity-60">
                <span className="text-xs text-zinc-500 uppercase block mb-1">Current Tier</span>
                <span className={`text-lg font-bold text-${oldTierData?.color || 'zinc-400'}`}>
                  {oldTierData?.name}
                </span>
              </div>
              <ArrowRight className="text-lime-400" />
              <div className="flex-1 p-4 bg-zinc-950 rounded-xl border border-lime-500/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-lime-400/5" />
                <span className="text-xs text-lime-400 uppercase block mb-1 font-bold">
                  New Tier
                </span>
                <span
                  className={`text-xl font-bold text-${newTierData?.color || 'white'} uppercase`}
                >
                  {newTierData?.name}
                </span>
              </div>
            </div>

            <div className="p-4 bg-red-900/10 border border-red-900/30 rounded-xl flex items-start space-x-3">
              <AlertTriangle className="text-red-400 shrink-0" size={20} />
              <div className="text-sm text-red-200">
                <strong className="block text-red-400 uppercase text-xs mb-1">
                  Action Required
                </strong>
                Recover card{' '}
                <span className="font-mono font-bold">{profile.activeCard?.code || 'NO_CARD'}</span>{' '}
                from customer and destroy/recycle it.
              </div>
            </div>
          </div>

          {/* RIGHT: INPUT */}
          <div className="flex-[1.5] bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center">
              <CreditCard size={16} className="mr-2" /> Scan/Enter New {newTierData?.name} Card
            </label>

            <div className="bg-zinc-900 border-2 border-zinc-700 rounded-xl p-4 mb-4 text-center">
              <span className="font-mono text-3xl font-bold tracking-widest text-white">
                {newCardInput || <span className="opacity-20">--------</span>}
              </span>
            </div>

            {/* MINI KEYPAD */}
            <div className="grid grid-cols-5 gap-1 mb-2">
              {KEYBOARD_NUMBERS.map((k) => (
                <button
                  key={k}
                  onClick={() => handleInput(k)}
                  className="h-10 bg-zinc-800 rounded font-mono font-bold text-zinc-300 hover:bg-zinc-700"
                >
                  {k}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1 mb-4">
              {KEYBOARD_LETTERS.map((k) => (
                <button
                  key={k}
                  onClick={() => handleInput(k)}
                  className="h-10 bg-zinc-800 rounded font-mono font-bold text-zinc-400 hover:bg-zinc-700"
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleBackspace}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg py-3 font-bold uppercase text-xs"
              >
                Correction
              </button>
              <button
                onClick={handleConfirm}
                disabled={newCardInput.length !== 8}
                className={`flex-[2] rounded-lg py-3 font-bold uppercase text-xs transition-all
                            ${newCardInput.length === 8 ? 'bg-lime-500 hover:bg-lime-400 text-zinc-900 shadow-lg' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}
                        `}
              >
                Link & Activate
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'DISMISS_UPGRADE' })}
          className="absolute top-4 right-4 text-zinc-600 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default LoyaltyUpgradeModal;
