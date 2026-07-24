import React, { useRef, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Zap,
  FileText,
  Bot,
  Award,
  Key,
  Database,
  Trash2,
  CheckCheck,
  Check,
  X
} from 'lucide-react';
import { useNotificationStore, NotificationItem } from '../../store/useNotificationStore';
import { useThemeStore } from '../../store/useThemeStore';

interface NotificationCenterProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationStore();
  const { theme } = useThemeStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  // Close when clicking outside
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

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'workflow':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-500" />;
      case 'agent':
        return <Bot className="w-4 h-4 text-indigo-500" />;
      case 'eval':
        return <Award className="w-4 h-4 text-purple-500" />;
      case 'key':
        return <Key className="w-4 h-4 text-sky-500" />;
      case 'knowledge':
        return <Database className="w-4 h-4 text-teal-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className={`p-2 rounded-xl border transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isLight
            ? 'bg-[#F3F4F6] hover:bg-[#E5E7EB] border-[#E5E7EB] text-gray-700'
            : 'bg-[#1F2937] hover:bg-[#273549] border-white/[0.06] text-[#94A3B8] hover:text-[#F8FAFC]'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Right-Side Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right ${
            isLight
              ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#111827]'
              : 'bg-[#111827] border-white/[0.08] text-[#F8FAFC]'
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0F1117] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1 rounded-lg text-xs text-gray-500 hover:text-blue-600 hover:bg-black/5 transition-colors flex items-center space-x-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  title="Clear all notifications"
                  className="p-1 rounded-lg text-xs text-gray-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className={`max-h-96 overflow-y-auto divide-y ${isLight ? 'divide-[#E5E7EB]' : 'divide-white/[0.04]'}`}>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-gray-400 opacity-50" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start space-x-3 transition-colors group ${
                    !item.isRead
                      ? isLight
                        ? 'bg-blue-50/60'
                        : 'bg-blue-950/20'
                      : isLight
                      ? 'hover:bg-gray-50'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                      isLight ? 'bg-gray-100 border-[#E5E7EB]' : 'bg-white/[0.04] border-white/[0.06]'
                    }`}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold truncate ${
                          !item.isRead
                            ? isLight
                              ? 'text-gray-900'
                              : 'text-[#F8FAFC]'
                            : isLight
                            ? 'text-gray-700'
                            : 'text-gray-300'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-mono ml-2 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 line-clamp-2 leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        title="Mark as read"
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(item.id)}
                      title="Delete"
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className={`p-2.5 border-t text-center ${
                isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0F1117] border-white/[0.06]'
              }`}
            >
              <span className="text-[10px] text-gray-500 font-mono">
                Showing {notifications.length} enterprise notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
