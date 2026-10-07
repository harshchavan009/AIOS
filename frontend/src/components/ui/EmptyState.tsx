import React from 'react';
import { LucideIcon, Plus, Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`rounded-lg border border-border border-dashed p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-3.5 max-w-md mx-auto ${className}`}
    >
      <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center text-muted-foreground">
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground leading-normal max-w-sm">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-2 pt-1">
          {actionLabel && onAction && (
            <Button
              size="sm"
              variant="primary"
              onClick={onAction}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {actionLabel}
            </Button>
          )}

          {secondaryLabel && onSecondaryAction && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onSecondaryAction}
            >
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
