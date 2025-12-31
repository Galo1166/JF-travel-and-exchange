import React, { ReactNode } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.resetError) || (
          <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Oops! Something went wrong</h2>
                <p className="text-gray-600 mb-4">
                  {this.state.error.message || 'An unexpected error occurred'}
                </p>
                <details className="mb-6 text-left p-4 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium">Error details</summary>
                  <pre className="mt-2 overflow-auto">{this.state.error.stack}</pre>
                </details>
                <Button
                  onClick={this.resetError}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
              </Card>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
