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
      setIsIdle((prevIsIdle) => {
        // If we are ALREADY idle, we stay idle (Screen Protector Mode).
        // Standard activity events (like mousemove) should not wake it up.
        // Only the explicit 'wake' function can disable idle state.
        if (prevIsIdle) {
          return true;
        }

        // If we are active, we reset the timer
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);

        return false;
      });
    };

    // Initial start
    resetTimer();

    // Events that consider the user "active"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [timeoutMs]);

  return { isIdle, triggerIdle, wake };
};
