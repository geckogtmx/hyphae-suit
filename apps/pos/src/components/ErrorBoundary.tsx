/**
 * @link e:\git\hyphae-pos\src\components\ErrorBoundary.tsx
 * @author Hyphae POS Team
 * @description React error boundary for catching and displaying runtime errors.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { children } = this.props;

    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
          <div className="bg-red-500/10 p-6 rounded-full border-4 border-red-500/20 mb-6 animate-pulse">
            <AlertTriangle size={64} className="text-red-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Something went wrong.</h1>
          <p className="text-zinc-400 mb-8 max-w-md">
            The application encountered an unexpected error. Our team has been notified.
          </p>

          {this.state.error && (
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg mb-8 max-w-lg w-full text-left overflow-auto max-h-48">
              <code className="text-xs font-mono text-red-400">{this.state.error.toString()}</code>
            </div>
          )}

          <Button
            variant="default"
            size="lg"
            onClick={() => window.location.reload()}
            className="font-bold uppercase tracking-wider"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload Application
          </Button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
