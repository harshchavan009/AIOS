import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '../common/CommandPalette';
import { ToastContainer } from '../common/ToastContainer';
import { OnboardingModal } from '../common/OnboardingModal';
import { AICopilotWidget } from '../common/AICopilotWidget';
import { PageTransition } from '../common/PageTransition';
import { useThemeStore } from '../../store/useThemeStore';
import { useLiveTelemetryStore } from '../../store/useLiveTelemetryStore';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useThemeStore();
  const { startTicker, stopTicker, updateFromApi } = useLiveTelemetryStore();

  const isLight = theme === 'light';

  useEffect(() => {
    // Check if onboarding was completed
    const completed = localStorage.getItem('aios_onboarding_completed');
    if (!completed) {
      setIsOnboardingOpen(true);
    }

    startTicker();

    // Subscribe to SSE backend telemetry if available
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/observability/stream');
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          updateFromApi(data);
        } catch {
          // preserve fallback
        }
      };
    } catch {
      // preserve fallback
    }

    return () => {
      stopTicker();
      if (eventSource) eventSource.close();
    };
  }, [startTicker, stopTicker, updateFromApi]);

  return (
    <div
      className={`min-h-screen flex font-sans relative overflow-x-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-[#F5F7FA] text-[#111827]'
          : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#161C28] via-[#0B0E17] to-[#07090F] text-[#FFFFFF]'
      }`}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Apple Subsurface Refraction Lighting & Mesh Overlay */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Background Grid Pattern (48px size, 1.8% opacity) */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {!isLight && (
          <>
            {/* Top Center Spotlight Highlight */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[25rem] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.025) 0%, transparent 70%)'
              }}
            />

            {/* Top Left Sapphire Refraction: rgba(96,165,250,0.045), Blur 280px */}
            <div
              className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full pointer-events-none"
              style={{ background: 'rgba(96, 165, 250, 0.045)', filter: 'blur(280px)' }}
            />

            {/* Top Right Amethyst Glow: rgba(168,85,247,0.035), Blur 280px */}
            <div
              className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full pointer-events-none"
              style={{ background: 'rgba(168, 85, 247, 0.035)', filter: 'blur(280px)' }}
            />

            {/* Bottom Glow: rgba(30,41,59,0.06), Blur 280px */}
            <div
              className="absolute -bottom-40 left-1/3 w-[45rem] h-[45rem] rounded-full pointer-events-none"
              style={{ background: 'rgba(30, 41, 59, 0.06)', filter: 'blur(280px)' }}
            />
          </>
        )}
      </div>

      {/* Responsive Collapsible & Mobile Drawer Sidebar */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Sticky Header Navbar */}
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Interactive Guided Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Floating AI Copilot Assistant Widget */}
      <AICopilotWidget />

      {/* Real-time Toast Notifications Banner */}
      <ToastContainer />
    </div>
  );
};


