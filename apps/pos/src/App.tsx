/**
 * @link e:\git\hyphae-pos\src\App.tsx
 * @author Hyphae POS Team
 * @description Main application controller and layout.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrderProvider } from './context/OrderContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useMenuData } from './hooks/useMenuData';
import { useIdleTimer } from './hooks/useIdleTimer';
import OrderRail from './components/OrderRail';
import Stage from './components/Stage';
import ControlBar from './components/ControlBar';
import SettingsScreen from './components/SettingsScreen';
import LoyaltyUpgradeModal from './components/LoyaltyUpgradeModal';
import Screensaver from './components/Screensaver';
import { X } from 'lucide-react';
import Header from './components/layout/Header';
import ModalManager from './components/layout/ModalManager';

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { concepts } = useMenuData();
  const [activeConceptId, setActiveConceptId] = useState('codebs_concept');

  const [layoutRatio, setLayoutRatio] = useState(0.33);
  const [isSwapped, setIsSwapped] = useState(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showToast] = useState(false);
  const [viewMode, setViewMode] = useState<'POS' | 'SETTINGS'>('POS');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Weather Toggle State
  const [showWeather, setShowWeather] = useState(false);

  // Screensaver State (5 minutes = 300000ms)
  const { isIdle, triggerIdle, wake } = useIdleTimer(300000);

  const activeConcept = concepts.find((c) => c.id === activeConceptId);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate Clock/Weather every 10 seconds
  useEffect(() => {
    const weatherTimer = setInterval(() => {
      setShowWeather((prev) => !prev);
    }, 10000);
    return () => clearInterval(weatherTimer);
  }, []);

  const handleSettingsClick = () => {
    setViewMode('SETTINGS');
    setActiveModal(null);
  };

  const closeSettings = () => {
    setViewMode('POS');
  };

  // Manual trigger handler that stops propagation to avoid waking the app immediately
  const handleManualScreensaver = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    triggerIdle();
  };

  // Stable handler to prevent infinite loops in Stage useEffect
  const handleLayoutChange = useCallback((ratio: number) => {
    setLayoutRatio((prev) => (prev === ratio ? prev : ratio));
  }, []);

  return (
    <div className="h-screen w-screen bg-zinc-100 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans selection:bg-lime-500/30 selection:text-white flex flex-col relative transition-colors duration-300">
      {/* --- SCREENSAVER --- */}
      {isIdle && <Screensaver onWake={wake} />}

      {/* --- LOYALTY UPGRADE MODAL --- */}
      <LoyaltyUpgradeModal />

      {/* --- SETTINGS SCREEN OVERLAY --- */}
      {viewMode === 'SETTINGS' && (
        <SettingsScreen onClose={closeSettings} activeConceptId={activeConceptId} />
      )}

      {/* --- GLOBAL HEADER --- */}
      <Header
        isMobile={isMobile}
        handleManualScreensaver={handleManualScreensaver}
        showWeather={showWeather}
        setShowWeather={setShowWeather}
        currentTime={currentTime}
        toggleTheme={toggleTheme}
        theme={theme}
        setActiveModal={setActiveModal}
        activeModal={activeModal}
        activeConceptName={activeConcept?.name || 'Loading...'}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isMobile ? (
          <div className="flex w-full h-full p-2 gap-2">
            {/* COLUMN 1: Order Rail */}
            <div
              style={{
                flex: `${layoutRatio} 1 0%`,
                order: isSwapped ? 3 : 1,
              }}
              className={`h-full bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 transition-all duration-300 ease-in-out overflow-hidden relative rounded-2xl border border-zinc-200 dark:border-zinc-800 ${layoutRatio < 0.05 ? 'w-0 border-none opacity-0 !flex-none' : 'opacity-100'}`}
            >
              <div className="w-full h-full min-w-[250px]">
                <OrderRail onLayoutChange={handleLayoutChange} />
              </div>
            </div>

            {/* CONTROL BAR */}
            <div
              style={{ order: 2 }}
              className="h-full z-40 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0"
            >
              <ControlBar
                currentRatio={layoutRatio}
                onRatioChange={handleLayoutChange}
                isSwapped={isSwapped}
                onSwap={() => setIsSwapped(!isSwapped)}
              />
            </div>

            {/* COLUMN 2: Stage */}
            <div
              style={{
                flex: `${1 - layoutRatio} 1 0%`,
                order: isSwapped ? 1 : 3,
              }}
              className={`h-full min-w-0 bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out ${layoutRatio > 0.95 ? 'w-0 border-none opacity-0 !flex-none' : 'opacity-100'}`}
            >
              <Stage activeConceptId={activeConceptId} onLayoutChange={handleLayoutChange} />
            </div>
          </div>
        ) : (
          <div className="flex-1 relative w-full h-full">
            <div
              className={`
                    fixed inset-y-0 left-0 z-40 w-[85%] bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800
                    transform transition-transform duration-300 ease-in-out shadow-2xl
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
              <OrderRail onLayoutChange={() => setIsMobileMenuOpen(false)} />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>
            {isMobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            <Stage activeConceptId={activeConceptId} />
          </div>
        )}
      </div>

      {/* --- MODAL OVERLAY --- */}
      <ModalManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        handleSettingsClick={handleSettingsClick}
        activeConcept={activeConcept}
        concepts={concepts}
        setActiveConceptId={setActiveConceptId}
        activeConceptId={activeConceptId}
      />
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <OrderProvider>
        <AppContent />
      </OrderProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
