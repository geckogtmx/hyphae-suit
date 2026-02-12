/**
 * @link e:\git\hyphae-pos\src\components\ControlBar.tsx
 * @author Hyphae POS Team
 * @description Sidebar control for layout ratios and element swapping.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React from 'react';
import {
  PanelLeft,
  PanelRight,
  LayoutPanelLeft,
  ArrowRightLeft,
  RectangleHorizontal,
} from 'lucide-react';

interface ControlBarProps {
  currentRatio: number;
  onRatioChange: (ratio: number) => void;
  isSwapped: boolean;
  onSwap: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  currentRatio,
  onRatioChange,
  isSwapped,
  onSwap,
}) => {
  const buttons = [
    { ratio: 1.0, icon: PanelLeft, label: 'Rail Focus' },
    { ratio: 0.67, icon: PanelRight, label: '67/33 (Wide Rail)' },
    { ratio: 0.33, icon: LayoutPanelLeft, label: '33/67 (Standard)' },
    { ratio: 0.0, icon: RectangleHorizontal, label: 'Stage Focus' },
  ];

  return (
    <div className="w-11 h-full bg-zinc-100 dark:bg-zinc-900 border-x border-zinc-200 dark:border-zinc-800 flex flex-col items-center py-3 z-40 shrink-0 transition-colors duration-300">
      <div className="flex-1 flex flex-col space-y-2 w-full px-1 pt-1">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          const isActive = currentRatio === btn.ratio;

          return (
            <button
              key={btn.label}
              onClick={() => onRatioChange(btn.ratio)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-lime-400 dark:bg-lime-400 text-zinc-900 dark:text-zinc-950 shadow-[0_0_10px_rgba(163,230,53,0.3)]'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300'
                }
              `}
              title={btn.label}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto w-full px-1 pb-1">
        <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 mb-2" />
        <button
          onClick={onSwap}
          className={`
            w-full aspect-square flex items-center justify-center rounded-lg transition-all duration-200
            ${
              isSwapped
                ? 'bg-lime-100 dark:bg-lime-900/50 text-lime-600 dark:text-lime-400 border border-lime-500/30'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-300'
            }
          `}
          title="Swap Sides"
        >
          <ArrowRightLeft size={18} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(ControlBar);
