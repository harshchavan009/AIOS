import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Building2,
  Key,
  CreditCard,
  Settings as SettingsIcon,
  Keyboard,
  LogOut,
  ChevronDown,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface ProfileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpenShortcuts: () => void;
  onOpenOnboarding?: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onToggle,
  onClose,
  onOpenShortcuts,
  onOpenOnboarding
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
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
        className="flex items-center space-x-2 pl-2 border-l border-border hover:opacity-90 transition-opacity focus:outline-none"
      >
        <div className="w-7 h-7 rounded bg-secondary border border-border flex items-center justify-center text-foreground font-semibold text-xs">
          {userInitial}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-medium text-foreground">
            {user?.full_name || 'AIOS Administrator'}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase font-mono leading-none">
            {user?.role || 'Admin'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-60 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden text-foreground transform transition-all duration-100 ease-out origin-top-right"
        >
          {/* User Info Header */}
          <div className="p-3 border-b border-border bg-secondary/30 space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold truncate text-foreground">
                {user?.full_name || 'AIOS Administrator'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-secondary text-muted-foreground border border-border">
                {user?.role || 'Admin'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@aios.dev'}</p>
          </div>

          {/* User Avatar Menu Items */}
          <div className="p-1.5 space-y-0.5" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/settings?tab=profile')}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Profile Settings</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/settings?tab=organization')}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Organization</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/settings?tab=api-keys')}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Key className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>API Keys</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/billing')}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Billing & Plans</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/settings')}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>System Settings</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => window.open('https://github.com/harshchavan009/AIOS', '_blank')}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LifeBuoy className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Support & Docs</span>
            </button>

            {onOpenOnboarding && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-primary hover:bg-primary/10 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Onboarding Wizard</span>
              </button>
            )}

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onClose();
                onOpenShortcuts();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Keyboard className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Keyboard Shortcuts</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono border border-border rounded bg-background text-muted-foreground">
                ⌘/
              </kbd>
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
