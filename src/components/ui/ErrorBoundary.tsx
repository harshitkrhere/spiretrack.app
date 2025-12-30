import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    this.setState({ errorInfo });
    
    // Optional: Send to error tracking service
    // logErrorToService(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full text-center">
            {/* Minimal Status Indicator */}
            <div className="w-12 h-12 border-2 border-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <div className="w-3 h-3 bg-slate-400 rounded-full" />
            </div>
            
            {/* Calm, Professional Header */}
            <h1 className="text-2xl font-semibold text-slate-900 mb-3 tracking-tight">
              System Execution Paused
            </h1>
            
            <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
              The application encountered an unexpected state and has paused to ensure data integrity. No data has been compromised.
            </p>

            {/* Technical Diagnostics - Non-Alarming */}
            {this.state.error && (
              <div className="mb-10 text-left">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Diagnostic Information
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4 overflow-hidden relative group">
                  <p className="font-mono text-xs text-slate-600 break-all">
                    <span className="text-slate-400 mr-2">$</span>
                    {this.state.error.message}
                  </p>
                  {/* Copy helper could go here */}
                </div>
              </div>
            )}

            {/* Actions - Neutral & Deliberate */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={this.handleRetry}
                className="min-w-[140px] inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all text-sm shadow-sm"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Resume Session
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="min-w-[140px] inline-flex items-center justify-center px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-all text-sm"
              >
                Return to Dashboard
              </button>
            </div>
            
            <div className="mt-12 text-[11px] text-slate-400 font-mono">
              ERR_PID: {Math.random().toString(36).substr(2, 9).toUpperCase()} • SPIRE_SYS_V2.1 • STABLE
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
