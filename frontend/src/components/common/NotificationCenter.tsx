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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'workflow':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'agent':
        return <Bot className="w-4 h-4 text-indigo-400" />;
      case 'eval':
        return <Award className="w-4 h-4 text-purple-400" />;
      case 'key':
        return <Key className="w-4 h-4 text-sky-400" />;
      case 'knowledge':
        return <Database className="w-4 h-4 text-teal-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className="p-2 rounded-xl border border-white/[0.06] bg-[#1F2937] hover:bg-[#273549] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors relative focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-white/[0.08] bg-[#111827] shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0F1117]">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
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
                  className="p-1 rounded-lg text-xs text-gray-400 hover:text-blue-400 hover:bg-white/[0.05] transition-colors flex items-center space-x-1"
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
                  className="p-1 rounded-lg text-xs text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-gray-600 opacity-50" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start space-x-3 transition-colors group ${
                    !item.isRead ? 'bg-blue-950/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${!item.isRead ? 'text-[#F8FAFC]' : 'text-gray-300'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-mono ml-2 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(item.id)}
                        title="Mark as read"
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(item.id)}
                      title="Delete"
                      className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
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
            <div className="p-2.5 bg-[#0F1117] border-t border-white/[0.06] text-center">
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
