import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Building2 } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { SystemHealthPopover } from '../common/SystemHealthPopover';
import { NotificationCenter } from '../common/NotificationCenter';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { currentOrganization, currentWorkspace } = useWorkspaceStore();

  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'profile' | 'health' | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const isLight = theme === 'light';

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      
      // Esc: Close open dropdowns & modals
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsShortcutsOpen(false);
        return;
      }

      // Cmd + K or Ctrl + K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette();
        return;
      }

      // Cmd + Shift + D or Ctrl + Shift + D: Toggle Theme
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // N: Toggle Notifications
      if (!isInput && e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveDropdown((prev) => (prev === 'notifications' ? null : 'notifications'));
        return;
      }

      // Cmd + / or Ctrl + /: Keyboard Shortcuts Cheatsheet
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, onOpenCommandPalette]);

  return (
    <header
      className={`h-16 sticky top-0 z-30 flex items-center justify-between px-6 transition-colors duration-300 backdrop-blur-[24px] ${
        isLight
          ? 'bg-white/90 border-b border-[#E5E7EB] text-[#111827]'
          : 'bg-[#0E121B]/82 border-b border-white/[0.08] text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Left: Organization / Workspace Switcher & Global Search */}
      <div className="flex items-center space-x-4">
        {/* Workspace Switcher */}
        <div
          className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            isLight
              ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#111827]'
              : 'bg-[#181E2C]/80 border-white/[0.08] text-gray-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#0B84FF]" />
          <span className="font-medium">{currentOrganization?.name || 'Acme Enterprise'}</span>
          <span className="font-mono opacity-50">/</span>
          <span className="text-sky-400 font-mono">{currentWorkspace?.name || 'Production'}</span>
        </div>

        {/* Global Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className={`flex items-center space-x-3 px-3.5 py-1.5 rounded-xl border text-sm transition-all w-52 md:w-72 justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            isLight
              ? 'bg-[#F3F4F6] hover:bg-[#E5E7EB] border-[#E5E7EB] text-gray-600'
              : 'bg-[#181E2C]/80 hover:bg-[#20283A] border-white/[0.08] text-gray-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 group-hover:text-[#0B84FF] transition-colors" />
            <span className="text-xs">Search AIOS...</span>
          </div>
          <kbd
            className={`hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono border rounded ${
              isLight
                ? 'bg-white border-[#E5E7EB] text-gray-600'
                : 'bg-[#0B0E17] border-white/[0.08] text-gray-400'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions & Production Controls */}
      <div className="flex items-center space-x-3">
        {/* 1. Live System Health Metric & Popover */}
        <SystemHealthPopover
          isOpen={activeDropdown === 'health'}
          onToggle={() => setActiveDropdown(activeDropdown === 'health' ? null : 'health')}
          onClose={() => setActiveDropdown(null)}
        />

        {/* 2. Global Theme Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          aria-label={`Switch to ${theme === 'graphite' ? 'Light' : 'Graphite'} theme (⌘+Shift+D)`}
          title={`Switch to ${theme === 'graphite' ? 'Light Enterprise' : 'Apple Pro Obsidian'} theme (⌘+Shift+D)`}
          className={`p-2 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            isLight
              ? 'bg-[#F3F4F6] hover:bg-[#E5E7EB] border-[#E5E7EB] text-gray-800'
              : 'bg-[#181E2C]/80 hover:bg-[#20283A] border-white/[0.08] text-gray-400 hover:text-white'
          }`}
        >
          {theme === 'graphite' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-500" />
          )}
        </button>

        {/* 3. Notification Center */}
        <NotificationCenter
          isOpen={activeDropdown === 'notifications'}
          onToggle={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
          onClose={() => setActiveDropdown(null)}
        />

        {/* 4. User Profile Dropdown */}
        <ProfileDropdown
          isOpen={activeDropdown === 'profile'}
          onToggle={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
          onClose={() => setActiveDropdown(null)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />
      </div>

      {/* 5. Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </header>
  );
};
