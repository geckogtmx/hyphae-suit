/**
 * @link e:\git\hyphae-pos\src\hooks\useIdleTimer.ts
 * @author Hyphae POS Team
 * @description Hook for managing application-wide idle states and screensaver triggers.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useIdleTimer = (timeoutMs: number = 300000) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual wake function to unlock screen
  const wake = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  const triggerIdle = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsIdle(true);
  }, []);

  useEffect(() => {
    const resetTimer = () => {
      // Use functional update to check current state without closure issues
      // If we are currently IDLE, we do NOT reset the timer automatically on movement.
      // We wait for explicit 'wake' call. This prevents subtle "glitches" if mouse moves while screen is off.
      // However, for typical usage, standard activity SHOULD reset timer if not yet idle.

      // Only reset timer if NOT idle
      if (!isIdle) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
      }
    };

    const handleActivity = () => {
      resetTimer();
    };

    // Initial start
    resetTimer();

    // Events that consider the user "active"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [timeoutMs, isIdle]); // Add isIdle dependency

  return { isIdle, triggerIdle, wake };
};
