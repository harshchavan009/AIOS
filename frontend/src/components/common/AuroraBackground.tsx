import React from 'react';

export const AuroraBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden bg-[#07090e] ${className}`}>
      {/* Aurora Ambient Lighting Gradients */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-600/30 via-pink-600/20 to-transparent blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-700/20 to-transparent blur-[100px]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
