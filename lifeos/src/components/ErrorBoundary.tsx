// ============================================
// LifeOS — Error Boundary
// ============================================
// Keeps one thrown render error from blanking the whole app.

import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Optional custom fallback; receives the error and a reset callback. */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error in React tree:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: 24,
          textAlign: 'center',
          background: 'var(--color-bg-primary, #020206)',
          color: 'var(--color-text-primary, #f0f3f6)',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</h1>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-muted, #6e7681)',
            maxWidth: 460,
            lineHeight: 1.6,
          }}
        >
          LifeOS hit an unexpected error. Your data is saved — reloading usually clears it.
        </p>
        <pre
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--color-danger, #f85149)',
            background: 'rgba(248, 81, 73, 0.08)',
            border: '1px solid rgba(248, 81, 73, 0.25)',
            borderRadius: 8,
            padding: '10px 14px',
            maxWidth: 'min(90vw, 640px)',
            overflowX: 'auto',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error.message}
        </pre>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={this.reset} className="btn btn-secondary">
            Try again
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Reload app
          </button>
        </div>
      </div>
    );
  }
}
