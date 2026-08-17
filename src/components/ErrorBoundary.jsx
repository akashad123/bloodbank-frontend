import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[400px] w-full flex items-center justify-center p-6 bg-gray-50/50"
          style={{ borderRadius: 0 }}
        >
          <div
            className="bg-white max-w-md w-full p-8 border border-gray-200 shadow-sm text-center space-y-5"
            style={{ borderRadius: 0, borderTop: '4px solid #B03030' }}
          >
            <div className="w-12 h-12 bg-red-50 border border-red-200 text-primary mx-auto flex items-center justify-center">
              <AlertCircle size={24} />
            </div>

            <div>
              <h2 className="text-lg font-black text-text-primary tracking-tight">
                Unable to Load Page
              </h2>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                A temporary network issue occurred while loading this section. Please reload the page to continue.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                style={{ borderRadius: 0 }}
              >
                <RefreshCw size={13} />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center gap-1.5 transition-colors"
                style={{ borderRadius: 0 }}
              >
                <Home size={13} />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
