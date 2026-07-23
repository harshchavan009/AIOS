import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'info';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  pulse = false,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border transition-colors';

  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    destructive: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    outline: 'bg-transparent text-muted-foreground border-border/80',
  };

  const pulseColors = {
    default: 'bg-primary',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    destructive: 'bg-rose-400',
    info: 'bg-indigo-400',
    outline: 'bg-muted-foreground',
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full animate-ping ${pulseColors[variant]}`} />
      )}
      <span>{children}</span>
    </span>
  );
};
