import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'neutral' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
  dot?: boolean;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border leading-none select-none';

  const variants = {
    neutral: 'bg-elevated text-foreground/85 border-border',
    default: 'bg-accent/15 text-accent border-accent/30',
    success: 'bg-status-success/15 text-status-success border-status-success/30',
    warning: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    destructive: 'bg-status-danger/15 text-status-danger border-status-danger/30',
    info: 'bg-status-info/15 text-status-info border-status-info/30',
    outline: 'bg-transparent text-muted-foreground border-border',
  };

  const dotColors = {
    neutral: 'bg-muted-foreground',
    default: 'bg-accent',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    destructive: 'bg-status-danger',
    info: 'bg-status-info',
    outline: 'bg-muted-foreground',
  };

  return (
    <span className={`${base} ${variants[variant] || variants.neutral} ${className}`} {...props}>
      {(dot || pulse) && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${pulse ? 'animate-pulse' : ''} ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
