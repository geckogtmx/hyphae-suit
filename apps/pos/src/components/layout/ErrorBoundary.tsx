/**
 * @author Hyphae POS Team
 * @description Global Error Boundary for catching React crashes.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import React, { ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

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

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    private handleGoHome = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertOctagon size={40} className="text-red-500 animate-pulse" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Fault Detected</h1>
                        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                            An unexpected crash occurred in the interface. The POS state has been protected.
                            <br />
                            <span className="text-[10px] font-mono mt-2 block opacity-50">
                                {this.state.error?.message || 'Unknown Execution Error'}
                            </span>
                        </p>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full py-4 bg-lime-500 hover:bg-lime-400 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(132,204,22,0.2)]"
                            >
                                <RefreshCw size={20} />
                                RESYNC SYSTEM
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 border border-zinc-700"
                            >
                                <Home size={20} />
                                RETURN TO HUD
                            </button>
                        </div>

                        <p className="mt-8 text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                            Hyphae OS v2.0 // Kernel Panic
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
