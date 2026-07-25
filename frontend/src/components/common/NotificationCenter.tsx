import React, { useState, useRef, useEffect } from 'react';
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
  X,
  WifiOff,
  Sparkles,
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
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

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

  const filteredList = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    return true;
  });

  const getIcon = (item: NotificationItem) => {
    if (item.title.includes('Claude disconnected') || item.title.includes('disconnected')) {
      return <WifiOff className="w-4 h-4 text-rose-400" />;
    }
    if (item.title.includes('DAG Executed') || item.title.startsWith('✓')) {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
    if (item.title.includes('Graph Synced')) {
      return <Database className="w-4 h-4 text-teal-400" />;
    }
    if (item.title.includes('Prompt Published')) {
      return <Sparkles className="w-4 h-4 text-amber-400" />;
    }

    switch (item.type) {
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
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className={`p-2 rounded-xl border transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isLight
            ? 'bg-[#F3F4F6] hover:bg-[#E5E7EB] border-[#E5E7EB] text-gray-700'
            : 'bg-[#181E2C]/80 hover:bg-[#20283A] border-white/[0.08] text-gray-300 hover:text-white'
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
              : 'bg-[#0E121B] border-white/[0.08] text-[#F8FAFC]'
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0A0D14] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold tracking-tight">Notification Center</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
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
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center space-x-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px] font-medium">Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  title="Clear all notifications"
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className={`px-4 py-2 border-b flex items-center space-x-2 text-xs ${isLight ? 'bg-gray-50/50 border-[#E5E7EB]' : 'bg-[#080B10] border-white/[0.04]'}`}>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className={`max-h-96 overflow-y-auto divide-y ${isLight ? 'divide-[#E5E7EB]' : 'divide-white/[0.06]'}`}>
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-gray-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-gray-400 opacity-50" />
                <p className="text-xs">No notifications in this view</p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && markAsRead(item.id)}
                  className={`p-3.5 flex items-start space-x-3.5 transition-all cursor-pointer group ${
                    !item.isRead
                      ? isLight
                        ? 'bg-blue-50/70 hover:bg-blue-50'
                        : 'bg-blue-950/20 hover:bg-blue-950/30'
                      : isLight
                      ? 'hover:bg-gray-50'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                      isLight ? 'bg-white border-[#E5E7EB]' : 'bg-white/[0.04] border-white/[0.08]'
                    }`}
                  >
                    {getIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold truncate tracking-tight flex items-center space-x-1.5 ${
                          !item.isRead
                            ? isLight
                              ? 'text-gray-900 font-extrabold'
                              : 'text-white font-extrabold'
                            : isLight
                            ? 'text-gray-700'
                            : 'text-gray-300'
                        }`}
                      >
                        <span>{item.title}</span>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono ml-2 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        title="Mark as read"
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      title="Delete notification"
                      className="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className={`p-2.5 border-t text-center ${
              isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0A0D14] border-white/[0.06]'
            }`}
          >
            <span className="text-[10px] text-muted-foreground font-mono">
              AIOS Notification Service · {notifications.length} Total Events
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

