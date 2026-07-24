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
      className={`h-screen sticky top-0 flex flex-col justify-between transition-all duration-300 z-40 backdrop-blur-[30px] ${
        isLight
          ? 'bg-[#FAFAFA]/90 border-r border-[#E5E7EB]'
          : 'bg-[#0E121B]/85 border-r border-white/[0.08] shadow-[1px_0_30px_rgba(0,0,0,0.4)]'
      } ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div>
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center justify-between px-4 border-b ${
            isLight ? 'border-[#E5E7EB]' : 'border-white/[0.08]'
          }`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25 shrink-0 border border-white/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className={`font-extrabold text-base tracking-wider ${isLight ? 'text-[#111827]' : 'text-white'}`}>
                  AIOS
                </span>
                <span className={`text-[10px] font-mono -mt-1 uppercase ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                  Apple Pro Studio
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
                : 'border-white/[0.08] hover:bg-white/[0.06] text-gray-400'
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
                        ? 'bg-[#0B84FF] text-white shadow-md shadow-blue-500/20'
                        : 'bg-gradient-to-r from-[#0B84FF] to-[#0066CC] text-white border border-white/20 shadow-lg shadow-blue-500/25'
                      : isLight
                      ? 'text-gray-700 hover:bg-[#F3F4F6] hover:text-black'
                      : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
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
      <div className={`p-3 border-t ${isLight ? 'border-[#E5E7EB]' : 'border-white/[0.08]'}`}>
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
