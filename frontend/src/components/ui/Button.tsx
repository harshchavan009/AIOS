import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs gap-1.5 h-7',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 h-8',
    md: 'px-3.5 py-2 text-sm gap-2 h-9',
    lg: 'px-4 py-2.5 text-base gap-2.5 h-10',
  };

  const variantStyles: Record<string, string> = {
    primary:
      'bg-primary text-white hover:bg-blue-600 active:bg-blue-700 shadow-xs border border-transparent',
    secondary:
      'bg-secondary text-foreground hover:bg-muted active:bg-muted/80 border border-border shadow-xs',
    outline:
      'border border-border bg-transparent hover:bg-secondary text-foreground active:bg-muted',
    ghost:
      'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary',
    destructive:
      'bg-destructive text-destructive-foreground hover:bg-red-600 active:bg-red-700 shadow-xs border border-transparent',
    // Fallbacks mapped cleanly to primary & secondary
    gradient:
      'bg-primary text-white hover:bg-blue-600 active:bg-blue-700 shadow-xs border border-transparent',
    glass:
      'bg-card text-foreground hover:bg-secondary border border-border shadow-xs',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0 flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
