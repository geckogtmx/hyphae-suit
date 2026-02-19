/**
 * @link e:\git\hyphae-pos\src\components\LoyaltyScreen.tsx
 * @author Hyphae POS Team
 * @description Login and lookup screen for loyalty members.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState } from 'react';
import {
  User,
  Crown,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from 'lucide-react';
import TouchKeypad from './TouchKeypad';
import { useLoyalty } from '../hooks/useLoyalty';
import { useMenuData } from '../hooks/useMenuData'; // For Tiers
import SwapCardModal from './SwapCardModal';
import { LoyaltyProfile } from '../types';

interface LoyaltyScreenProps {
  onGuestAccess: () => void;
  onLoginSuccess: (cardNumber: string) => void;
  isAddMode?: boolean;
  onManualIssue?: () => void;
}

const LoyaltyScreen: React.FC<LoyaltyScreenProps> = ({
  onGuestAccess,
  onLoginSuccess,
  isAddMode = false,
  onManualIssue,
}) => {
  const { getProfileByCard, loading } = useLoyalty();
  const { loyaltyTiers } = useMenuData();

  // If in Add Mode, start with input visible
  const [showLoyaltyInput, setShowLoyaltyInput] = useState(isAddMode);

  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'IDLE' | 'FOUND' | 'ERROR'>('IDLE');
  const [previewProfile, setPreviewProfile] = useState<LoyaltyProfile | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  const handleLoyaltyCardInput = (char: string) => {
    if (loyaltyInput.length < 8) {
      setLoyaltyInput((prev) => prev + char);
      setLookupStatus('IDLE');
    }
  };

  const handleLoyaltyBackspace = () => {
    setLoyaltyInput((prev) => prev.slice(0, -1));
    setLookupStatus('IDLE');
  };

  const handleLoyaltyClear = () => {
    setLoyaltyInput('');
    setLookupStatus('IDLE');
  };

  const handleLoyaltySubmit = async () => {
    if (loading) return;

    // SECRET CODE: 0000 triggers new card issuance (Lucky Winner style)
    if (loyaltyInput === '0000' && onManualIssue) {
      onManualIssue();
      setLoyaltyInput('');
      return;
    }

    const foundProfile = await getProfileByCard(loyaltyInput);

    if (foundProfile) {
      setPreviewProfile(foundProfile);
      setLookupStatus('FOUND');
      return;
    }

    // Not found case
    setLookupStatus('ERROR');
    setTimeout(() => {
      setLookupStatus('IDLE');
      setLoyaltyInput('');
    }, 1000);
  };

  const confirmLogin = () => {
    // BACKWARD COMPATIBILITY: API returns flat cardNumber, legacy code expects activeCard.code
    const cardCode = previewProfile?.activeCard?.code || previewProfile?.cardNumber;

    if (previewProfile && cardCode) {
      onLoginSuccess(cardCode);
      setLoyaltyInput('');
      setLookupStatus('IDLE');
      setPreviewProfile(null);
      setShowLoyaltyInput(isAddMode); // Reset to default based on mode
    }
  };

  const cancelLogin = () => {
    setLookupStatus('IDLE');
    setPreviewProfile(null);
    setLoyaltyInput('');
  };

  const handleBack = () => {
    if (isAddMode) {
      // If we are in add mode, 'Back' means cancel the add action entirely
      onGuestAccess();
    } else {
      // Otherwise go back to splash
      setShowLoyaltyInput(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-100 transition-colors h-full w-full">
      {!showLoyaltyInput ? (
        <div className="flex gap-8 w-full max-w-4xl h-96">
          <button
            onClick={onGuestAccess}
            className="flex-1 bg-zinc-50 border-2 border-zinc-200 hover:border-blue-400/50 hover:bg-zinc-100/50 rounded-3xl flex flex-col items-center justify-center group transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden"
          >
            <div className="w-32 h-32 bg-blue-400/10 rounded-full flex items-center justify-center mb-8 shadow-lg group-hover:scale-105 transition-transform duration-300 border border-blue-400/30">
              <User
                size={56}
                className="text-blue-400"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-4xl font-black tracking-[0.2em] text-zinc-900 group-hover:text-white mb-4 transition-colors">
              GUEST
            </span>
            <span className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
              Quick Order
            </span>
          </button>

          <button
            onClick={() => setShowLoyaltyInput(true)}
            className="flex-1 bg-zinc-50 border-2 border-zinc-200 hover:border-lime-400/50 hover:bg-zinc-100/50 rounded-3xl flex flex-col items-center justify-center group transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden"
          >
            <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mb-8 shadow-2xl group-hover:scale-105 transition-transform duration-300 border border-white/5">
              <Crown
                size={56}
                className="text-zinc-900"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-4xl font-black tracking-[0.2em] text-zinc-900 mb-4">
              CARD
            </span>
            <span className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
              Loyalty Member
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md animate-in zoom-in-95 duration-200 h-full justify-center">
          {lookupStatus === 'FOUND' && previewProfile ? (
            <div className="w-full bg-zinc-50 rounded-3xl p-6 border-2 border-lime-400/50 shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom duration-300">
              <div className="h-16 w-16 bg-lime-400/10 rounded-full flex items-center justify-center mb-4 text-lime-400 shadow-lg ring-1 ring-lime-400/20">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">
                Welcome Back
              </h3>
              <h2 className="text-3xl font-black text-zinc-900 mb-2 text-center">
                {previewProfile.name}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-yellow-400 text-zinc-50 font-bold rounded-full text-xs uppercase tracking-wider shadow-sm flex items-center">
                  <Crown size={12} className="mr-1 fill-current" />{' '}
                  {loyaltyTiers.find((t) => t.id === previewProfile.currentTierId)?.name ||
                    'Member'}
                </span>
                <span className="text-zinc-300 text-xs">|</span>
                <span className="text-zinc-400 font-mono text-xs">
                  {previewProfile.currentPoints.toFixed(0)} PTS
                </span>
              </div>

              {/* TRANSACTION PREVIEW */}
              {previewProfile.recentTransactions &&
                previewProfile.recentTransactions.length > 0 && (
                  <div className="w-full bg-zinc-100 rounded-xl p-3 border border-zinc-200 mb-6">
                    <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center">
                      <Activity size={10} className="mr-1" /> Recent Activity
                    </div>
                    <div className="space-y-2">
                      {previewProfile.recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center text-zinc-400">
                            {tx.type === 'EARN' ? (
                              <ArrowUpRight size={12} className="text-lime-400 mr-1.5" />
                            ) : (
                              <ArrowDownLeft size={12} className="text-blue-400 mr-1.5" />
                            )}
                            <span>{tx.description}</span>
                          </div>
                          <span
                            className={`font-mono font-bold ${tx.points > 0 ? 'text-lime-400' : 'text-blue-400'}`}
                          >
                            {tx.points > 0 ? '+' : ''}
                            {tx.points.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="w-full space-y-3">
                <button
                  onClick={confirmLogin}
                  className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-zinc-50 rounded-xl font-bold text-lg uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Start Order <ArrowRight size={20} className="ml-2" />
                </button>
                <button
                  onClick={cancelLogin}
                  className="w-full py-3 bg-zinc-100 text-zinc-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Not you? Back
                </button>
              </div>

              {/* MANAGER ACTIONS */}
              <div className="w-full mt-2 pt-2 border-t border-zinc-200 flex justify-center">
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="text-[10px] items-center text-zinc-400 hover:text-blue-400 flex gap-1 uppercase font-bold tracking-widest transition-colors"
                >
                  <RefreshCw size={12} /> Swap Physical Card
                </button>
              </div>

              <SwapCardModal
                isOpen={showSwapModal}
                onClose={() => setShowSwapModal(false)}
                currentCard={loyaltyInput}
                onSuccess={(newCard) => {
                  setLoyaltyInput(newCard);
                  setShowSwapModal(false);
                  handleLoyaltySubmit();
                }}
              />
            </div>
          ) : (
            <>
              <div className="w-full flex items-center gap-4 mb-6">
                <button
                  onClick={handleBack}
                  className="h-14 w-14 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors"
                  title={isAddMode ? 'Cancel' : 'Back'}
                >
                  <ArrowLeft size={24} />
                </button>
                <div
                  className={`flex-1 h-14 bg-zinc-50 border-b-2 flex items-center justify-center relative overflow-hidden transition-colors ${lookupStatus === 'ERROR' ? 'border-red-400 bg-red-400/10 animate-[shake_0.5s_ease-in-out]' : 'border-lime-400'}`}
                >
                  {lookupStatus === 'ERROR' ? (
                    <span className="font-bold text-red-500 uppercase tracking-widest text-sm flex items-center">
                      <XCircle size={16} className="mr-2" /> CARD NOT FOUND
                    </span>
                  ) : (
                    <span className="font-mono text-3xl tracking-[0.2em] text-zinc-900 font-black uppercase transition-all">
                      {loyaltyInput || (
                        <span className="text-zinc-200 text-lg tracking-normal font-sans uppercase">
                          Enter Card ID
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full bg-zinc-100/50 rounded-2xl p-4 border border-zinc-200 shadow-2xl">
                <TouchKeypad
                  onInput={handleLoyaltyCardInput}
                  onClear={handleLoyaltyClear}
                  onBackspace={handleLoyaltyBackspace}
                  onSubmit={handleLoyaltySubmit}
                  submitDisabled={loyaltyInput.length === 0}
                  themeColor="lime"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LoyaltyScreen;
