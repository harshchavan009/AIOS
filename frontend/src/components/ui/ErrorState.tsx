import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this data. Please try again.',
  retryLabel = 'Try again',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto ${className}`}
    >
      <div className="w-9 h-9 rounded-md bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
        <AlertCircle className="w-5 h-5" strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-normal max-w-sm">
          {description}
        </p>
      </div>

      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
