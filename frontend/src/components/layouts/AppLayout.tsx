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
import { getApiUrl } from '../../config/api';

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
    if (completed === 'pending') {
      setIsOnboardingOpen(true);
    }

    startTicker();

    // Subscribe to SSE backend telemetry if available
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(getApiUrl('/api/v1/observability/stream'));
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
    <div className="min-h-screen flex bg-background text-foreground font-sans relative overflow-x-hidden">

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


