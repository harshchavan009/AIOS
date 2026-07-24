import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '../common/CommandPalette';
import { useThemeStore } from '../../store/useThemeStore';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { theme } = useThemeStore();

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex font-sans relative overflow-hidden transition-colors duration-300 ${
        isLight
          ? 'bg-[#F5F7FA] text-[#111827]'
          : 'bg-gradient-to-b from-[#07090D] via-[#111827] to-[#1F2937] text-[#F8FAFC]'
      }`}
    >
      {/* Ambient Lighting & Technical Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Background Grid Pattern (48px size, 2% opacity) */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {!isLight && (
          <>
            {/* Top Left Glow */}
            <div
              className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
              style={{ background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(250px)' }}
            />
            {/* Top Right Glow */}
            <div
              className="absolute -top-40 -right-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
              style={{ background: 'rgba(148, 163, 184, 0.05)', filter: 'blur(250px)' }}
            />
            {/* Bottom Glow */}
            <div
              className="absolute -bottom-40 left-1/3 w-[40rem] h-[40rem] rounded-full pointer-events-none"
              style={{ background: 'rgba(30, 41, 59, 0.06)', filter: 'blur(250px)' }}
            />
          </>
        )}
      </div>

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Sticky Header Navbar */}
        <Navbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
