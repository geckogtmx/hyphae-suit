/**
 * @link e:\git\hyphae-pos\src\components\ActionGridButton.tsx
 * @author Hyphae POS Team
 * @description Button component for modifier/extra grid items with long-press variation support.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useState } from 'react';
import { useLongPress } from '../hooks/useLongPress';
import { ModifierVariation } from '../types';
import { Check } from 'lucide-react';

interface ActionGridButtonProps {
  title: string;
  price?: number;
  selected?: boolean;
  onClick: () => void;
  onVariationChange?: (variation: ModifierVariation) => void;
  variation?: ModifierVariation;
  accentColor?: string;
}

const ActionGridButton: React.FC<ActionGridButtonProps> = ({
  title,
  price,
  selected,
  onClick,
  onVariationChange,
  variation = 'Normal',
  accentColor = 'lime-400',
}) => {
  const [showModal, setShowModal] = useState(false);

  const onLongPress = () => {
    if (onVariationChange) setShowModal(true);
  };
  const handleVariationSelect = (v: ModifierVariation) => {
    if (onVariationChange) onVariationChange(v);
    setShowModal(false);
  };

  const { onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd } = useLongPress(
    onLongPress,
    onClick,
    { delay: 400 }
  );

  const isVariation = variation !== 'Normal';
  const isLime = accentColor === 'lime-400';

  const borderColor = selected
    ? isLime
      ? 'border-lime-500 dark:border-lime-400'
      : `border-${accentColor}`
    : 'border-zinc-200 dark:border-zinc-800';

  const textColor = selected
    ? isLime
      ? 'text-lime-700 dark:text-lime-400'
      : `text-${accentColor}`
    : 'text-zinc-700 dark:text-zinc-300';

  const bgColor = selected
    ? 'bg-lime-50 dark:bg-lime-400/10'
    : 'bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800';

  const shadowClass = selected
    ? 'shadow-sm dark:shadow-[0_0_15px_rgba(132,204,22,0.15)]'
    : 'shadow-sm dark:shadow-none';

  return (
    <div className="relative w-full h-full">
      {showModal && (
        <div className="absolute inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-2 border-lime-500 dark:border-lime-400 animate-in fade-in zoom-in duration-100 shadow-lg rounded-xl overflow-hidden">
          <button
            onClick={() => handleVariationSelect('No')}
            className="flex-1 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-200 font-bold uppercase tracking-widest text-xs border-b border-zinc-200 dark:border-zinc-800"
          >
            NO
          </button>
          <button
            onClick={() => handleVariationSelect('Side')}
            className="flex-1 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 font-bold uppercase tracking-widest text-xs border-b border-zinc-200 dark:border-zinc-800"
          >
            SIDE
          </button>
          <button
            onClick={() => handleVariationSelect('Extra')}
            className="flex-1 bg-lime-100 dark:bg-lime-900/50 hover:bg-lime-200 dark:hover:bg-lime-800 text-lime-700 dark:text-lime-200 font-bold uppercase tracking-widest text-xs"
          >
            EXTRA
          </button>
        </div>
      )}

      <button
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`w-full h-full p-4 flex flex-col justify-between items-start rounded-xl border-2 transition-all active:scale-[0.98] relative overflow-hidden ${bgColor} ${borderColor} ${shadowClass}`}
      >
        {selected && (
          <div className="absolute top-0 right-0 p-1.5 bg-lime-500 dark:bg-lime-400 rounded-bl-xl text-white dark:text-zinc-950 shadow-sm z-10">
            <Check size={16} strokeWidth={3} />
          </div>
        )}

        <div className="w-full text-left pr-6">
          <span className={`font-bold text-lg leading-tight block ${textColor}`}>{title}</span>
          {isVariation && (
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md mt-1 inline-block ${variation === 'No' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' : variation === 'Side' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'bg-lime-100 dark:bg-lime-900 text-lime-600 dark:text-lime-400'}`}
            >
              {variation}
            </span>
          )}
        </div>

        {price !== undefined && price > 0 && (
          <span
            className={`font-mono text-sm mt-2 ${selected ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-500'}`}
          >
            +${price.toFixed(2)}
          </span>
        )}
        {!showModal && onVariationChange && (
          <div
            className={`absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full ${selected ? 'bg-lime-500/50 dark:bg-lime-400/50' : 'bg-zinc-300 dark:bg-zinc-700'} opacity-50`}
          />
        )}
      </button>
    </div>
  );
};

export default ActionGridButton;
