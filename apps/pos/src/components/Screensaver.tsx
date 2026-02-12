/**
 * @link e:\git\hyphae-pos\src\components\Screensaver.tsx
 * @author Hyphae POS Team
 * @description Interactive idle state visualization with wake functionality.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React, { useEffect, useRef } from 'react';

interface ScreensaverProps {
  onWake: () => void;
}

const Screensaver: React.FC<ScreensaverProps> = ({ onWake }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bouncerRef = useRef<HTMLDivElement>(null);

  // Use Refs for physics state to avoid React re-renders 60fps
  const pos = useRef({ x: 100, y: 100 });
  const vel = useRef({ dx: 1.5, dy: 1.5 }); // Speed
  const reqRef = useRef<number>(0);

  // Double Tap Logic
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    // Randomize start direction
    if (Math.random() > 0.5) vel.current.dx *= -1;
    if (Math.random() > 0.5) vel.current.dy *= -1;

    const animate = () => {
      if (!containerRef.current || !bouncerRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const bouncer = bouncerRef.current.getBoundingClientRect();

      // Update position
      pos.current.x += vel.current.dx;
      pos.current.y += vel.current.dy;

      // Check collisions (Left/Right)
      if (pos.current.x <= 0) {
        pos.current.x = 0;
        vel.current.dx *= -1;
      } else if (pos.current.x + bouncer.width >= container.width) {
        pos.current.x = container.width - bouncer.width;
        vel.current.dx *= -1;
      }

      // Check collisions (Top/Bottom)
      if (pos.current.y <= 0) {
        pos.current.y = 0;
        vel.current.dy *= -1;
      } else if (pos.current.y + bouncer.height >= container.height) {
        pos.current.y = container.height - bouncer.height;
        vel.current.dy *= -1;
      }

      // Apply transformation directly to DOM
      bouncerRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(reqRef.current);
  }, []);

  const handleTouch = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      onWake();
    }
    lastTapRef.current = now;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black cursor-none overflow-hidden animate-in fade-in duration-700 select-none"
      onDoubleClick={onWake}
      onTouchEnd={handleTouch}
    >
      <div
        ref={bouncerRef}
        className="absolute top-0 left-0 flex items-center p-6 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 shadow-[0_0_50px_rgba(132,204,22,0.1)] backdrop-blur-sm pointer-events-none"
        style={{ willChange: 'transform' }}
      >
        <div className="h-16 w-16 bg-lime-400 rounded-2xl flex items-center justify-center mr-5 shadow-[0_0_25px_rgba(132,204,22,0.4)]">
          <span className="font-mono font-bold text-zinc-950 text-3xl">H</span>
        </div>
        <div>
          <span className="font-bold text-3xl tracking-tight text-zinc-100">
            HYPHAE<span className="text-lime-400">.POS</span>
          </span>
          <div className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
            System Standby
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-zinc-600 font-mono text-xs uppercase tracking-[0.2em] opacity-50 animate-pulse pointer-events-none">
        Double Tap to Unlock
      </div>
    </div>
  );
};

export default Screensaver;
