import React from 'react';

/**
 * AuroraBackground - Refactored to clean neutral background container
 * without glowing purple/pink ambient blur blobs.
 */
export const AuroraBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative min-h-screen bg-background text-foreground ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
};
