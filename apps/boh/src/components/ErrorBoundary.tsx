/**
 * @author Hyphae BOH Team
 * @description Error Boundary for the Kitchen Display System.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import React, { type ReactNode } from 'react';
import { ChefHat, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, _info: React.ErrorInfo) {
        console.error('[BOH ErrorBoundary]', error);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-ink-200 text-white flex flex-col items-center justify-center p-8 text-center font-sans">
                    <div className="p-6 rounded-3xl bg-teal-mid/10 border border-teal-mid/20 mb-8">
                        <ChefHat size={64} className="text-teal-bright animate-bounce" />
                    </div>

                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <AlertTriangle size={24} />
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Kitchen_halt_0xERR</h1>
                    </div>

                    <p className="text-gray-400 max-w-lg mb-10 leading-relaxed font-medium">
                        The KDS display has encountered a rendering exception.
                        Incoming orders are safe in the queue, but the display needs a refresh.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="group relative px-10 py-5 bg-teal-mid hover:bg-teal-bright text-white font-black rounded-2xl transition-all duration-300 shadow-[0_0_40px_rgba(20,184,166,0.2)] active:scale-95 flex items-center gap-3"
                    >
                        <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                        RELOAD KITCHEN RAIL
                    </button>

                    <div className="mt-16 text-[10px] text-gray-600 font-mono tracking-[0.3em] uppercase">
                        Hyphae BOH OS // Prep Engine v1.0
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
