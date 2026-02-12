/**
 * @link e:\git\hyphae-pos\src\components\layout\Header.tsx
 * @author Hyphae POS Team
 * @description Main application header component (Desktop & Mobile).
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import React from 'react';
import { Menu, Sun, Moon, CloudSun, ClipboardList, History, Users, Settings } from 'lucide-react';
import CapacityWidget from '../CapacityWidget';

interface HeaderProps {
  isMobile: boolean;
  handleManualScreensaver: (e: React.MouseEvent) => void;
  showWeather: boolean;
  setShowWeather: (val: boolean) => void;
  currentTime: Date;
  toggleTheme: () => void;
  theme: string;
  setActiveModal: (val: string | null) => void;
  activeModal: string | null;
  activeConceptName: string;
  setIsMobileMenuOpen: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  isMobile,
  handleManualScreensaver,
  showWeather,
  setShowWeather,
  currentTime,
  toggleTheme,
  theme,
  setActiveModal,
  activeModal,
  activeConceptName,
  setIsMobileMenuOpen,
}) => {
  if (isMobile) {
    return (
      <div className="h-auto min-h-[3.5rem] bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50 pt-[env(safe-area-inset-top)]">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2 text-lime-600 dark:text-lime-400"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          HYPHAE<span className="text-lime-600 dark:text-lime-400">.POS</span>
        </span>
        <button onClick={toggleTheme} className="text-zinc-500 dark:text-zinc-400">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    );
  }

  return (
    <header className="h-auto min-h-[3.5rem] bg-zinc-50 dark:bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 z-50 transition-colors duration-300 relative pt-[env(safe-area-inset-top)]">
      {/* LEFT: LOGO */}
      <div
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleManualScreensaver}
        title="Click to Activate Screensaver"
      >
        <button className="h-8 w-8 bg-lime-400 rounded-xl flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(132,204,22,0.3)] hover:scale-105 transition-transform">
          <span className="font-mono font-bold text-zinc-950 text-lg">H</span>
        </button>
        <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 mr-8">
          HYPHAE<span className="text-lime-600 dark:text-lime-400">.POS</span>
        </span>
      </div>

      {/* RIGHT: WIDGET & ICONS */}
      <div className="flex items-center h-full py-1">
        <div className="h-full flex items-center justify-end w-[180px] overflow-hidden mr-6">
          <div
            className="w-full h-full flex items-center justify-end cursor-pointer relative"
            onClick={() => setShowWeather(!showWeather)}
          >
            {/* CLOCK */}
            <div
              className={`absolute right-0 flex items-center justify-end transition-all duration-[2000ms] ease-in-out transform ${showWeather ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}`}
            >
              <span className="font-mono text-xl font-bold text-zinc-600 dark:text-zinc-300 tracking-widest">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* WEATHER */}
            <div
              className={`absolute right-0 flex items-center justify-end space-x-3 transition-all duration-[2000ms] ease-in-out transform ${showWeather ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}
            >
              <CloudSun size={20} className="text-zinc-500 dark:text-zinc-400" />
              <div className="flex flex-col leading-none text-right">
                <span className="font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  72°F
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                  Partly Cloudy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ICON GROUP WITH EVEN SPACING */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="h-9 w-16 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-lime-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setActiveModal('Active Register')}
            className="h-9 w-16 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Active Register"
          >
            <ClipboardList size={18} />
          </button>
          <button
            onClick={() => setActiveModal('Order History')}
            className="h-9 w-16 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Order History"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setActiveModal('Customers')}
            className="h-9 w-16 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Customers"
          >
            <Users size={18} />
          </button>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

          <button
            onClick={() => setActiveModal('SettingsMenu')}
            className={`h-9 w-9 flex items-center justify-center rounded-xl transition-colors ${activeModal === 'SettingsMenu' ? 'bg-lime-400 text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800 flex items-center h-full gap-4">
          <div className="flex flex-col justify-center items-end">
            <span className="text-[9px] font-mono text-zinc-500 uppercase leading-none mb-1">
              Active Modality
            </span>
            <span className="text-sm font-bold text-lime-600 dark:text-lime-400 leading-none">
              {activeConceptName}
            </span>
          </div>
          <div className="scale-75 origin-right">
            <CapacityWidget current={28} max={50} className="w-32 py-1 px-2" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
