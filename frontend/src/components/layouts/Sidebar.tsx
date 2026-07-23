import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Network,
  SlidersHorizontal,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BrainCircuit,
  Sliders,
  Sparkle,
  Layers,
  Cpu,
  Award,
  Database,
  ShoppingBag,
  BarChart2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();

  const NAV_ITEMS = [
    { label: 'Landing Page', icon: Home, path: '/' },
    { label: 'Enterprise Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'AI Playground', icon: Sliders, path: '/playground', badge: 'Multi-LLM' },
    { label: 'Prompt Studio', icon: Sparkles, path: '/prompt-studio' },
    { label: 'Visual Agent Builder', icon: Layers, path: '/agent-builder', badge: 'No-Code' },
    { label: 'Multi-Agent Studio', icon: Bot, path: '/agents', badge: '6 Active' },
    { label: 'Graph RAG & Memory', icon: Network, path: '/graph-rag' },
    { label: 'Model Management', icon: Cpu, path: '/models' },
    { label: 'Evaluation Studio', icon: Award, path: '/evaluation' },
    { label: 'Knowledge Base', icon: Database, path: '/knowledge' },
    { label: 'Agent Marketplace', icon: ShoppingBag, path: '/marketplace' },
    { label: 'Enterprise Analytics', icon: BarChart2, path: '/analytics' },
    { label: 'System Settings', icon: SlidersHorizontal, path: '/settings' },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#0b0f19]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 shrink-0">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider gradient-text">
                  AIOS
                </span>
                <span className="text-[10px] text-muted-foreground font-mono -mt-1 uppercase">
                  AI Platform Studio
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
