import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AIOS React Error Boundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
            <AlertCircle className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">System Recovery Mode</h1>
          <p className="text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
            An unexpected client-side execution error occurred. AIOS Error Boundary prevented application crash.
          </p>
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 font-mono text-xs text-rose-300 max-w-lg mb-8 overflow-x-auto text-left w-full">
            {this.state.error?.toString() || 'Unknown Runtime Exception'}
          </div>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg hover:bg-primary/90 transition-all flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload AIOS Platform</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
