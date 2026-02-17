/**
 * @author Hyphae Core Team
 * @description Error Boundary specifically for the Core HUD.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

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
        console.error('[Core ErrorBoundary]', error);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
                    <div className="p-4 rounded-full bg-brand/10 border border-brand/20 mb-6">
                        <AlertCircle size={48} className="text-brand animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter mb-2">CORE_KERNEL_FAULT</h1>
                    <p className="text-gray-500 max-w-md mb-8 font-mono text-sm uppercase tracking-widest">
                        The command center interface has encountered a critical state error.
                    </p>

                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl mb-8 max-w-lg overflow-hidden">
                        <code className="text-[10px] text-red-400 block whitespace-pre-wrap">
                            {this.state.error?.message || 'NO_STDOUT_CAPTURE'}
                        </code>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-brand hover:text-white transition-all duration-300 flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        RESTART HUD
                    </button>

                    <div className="mt-12 opacity-20 flex items-center gap-2">
                        <Layers size={14} />
                        <span className="text-[10px] font-mono tracking-widest uppercase">Hyphae Distributed Systems // Core v1.5</span>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
