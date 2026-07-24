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
  Layers,
  Cpu,
  Award,
  Database,
  ShoppingBag,
  BarChart2
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const { theme } = useThemeStore();

  const isLight = theme === 'light';

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
      className={`h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 z-40 ${
        isLight ? 'bg-[#FAFAFA] border-r border-[#E5E7EB]' : 'bg-[#0F1117] border-r border-white/[0.06]'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div>
        {/* Brand Header */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${isLight ? 'border-[#E5E7EB]' : 'border-white/[0.06]'}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25 shrink-0">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className={`font-extrabold text-base tracking-wider ${isLight ? 'text-[#111827]' : 'text-[#F8FAFC]'}`}>
                  AIOS
                </span>
                <span className={`text-[10px] font-mono -mt-1 uppercase ${isLight ? 'text-gray-500' : 'text-[#94A3B8]'}`}>
                  Enterprise Platform
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'border-[#E5E7EB] hover:bg-[#F3F4F6] text-gray-600'
                : 'border-white/[0.06] hover:bg-[#172033] text-[#94A3B8]'
            }`}
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
                      ? isLight
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-[#1E293B] text-[#F8FAFC] border border-white/[0.06] shadow-sm'
                      : isLight
                      ? 'text-gray-700 hover:bg-[#F3F4F6] hover:text-black'
                      : 'text-[#CBD5E1] hover:bg-[#172033] hover:text-[#F8FAFC]'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isLight ? 'text-blue-600' : 'text-[#3B82F6]'}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className={`p-3 border-t ${isLight ? 'border-[#E5E7EB]' : 'border-white/[0.06]'}`}>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
