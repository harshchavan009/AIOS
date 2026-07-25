import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ServerErrorPage } from '../../pages/ServerErrorPage';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AIOS ErrorBoundary caught an exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ServerErrorPage
          errorDetails={this.state.error?.stack || this.state.error?.message || 'React component render crash.'}
        />
      );
    }

    return this.props.children;
  }
}
