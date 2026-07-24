import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '../common/CommandPalette';

export const AppLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07090D] via-[#111827] to-[#1F2937] text-[#F8FAFC] flex font-sans relative overflow-hidden">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Ambient Lighting & Technical Grid Overlay */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Background Grid Pattern (48px size, 2% opacity) */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Top Left Glow: rgba(59,130,246,0.05), Blur 250px */}
        <div
          className="absolute -top-40 -left-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
          style={{ background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(250px)' }}
        />

        {/* Top Right Glow: rgba(148,163,184,0.05), Blur 250px */}
        <div
          className="absolute -top-40 -right-40 w-[35rem] h-[35rem] rounded-full pointer-events-none"
          style={{ background: 'rgba(148, 163, 184, 0.05)', filter: 'blur(250px)' }}
        />

        {/* Bottom Glow: rgba(30,41,59,0.06), Blur 250px */}
        <div
          className="absolute -bottom-40 left-1/3 w-[40rem] h-[40rem] rounded-full pointer-events-none"
          style={{ background: 'rgba(30, 41, 59, 0.06)', filter: 'blur(250px)' }}
        />
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
