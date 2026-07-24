import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Building2,
  Sliders,
  Key,
  CreditCard,
  Keyboard,
  FileText,
  LogOut,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface ProfileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenShortcuts: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onToggle,
  onClose,
  onOpenShortcuts
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Avatar */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
        className="flex items-center space-x-2.5 pl-2 border-l border-white/[0.06] hover:opacity-90 transition-opacity focus:outline-none"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          {userInitial}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold text-[#F8FAFC] flex items-center space-x-1">
            <span>{user?.full_name || 'AIOS Administrator'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono -mt-0.5">
            {user?.role || 'Admin'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/[0.08] bg-[#111827] shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right">
          {/* User Info Header */}
          <div className="p-4 border-b border-white/[0.06] bg-[#0F1117] space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#F8FAFC] truncate">
                {user?.full_name || 'AIOS Administrator'}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {user?.role || 'Admin'}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@aios.dev'}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-0.5">
            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Workspace Management</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>API Keys</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/analytics')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Billing & Cost</span>
            </button>

            <div className="my-1 border-t border-white/[0.06]" />

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcuts();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <Keyboard className="w-4 h-4 text-purple-400" />
                <span>Keyboard Shortcuts</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#07090D] border border-white/[0.06] rounded text-gray-400">
                ⌘/
              </kbd>
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Documentation</span>
            </a>

            <div className="my-1 border-t border-white/[0.06]" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
