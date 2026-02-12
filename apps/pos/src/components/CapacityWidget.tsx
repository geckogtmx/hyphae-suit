/**
 * @link e:\git\hyphae-pos\src\components\CapacityWidget.tsx
 * @author Hyphae POS Team
 * @description Visualization of daily kitchen capacity limit.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React from 'react';

interface CapacityWidgetProps {
  current: number;
  max: number;
  className?: string;
}

const CapacityWidget: React.FC<CapacityWidgetProps> = ({ current, max, className = 'w-48' }) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div
      className={`flex flex-col bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-xl ${className} transition-colors duration-300`}
    >
      <div className="flex justify-between text-xs font-mono mb-1 text-zinc-500 dark:text-zinc-400">
        <span>DAILY CAP</span>
        <span className={percentage > 90 ? 'text-red-500' : 'text-lime-600 dark:text-lime-400'}>
          {current}/{max}
        </span>
      </div>
      <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg overflow-hidden">
        <div
          className="h-full bg-lime-500 dark:bg-lime-400 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default CapacityWidget;
