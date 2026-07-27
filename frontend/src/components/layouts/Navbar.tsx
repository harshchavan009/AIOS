import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Building2,
  ChevronDown,
  Check,
  Sparkles,
  Brain,
  Bot,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { SystemHealthPopover } from '../common/SystemHealthPopover';
import { NotificationCenter } from '../common/NotificationCenter';
import { ProfileDropdown } from '../common/ProfileDropdown';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';

interface NavbarProps {
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  onOpenCommandPalette: () => void;
  onOpenOnboarding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onOpenCommandPalette,
  onOpenOnboarding,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { currentOrganization, currentWorkspace, workspaces, setWorkspace } = useWorkspaceStore();

  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'profile' | 'health' | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(e.target as Node)) {
        setIsWorkspaceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // P: New Prompt (Prompt Studio)
      if (!isInput && e.key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('/prompt-studio');
        return;
      }

      // A: New Agent (Agent Builder)
      if (!isInput && e.key.toLowerCase() === 'a' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('/agent-builder');
        return;
      }

      // D: Dashboard
      if (!isInput && e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        navigate('/dashboard');
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
  }, [toggleTheme, onOpenCommandPalette, navigate]);

  return (
    <header
      className={`h-16 sticky top-0 z-30 flex items-center justify-between px-6 transition-colors duration-300 backdrop-blur-[24px] ${
        isLight
          ? 'bg-white/90 border-b border-[#E5E7EB] text-[#111827]'
          : 'bg-[#0E121B]/82 border-b border-white/[0.08] text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Left: Mobile Menu Toggle, Workspace Switcher & Global Search */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Hamburger Drawer Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle Navigation Drawer"
          className={`lg:hidden p-2.5 rounded-xl border flex items-center justify-center transition-all min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 ${
            isLight
              ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#111827] hover:bg-[#E5E7EB]'
              : 'bg-[#181E2C]/80 border-white/[0.08] text-gray-200 hover:bg-[#20283A]'
          }`}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* Interactive Workspace Switcher Dropdown */}
        <div className="relative hidden sm:block" ref={workspaceRef}>
          <button
            type="button"
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:border-blue-500/50 ${
              isLight
                ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#111827]'
                : 'bg-[#181E2C]/80 border-white/[0.08] text-gray-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#0B84FF]" />
            <span className="font-medium">{currentOrganization?.name || 'Acme Enterprise'}</span>
            <span className="font-mono opacity-50">/</span>
            <span className="text-sky-400 font-mono font-bold">{currentWorkspace?.name || 'Workspace A'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
          </button>

          {/* Workspace Switcher Menu */}
          {isWorkspaceOpen && (
            <div
              className={`absolute left-0 mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-fade-in p-3 space-y-3 ${
                isLight
                  ? 'bg-white border-gray-200 text-gray-900'
                  : 'bg-[#0E121B] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/40 px-1">
                <span className="text-[10px] uppercase font-mono font-bold text-muted-foreground">Select Workspace</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{workspaces.length} Environments Available</span>
              </div>

              {/* Workspaces List: My Startup, OpenAI Team, Finance Team, Healthcare, Research Lab */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {workspaces.map((ws) => {
                  const isSelected = currentWorkspace?.id === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        setWorkspace(ws);
                        setIsWorkspaceOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? isLight
                            ? 'bg-blue-50 border-blue-200 text-blue-900'
                            : 'bg-blue-600/15 border-blue-500/40 text-blue-200'
                          : isLight
                          ? 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold truncate">{ws.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </div>
                        {ws.resources && (
                          <div className="text-[10px] font-mono text-muted-foreground truncate">
                            {ws.resources.settings?.environment || ws.resources.analytics?.environment || 'Active'} • {ws.resources.users || 4} Members
                          </div>
                        )}
                      </div>

                      {ws.resources && (
                        <div className="flex items-center space-x-1.5 text-[9px] font-mono shrink-0">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {ws.resources.agents} Agents
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {ws.resources.documents} Docs
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Current Workspace Resource Actions */}
              {currentWorkspace && (
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase font-bold px-1">
                    {currentWorkspace.name} Resources
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceOpen(false);
                        navigate('/prompt-studio');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 text-left flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prompts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceOpen(false);
                        navigate('/second-brain');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 text-left flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Documents</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceOpen(false);
                        navigate('/agents');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 text-left flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>Agents</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsWorkspaceOpen(false);
                        navigate('/settings');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/5 text-left flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all w-32 sm:w-52 md:w-72 justify-between group focus:outline-none focus:ring-2 focus:ring-blue-500/50 touch-manipulation active:scale-95 ${
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
          onOpenOnboarding={onOpenOnboarding}
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
