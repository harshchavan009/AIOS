import React from 'react';
import { Search, Sun, Moon, Bell, ShieldCheck, Activity, User as UserIcon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAgentStore } from '../../store/useAgentStore';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { telemetry } = useAgentStore();

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="h-16 border-b border-border/60 bg-card/60 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Left: Global Search Trigger */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-muted/40 hover:bg-muted border border-border/50 text-muted-foreground text-sm transition-all w-64 md:w-80 justify-between group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <span>Search or command...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border/80 rounded text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Live System Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <Activity className="w-3.5 h-3.5" />
          <span>System Healthy • {telemetry?.avg_latency_ms ?? 178}ms</span>
        </div>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-border/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-semibold shadow-md shadow-primary/20">
            {userInitial}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-foreground flex items-center space-x-1">
              <span>{user?.full_name || 'Enterprise Engineer'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              {user?.role || 'Senior AI Architect'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
