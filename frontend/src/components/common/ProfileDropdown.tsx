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
import { useThemeStore } from '../../store/useThemeStore';

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
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

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
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
        className={`flex items-center space-x-2.5 pl-2 border-l hover:opacity-90 transition-opacity focus:outline-none ${
          isLight ? 'border-[#E5E7EB]' : 'border-white/[0.06]'
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          {userInitial}
        </div>
        <div className="hidden md:block text-left">
          <div className={`text-xs font-semibold flex items-center space-x-1 ${isLight ? 'text-[#111827]' : 'text-[#F8FAFC]'}`}>
            <span>{user?.full_name || 'AIOS Administrator'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className={`text-[10px] uppercase tracking-wider font-mono -mt-0.5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {user?.role || 'Admin'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-3 w-64 rounded-2xl border shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right ${
            isLight
              ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#111827]'
              : 'bg-[#111827] border-white/[0.08] text-[#F8FAFC]'
          }`}
        >
          {/* User Info Header */}
          <div
            className={`p-4 border-b space-y-1 ${
              isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0F1117] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold truncate ${isLight ? 'text-[#111827]' : 'text-[#F8FAFC]'}`}>
                {user?.full_name || 'AIOS Administrator'}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {user?.role || 'Admin'}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@aios.dev'}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2 space-y-0.5">
            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <UserIcon className="w-4 h-4 text-blue-500" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Building2 className="w-4 h-4 text-sky-500" />
              <span>Workspace Management</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>API Keys</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/analytics')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Billing & Cost</span>
            </button>

            <div className={`my-1 border-t ${isLight ? 'border-[#E5E7EB]' : 'border-white/[0.06]'}`} />

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcuts();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Keyboard className="w-4 h-4 text-purple-500" />
                <span>Keyboard Shortcuts</span>
              </div>
              <kbd className={`px-1.5 py-0.5 text-[10px] font-mono border rounded ${isLight ? 'bg-gray-100 border-[#E5E7EB] text-gray-600' : 'bg-[#07090D] border-white/[0.06] text-gray-400'}`}>
                ⌘/
              </kbd>
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isLight ? 'text-gray-700 hover:bg-gray-100 hover:text-black' : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-500" />
              <span>Documentation</span>
            </a>

            <div className={`my-1 border-t ${isLight ? 'border-[#E5E7EB]' : 'border-white/[0.06]'}`} />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
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
