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
  Eraser,
  Delete,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useLoyalty } from '../hooks/useLoyalty';
import { useMenuData } from '../hooks/useMenuData'; // For Tiers
import { LoyaltyProfile } from '../types';

interface LoyaltyScreenProps {
  onGuestAccess: () => void;
  onLoginSuccess: (cardNumber: string) => void;
  isAddMode?: boolean;
}

const LoyaltyScreen: React.FC<LoyaltyScreenProps> = ({
  onGuestAccess,
  onLoginSuccess,
  isAddMode = false,
}) => {
  const { getProfileByCard } = useLoyalty();
  const { loyaltyTiers } = useMenuData();

  // If in Add Mode, start with input visible
  const [showLoyaltyInput, setShowLoyaltyInput] = useState(isAddMode);

  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [lookupStatus, setLookupStatus] = useState<'IDLE' | 'FOUND' | 'ERROR'>('IDLE');
  const [previewProfile, setPreviewProfile] = useState<LoyaltyProfile | null>(null);

  const KEYBOARD_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const KEYBOARD_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

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

  const handleLoyaltySubmit = () => {
    const foundProfile = getProfileByCard(loyaltyInput);

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
    if (previewProfile && previewProfile.activeCard) {
      onLoginSuccess(previewProfile.activeCard.code);
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors h-full w-full">
      {!showLoyaltyInput ? (
        <div className="flex gap-8 w-full max-w-4xl h-96">
          <button
            onClick={onGuestAccess}
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-3xl flex flex-col items-center justify-center group transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden"
          >
            <div className="w-32 h-32 bg-blue-100 dark:bg-blue-600 rounded-full flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <User
                size={56}
                className="text-blue-600 dark:text-white fill-current"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-4xl font-bold tracking-widest text-zinc-400 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white mb-4">
              GUEST
            </span>
            <span className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
              Quick Order
            </span>
          </button>

          <button
            onClick={() => setShowLoyaltyInput(true)}
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-lime-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-3xl flex flex-col items-center justify-center group transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden"
          >
            <div className="w-32 h-32 bg-red-100 dark:bg-red-600 rounded-full flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Crown
                size={56}
                className="text-red-600 dark:text-white fill-current"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-4xl font-bold tracking-widest text-zinc-400 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white mb-4">
              CARD
            </span>
            <span className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
              Loyalty Member
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md animate-in zoom-in-95 duration-200 h-full justify-center">
          {lookupStatus === 'FOUND' && previewProfile ? (
            <div className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 rounded-3xl p-6 border-2 border-lime-500/50 shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom duration-300">
              <div className="h-16 w-16 bg-lime-100 dark:bg-lime-900/30 rounded-full flex items-center justify-center mb-4 text-lime-600 dark:text-lime-400 shadow-lg">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                Welcome Back
              </h3>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
                {previewProfile.name}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-yellow-400 text-zinc-900 font-bold rounded-full text-xs uppercase tracking-wider shadow-sm flex items-center">
                  <Crown size={12} className="mr-1 fill-current" />{' '}
                  {loyaltyTiers.find((t) => t.id === previewProfile.currentTierId)?.name ||
                    'Member'}
                </span>
                <span className="text-zinc-400 text-xs">|</span>
                <span className="text-zinc-500 font-mono text-xs">
                  {previewProfile.currentPoints.toFixed(0)} PTS
                </span>
              </div>

              {/* TRANSACTION PREVIEW */}
              {previewProfile.recentTransactions &&
                previewProfile.recentTransactions.length > 0 && (
                  <div className="w-full bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 mb-6">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center">
                      <Activity size={10} className="mr-1" /> Recent Activity
                    </div>
                    <div className="space-y-2">
                      {previewProfile.recentTransactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                            {tx.type === 'EARN' ? (
                              <ArrowUpRight size={12} className="text-lime-500 mr-1.5" />
                            ) : (
                              <ArrowDownLeft size={12} className="text-blue-500 mr-1.5" />
                            )}
                            <span>{tx.description}</span>
                          </div>
                          <span
                            className={`font-mono font-bold ${tx.points > 0 ? 'text-lime-600 dark:text-lime-400' : 'text-blue-600 dark:text-blue-400'}`}
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
                  className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-zinc-950 rounded-xl font-bold text-lg uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Start Order <ArrowRight size={20} className="ml-2" />
                </button>
                <button
                  onClick={cancelLogin}
                  className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Not you? Back
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full flex items-center gap-4 mb-6">
                <button
                  onClick={handleBack}
                  className="h-14 w-14 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title={isAddMode ? 'Cancel' : 'Back'}
                >
                  <ArrowLeft size={24} />
                </button>
                <div
                  className={`flex-1 h-14 bg-zinc-100 dark:bg-zinc-950 border-b-2 flex items-center justify-center relative overflow-hidden transition-colors ${lookupStatus === 'ERROR' ? 'border-red-500 bg-red-50 dark:bg-red-900/10 animate-[shake_0.5s_ease-in-out]' : 'border-lime-500 dark:border-lime-400/50'}`}
                >
                  {lookupStatus === 'ERROR' ? (
                    <span className="font-bold text-red-500 dark:text-red-400 uppercase tracking-widest text-sm flex items-center">
                      <XCircle size={16} className="mr-2" /> CARD NOT FOUND
                    </span>
                  ) : (
                    <span className="font-mono text-3xl tracking-[0.2em] text-lime-600 dark:text-lime-400 font-bold uppercase">
                      {loyaltyInput || (
                        <span className="text-zinc-400 dark:text-zinc-800 text-lg tracking-normal opacity-50 font-sans uppercase">
                          Enter Card ID
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {KEYBOARD_NUMBERS.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleLoyaltyCardInput(key)}
                      className="h-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 active:bg-lime-400/20 active:border-lime-400 rounded-lg text-xl font-bold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-mono shadow-sm transition-all"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700/50 mb-4">
                  <div className="grid grid-cols-4 gap-2">
                    {KEYBOARD_LETTERS.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleLoyaltyCardInput(key)}
                        className="h-12 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 active:bg-lime-400/20 active:border-lime-400 rounded-lg text-lg font-bold text-zinc-700 dark:text-zinc-200 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-600 font-mono shadow-sm transition-all"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleLoyaltyClear}
                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded-xl flex flex-col items-center justify-center py-3 transition-all border border-zinc-200 dark:border-zinc-800"
                  >
                    <Eraser size={20} className="mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Clear</span>
                  </button>
                  <button
                    onClick={handleLoyaltyBackspace}
                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white rounded-xl flex flex-col items-center justify-center py-3 transition-all border border-zinc-200 dark:border-zinc-800"
                  >
                    <Delete size={20} className="mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Back</span>
                  </button>
                  <button
                    onClick={handleLoyaltySubmit}
                    disabled={loyaltyInput.length === 0}
                    className={`bg-lime-500 active:scale-[0.98] rounded-xl text-zinc-950 font-bold uppercase tracking-widest shadow-lg transition-all flex flex-col items-center justify-center py-3 border border-transparent ${loyaltyInput.length === 0 ? 'opacity-50 cursor-not-allowed bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500' : 'hover:bg-lime-400'}`}
                  >
                    <ArrowRight size={20} className="mb-1" strokeWidth={3} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Go</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LoyaltyScreen;
