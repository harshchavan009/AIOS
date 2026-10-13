import React from 'react';
import { useThemeStore } from '../../store/useThemeStore';

export interface BackgroundMediaProps {
  variant: 'hero' | 'app';
}

/**
 * BackgroundMedia component
 * Clean, subtle, low-contrast abstract architectural grid.
 * Zero particles, zero custom cursors, zero parallax, zero video overhead.
 * Strict adherence to Launch Rules 1, 4, 5.
 */
export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({ variant }) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const isHero = variant === 'hero';

  if (isLight) {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#FAFAF9]"
      >
        {/* Subtle architectural grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(100, 116, 139, 0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(100, 116, 139, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        {/* Neutral bottom edge fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 70%, #FAFAF9 100%)',
          }}
        />
      </div>
    );
  }

  // Dark graphite background
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#0B0C0E]"
    >
      {/* Subtle low-contrast graphite grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Solid scrim overlay to prevent contrast conflict */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: isHero ? 'rgba(11, 12, 14, 0.65)' : 'rgba(11, 12, 14, 0.88)',
          background: isHero
            ? 'linear-gradient(to bottom, rgba(11, 12, 14, 0.8) 0%, rgba(11, 12, 14, 0.6) 40%, rgba(11, 12, 14, 0.95) 100%)'
            : 'rgba(11, 12, 14, 0.9)',
        }}
      />
    </div>
  );
};
