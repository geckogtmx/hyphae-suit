/**
 * @link e:\git\hyphae-pos\src\hooks\useLongPress.ts
 * @author Hyphae POS Team
 * @description Hook for detecting long-press vs click events (Touch & Mouse).
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

const preventDefault = (event: Event) => {
  if (event instanceof TouchEvent && event.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
};

export const useLongPress = (
  onLongPress: () => void,
  onClick: () => void,
  { shouldPreventDefault = true, delay = 500 }: UseLongPressOptions = {}
) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, { passive: false });
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress();
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
        if (shouldTriggerClick) {
          onClick();
        }
      }
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
};
