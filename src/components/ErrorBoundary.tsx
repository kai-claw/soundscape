import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

/**
 * Catches WebGL crashes, context loss, and runtime errors.
 * Provides recovery UI instead of white screen of death.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: '' };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const errorInfo = info.componentStack ?? '';
    this.setState({ errorInfo });
    console.error('[SoundScape] ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isWebGL = this.state.error?.message?.toLowerCase().includes('webgl') ||
        this.state.error?.message?.toLowerCase().includes('context') ||
        this.state.error?.message?.toLowerCase().includes('gpu');

      return (
        <div className="error-boundary" role="alert">
          <div className="error-content">
            <div className="error-icon">{isWebGL ? '🖥️' : '⚠️'}</div>
            <h2>{isWebGL ? 'Graphics Error' : 'Something Went Wrong'}</h2>
            <p>
              {isWebGL
                ? 'Your browser lost the WebGL context. This can happen when your GPU is busy or the tab was backgrounded.'
                : 'An unexpected error occurred in the visualizer.'}
            </p>
            {this.state.error && (
              <details className="error-details">
                <summary>Technical details</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
            <div className="error-actions">
              <button onClick={this.handleRetry} className="landing-btn primary">
                <span className="btn-icon">🔄</span>
                <span className="btn-text">
                  <strong>Try Again</strong>
                  <small>Resume the visualizer</small>
                </span>
              </button>
              <button onClick={this.handleReload} className="landing-btn secondary">
                <span className="btn-icon">🔃</span>
                <span className="btn-text">
                  <strong>Reload Page</strong>
                  <small>Start fresh</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
