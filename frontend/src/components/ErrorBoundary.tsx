import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
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
    console.error('MANDIMITRA Component ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-red-200 shadow-sm text-center my-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            {this.props.fallbackTitle || 'काहीतरी तांत्रिक त्रुटी आली / Something went wrong'}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-6">
            {this.props.fallbackMessage ||
              'हा विभाग दाखवताना अडचण आली. कृपया पुन्हा प्रयत्न करा किंवा मुख्य पानावर जा.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              पुन्हा प्रयत्न करा (Retry)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                this.handleReset();
                window.location.href = '/';
              }}
              className="bg-[#176B45] text-white min-h-[44px]"
            >
              <Home className="w-4 h-4 mr-1.5" />
              मुख्य पान (Dashboard)
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

