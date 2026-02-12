/**
 * @link e:\git\hyphae-pos\src\components\KitchenSummaryModal.tsx
 * @author Hyphae POS Team
 * @description Aggregated view of items requiring preparation and production.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React, { useMemo } from 'react';
import { SavedOrder } from '../types';
import { calculateSpecificSummary } from '../utils/orderHelpers';
import { Wand2, X, ChefHat, Clock } from 'lucide-react';

interface KitchenSummaryModalProps {
  cookingOrders: SavedOrder[];
  queueOrders: SavedOrder[];
  onClose: () => void;
}

const KitchenSummaryModal: React.FC<KitchenSummaryModalProps> = ({
  cookingOrders,
  queueOrders,
  onClose,
}) => {
  const summaryData = useMemo(() => {
    return {
      cooking: calculateSpecificSummary(cookingOrders),
      queue: calculateSpecificSummary(queueOrders),
    };
  }, [cookingOrders, queueOrders]);

  const renderSummaryGrid = (
    data: Record<string, number | { count: number }>,
    type: 'PREP' | 'MAIN' | 'SIDE'
  ) => {
    const entries = Object.entries(data || {});
    if (entries.length === 0)
      return <div className="text-zinc-500 italic text-xs text-center py-4">Nothing here</div>;

    return (
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
        {entries.map(([name, val]) => (
          <div
            key={name}
            className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 border-2 ${type === 'PREP' ? 'bg-zinc-900 border-zinc-800' : type === 'MAIN' ? 'bg-orange-950/30 border-orange-900/50' : 'bg-blue-950/30 border-blue-900/50'}`}
          >
            <span
              className={`text-3xl font-bold mb-1 ${type === 'PREP' ? 'text-zinc-300' : type === 'MAIN' ? 'text-orange-500' : 'text-blue-400'}`}
            >
              {typeof val === 'object' ? val.count : val}
            </span>
            <span className="text-[10px] text-center uppercase font-bold text-zinc-500 leading-tight">
              {name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 z-50 bg-zinc-950/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
        <div className="flex items-center text-orange-500">
          <Wand2 size={20} className="mr-2" />
          <span className="font-bold uppercase tracking-widest text-sm">Production Summary</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-4 grid grid-rows-2 gap-4 min-h-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-orange-500 font-bold flex items-center uppercase text-xs tracking-wider">
              <ChefHat size={16} className="mr-2" /> Live Production
            </span>
            <span className="text-zinc-500 font-mono text-xs">
              Current Rail: {cookingOrders.length} Orders
            </span>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800 overflow-y-auto">
              <h4 className="text-zinc-500 text-[10px] font-bold uppercase mb-2 text-center">
                Prep Required
              </h4>
              {renderSummaryGrid(summaryData.cooking.prep, 'PREP')}
            </div>
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800 overflow-y-auto">
              <h4 className="text-orange-700 text-[10px] font-bold uppercase mb-2 text-center">
                ITEMS
              </h4>
              {renderSummaryGrid(summaryData.cooking.mains, 'MAIN')}
            </div>
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800 overflow-y-auto">
              <h4 className="text-blue-700 text-[10px] font-bold uppercase mb-2 text-center">
                SIDES (FRYER)
              </h4>
              {renderSummaryGrid(summaryData.cooking.sides, 'SIDE')}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col min-h-0 opacity-70">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400 font-bold flex items-center uppercase text-xs tracking-wider">
              <Clock size={16} className="mr-2" /> Up Next (Queue)
            </span>
            <span className="text-zinc-500 font-mono text-xs">
              Pending: {queueOrders.length} Orders
            </span>
          </div>
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800 overflow-y-auto">
              <h4 className="text-zinc-600 text-[10px] font-bold uppercase mb-2 text-center">
                Incoming Prep
              </h4>
              {renderSummaryGrid(summaryData.queue.prep, 'PREP')}
            </div>
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800 overflow-y-auto">
              <h4 className="text-zinc-600 text-[10px] font-bold uppercase mb-2 text-center">
                INCOMING ITEMS
              </h4>
              {renderSummaryGrid(summaryData.queue.mains, 'MAIN')}
            </div>
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800 overflow-y-auto">
              <h4 className="text-zinc-600 text-[10px] font-bold uppercase mb-2 text-center">
                Incoming Sides
              </h4>
              {renderSummaryGrid(summaryData.queue.sides, 'SIDE')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenSummaryModal;
