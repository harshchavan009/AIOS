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
    neutral: 'bg-secondary text-foreground/80 border-border',
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    destructive: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    outline: 'bg-transparent text-muted-foreground border-border',
  };

  const dotColors = {
    neutral: 'bg-muted-foreground',
    default: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    destructive: 'bg-rose-500',
    info: 'bg-blue-500',
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
