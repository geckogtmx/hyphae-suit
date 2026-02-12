/**
 * @link e:\git\hyphae-pos\src\components\LiveTimer.tsx
 * @author Hyphae POS Team
 * @description Simple display component for formatted timestamps.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React from 'react';

interface LiveTimerProps {
  startTime?: number;
  className?: string;
}

const LiveTimer: React.FC<LiveTimerProps> = ({ startTime, className }) => {
  if (!startTime) return <span className={className}>--:--</span>;

  // Format as static time (e.g. 12:45 PM)
  const timeString = new Date(startTime).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return <span className={className}>{timeString}</span>;
};

export default React.memo(LiveTimer);
