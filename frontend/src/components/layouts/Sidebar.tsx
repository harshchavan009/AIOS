import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Network,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Sparkles,
  Brain,
  Cpu,
  BarChart2,
  SlidersHorizontal,
  X,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavGroup {
  label?: string;
  items: {
    label: string;
    icon: LucideIcon;
    path: string;
    statusDot?: boolean;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();

  const NAV_GROUPS: NavGroup[] = [
    {
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      ],
    },
    {
      label: 'Build',
      items: [
        { label: 'Agent Studio', icon: Bot, path: '/agents', statusDot: true },
        { label: 'Visual Builder', icon: Layers, path: '/agent-builder' },
        { label: 'Prompt Studio', icon: Sparkles, path: '/prompt-studio' },
        { label: 'Playground', icon: Sliders, path: '/playground' },
      ],
    },
    {
      label: 'Data',
      items: [
        { label: 'Graph RAG', icon: Network, path: '/graph-rag' },
        { label: 'Second Brain', icon: Brain, path: '/second-brain' },
      ],
    },
    {
      label: 'Evaluate',
      items: [
        { label: 'Evaluation', icon: BarChart2, path: '/evaluation' },
        { label: 'Analytics', icon: BarChart2, path: '/analytics' },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Model Gateway', icon: Cpu, path: '/models' },
        { label: 'Settings', icon: SlidersHorizontal, path: '/settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`h-screen flex flex-col justify-between z-50 bg-card border-r border-border transition-all duration-150 ${
          isMobileOpen
            ? 'fixed inset-y-0 left-0 w-60 shadow-lg translate-x-0'
            : 'fixed lg:sticky top-0 -translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-16' : 'lg:w-56'}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="h-13 flex items-center justify-between px-3.5 border-b border-border shrink-0">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-white font-semibold text-xs shrink-0">
                AI
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                    AIOS
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="hidden lg:flex p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close sidebar"
                className="lg:hidden p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Items Grouped */}
          <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
            {NAV_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-0.5">
                {group.label && !collapsed && (
                  <div className="px-2 pt-1 pb-1 text-[11px] font-medium text-muted-foreground/70 tracking-normal">
                    {group.label}
                  </div>
                )}
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-secondary text-foreground font-semibold shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        } ${collapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!collapsed && item.statusDot && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer Sign Out */}
          <div className="p-2.5 border-t border-border shrink-0">
            <button
              type="button"
              onClick={logout}
              title={collapsed ? 'Sign Out' : undefined}
              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
