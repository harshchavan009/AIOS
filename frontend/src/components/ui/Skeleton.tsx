import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-muted/60 border border-border/20 ${className}`}
      {...props}
    />
  );
};
