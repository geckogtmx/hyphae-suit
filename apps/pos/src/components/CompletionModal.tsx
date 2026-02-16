/**
 * @link e:\git\hyphae-pos\src\components\CompletionModal.tsx
 * @author Hyphae POS Team
 * @description Final step for order closure, including tipping and packaging info.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState } from 'react';
import { SavedOrder } from '../types';
import { calculatePackagingFallback } from '../utils/packagingCalculator';
import { formatSecs, getDurationSecs } from '../utils/orderHelpers';
import { X, Package, DollarSign, Delete, CheckCircle } from 'lucide-react';

interface CompletionModalProps {
  order: SavedOrder;
  onClose: () => void;
  onComplete: (order: SavedOrder, tipAmount: number) => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ order, onClose, onComplete }) => {
  const [tipInput, setTipInput] = useState('');
  const packagingInventory = React.useMemo(() => {
    try {
      const payload = {
        orderId: order.id,
        serviceType: order.orderType,
        items: (order.items || []).map((item) => ({
          sku: item.id,
          qty: 1,
          volumePoints: item.packaging?.volumePoints || 0,
          isMessy: item.packaging?.isMessy || false,
          modifiers: (item.selectedModifiers || []).map((m) => m.name),
        })),
      };
      const result = calculatePackagingFallback(payload);
      return result.packagingUsed;
    } catch (e) {
      console.error('Packaging Calc Failed', e);
      return {};
    }
  }, [order]);

  const handleTipInput = (char: string) => {
    if (tipInput.length > 6) return;
    if (char === '.' && tipInput.includes('.')) return;
    setTipInput((prev) => prev + char);
  };

  const handleTipBackspace = () => setTipInput((prev) => prev.slice(0, -1));

  const handleFinalize = () => {
    const tip = parseFloat(tipInput) || 0;
    onComplete(order, tip);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-200/90 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex overflow-hidden font-sans">
        {/* LEFT PANEL: Summary */}
        <div className="w-1/3 bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Order #{order.id}</h2>
          <div className="text-xs font-bold uppercase text-zinc-500 mb-6">{order.table}</div>

          <div className="flex-1 flex flex-col gap-4">
            {packagingInventory && Object.keys(packagingInventory).length > 0 && (
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shrink-0">
                <span className="text-[10px] font-bold uppercase text-lime-600 dark:text-lime-500 block mb-2 flex items-center">
                  <Package size={12} className="mr-1" /> Packaging
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(packagingInventory).map(([sku, count]) => (
                    <div
                      key={sku}
                      className="flex justify-between items-center text-xs border-b border-zinc-100 dark:border-zinc-800 last:border-0 pb-1 last:pb-0"
                    >
                      <span className="text-zinc-500 dark:text-zinc-400 text-[10px]">{sku.replace('SKU_', '')}</span>
                      <span className="font-mono font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded">
                        x{count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-600 block mb-1">
                  Queue Time
                </span>
                <div className="text-xl font-mono text-zinc-600 dark:text-zinc-400">
                  {formatSecs(getDurationSecs(order.createdAt, order.cookingStartedAt))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-600 block mb-1">
                  Cook Time
                </span>
                <div className="text-xl font-mono text-orange-500">
                  {formatSecs(getDurationSecs(order.cookingStartedAt, order.readyAt))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-600 block mb-1">
                  Pack/Wait Time
                </span>
                <div className="text-xl font-mono text-lime-600 dark:text-lime-500">
                  {formatSecs(getDurationSecs(order.readyAt))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Tipping & Action */}
        <div className="flex-1 p-6 flex flex-col bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="flex justify-between items-start mb-4 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-widest">
                Add Tip?
              </h3>
              <p className="text-zinc-500 text-sm">Enter amount or 0 to skip</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full min-h-0">
            <div className="w-full relative mb-4 shrink-0">
              <DollarSign
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                size={24}
              />
              <input
                type="text"
                value={tipInput}
                readOnly
                placeholder="0.00"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-6 text-5xl font-mono text-zinc-900 dark:text-white text-center focus:border-lime-500 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 w-full mb-4 shrink-0">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((n) => (
                <button
                  key={n}
                  onClick={() => handleTipInput(n.toString())}
                  className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-2xl font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 active:bg-lime-500 active:text-black border border-zinc-200 dark:border-zinc-700/50 transition-colors shadow-sm"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={handleTipBackspace}
                className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-500 active:text-white border border-zinc-200 dark:border-zinc-700/50 transition-colors shadow-sm"
              >
                <Delete size={24} />
              </button>
            </div>

            <button
              onClick={handleFinalize}
              className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-zinc-950 rounded-2xl font-bold text-xl uppercase tracking-widest shadow-lg shadow-lime-500/20 active:scale-[0.98] transition-all flex items-center justify-center shrink-0"
            >
              <CheckCircle size={24} className="mr-3" /> Complete Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
