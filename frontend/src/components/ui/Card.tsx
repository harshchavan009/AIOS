import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glowing' | 'solid';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const base = 'rounded-2xl p-6 transition-all duration-300 relative overflow-hidden';
  
  const variants = {
    glass: 'glass-card',
    glowing: 'glass-card border-primary/30 shadow-2xl shadow-primary/10',
    solid: 'bg-card border border-border/80 text-card-foreground',
  };

  const hover = hoverEffect ? 'glass-card-hover' : '';

  return (
    <div className={`${base} ${variants[variant]} ${hover} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 pb-4 border-b border-border/40 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-bold tracking-tight text-foreground ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-muted-foreground leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`pt-4 ${className}`} {...props}>
    {children}
  </div>
);
