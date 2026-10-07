import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline' | 'glass';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}, ref) => {
  const base = 'rounded-lg border border-border transition-colors duration-150';
  
  const variants = {
    default: 'bg-card text-card-foreground shadow-xs',
    subtle: 'bg-secondary/40 text-card-foreground',
    outline: 'bg-transparent text-card-foreground',
    glass: 'bg-card text-card-foreground shadow-xs',
  };

  const hoverStyle = hover ? 'hover:border-foreground/25 hover:bg-card/90' : '';

  return (
    <div ref={ref} className={`${base} ${variants[variant] || variants.default} ${hoverStyle} ${className}`} {...props}>
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-5 pb-3 flex flex-col space-y-1 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-sm font-semibold tracking-tight text-foreground ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-muted-foreground leading-normal ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-5 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-5 pt-3 border-t border-border flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
