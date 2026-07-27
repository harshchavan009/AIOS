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
  Search,
  ArrowDown,
  Brain,
  Network,
  Play,
  RotateCcw,
  Clock,
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
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    triggerSequence
  } = useNotificationStore();

  const { theme } = useThemeStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [filter, setFilter] = useState<'all' | 'unread' | 'agent' | 'workflow' | 'knowledge'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (filter === 'unread' && item.isRead) return false;
    if (filter !== 'all' && filter !== 'unread' && item.type !== filter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }

    return true;
  });

  const getIcon = (item: NotificationItem) => {
    switch (item.type) {
      case 'prompt_approved':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'document_indexed':
        return <Database className="w-4 h-4 text-sky-400" />;
      case 'workflow_completed':
        return <CheckCheck className="w-4 h-4 text-purple-400" />;
      case 'model_unavailable':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'token_limit':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'agent_failed':
        return <X className="w-4 h-4 text-red-400" />;
      case 'billing_reminder':
        return <Key className="w-4 h-4 text-blue-400" />;
      case 'deployment_completed':
        return <Sparkles className="w-4 h-4 text-teal-400" />;
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

      {/* Enterprise Right-Side Dropdown Notification Center */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-3 w-96 sm:w-[440px] rounded-2xl border shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right ${
            isLight
              ? 'bg-[#FFFFFF] border-[#E5E7EB] text-[#111827]'
              : 'bg-[#0E121B] border-white/[0.08] text-[#F8FAFC]'
          }`}
        >
          {/* Top Header */}
          <div
            className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0A0D14] border-white/[0.06]'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-500 animate-bounce" />
              <h3 className="text-sm font-bold tracking-tight">Enterprise Notification Center</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={triggerSequence}
                title="Reset/Trigger Demo Swarm Sequence"
                className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Demo Swarm</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-xs text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center space-x-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
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

          {/* Search & Filter Bar */}
          <div className={`p-3 border-b space-y-2 ${isLight ? 'bg-gray-50/50 border-[#E5E7EB]' : 'bg-[#080B10] border-white/[0.04]'}`}>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events (e.g., Planner, Neo4j, API Key)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto text-xs font-mono">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'agent', label: 'Agents' },
                { id: 'workflow', label: 'Workflows' },
                { id: 'knowledge', label: 'Knowledge' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilter(t.id as typeof filter)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                    filter === t.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Timeline Sequence List */}
          <div className={`max-h-[420px] overflow-y-auto divide-y ${isLight ? 'divide-[#E5E7EB]' : 'divide-white/[0.06]'}`}>
            {filteredList.length === 0 ? (
              <div className="p-10 text-center text-gray-500 space-y-2 font-mono">
                <Bell className="w-8 h-8 mx-auto text-gray-400 opacity-50" />
                <p className="text-xs">No notifications matching filter criteria</p>
              </div>
            ) : (
              filteredList.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && markAsRead(item.id)}
                  className={`p-3.5 flex items-start space-x-3.5 transition-all cursor-pointer group relative ${
                    !item.isRead
                      ? isLight
                        ? 'bg-blue-50/70 hover:bg-blue-50'
                        : 'bg-blue-950/20 hover:bg-blue-950/30'
                      : isLight
                      ? 'hover:bg-gray-50'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Timeline Node Connector Line */}
                  {idx < filteredList.length - 1 && (
                    <div className="absolute left-[27px] top-[42px] bottom-0 w-[2px] bg-border/40" />
                  )}

                  {/* Event Icon Badge */}
                  <div
                    className={`p-2.5 rounded-xl border shrink-0 mt-0.5 shadow-md relative z-10 ${
                      isLight ? 'bg-white border-[#E5E7EB]' : 'bg-[#090d16] border-white/[0.1]'
                    }`}
                  >
                    {getIcon(item)}
                  </div>

                  {/* Notification Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-xs font-bold truncate tracking-tight flex items-center space-x-1.5 ${
                          !item.isRead
                            ? 'text-white font-extrabold'
                            : 'text-gray-300'
                        }`}
                      >
                        <span>{item.title}</span>
                        {!item.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </h4>
                      <span className="text-[9px] text-muted-foreground font-mono ml-2 shrink-0 flex items-center space-x-1">
                        <Clock className="w-2.5 h-2.5 opacity-60" />
                        <span>{item.timestamp}</span>
                      </span>
                    </div>

                    <p className={`text-[11px] mt-1 leading-relaxed line-clamp-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        title="Mark as read"
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
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
          <div
            className={`p-3 border-t text-center flex items-center justify-between px-4 ${
              isLight ? 'bg-[#FAFAFA] border-[#E5E7EB]' : 'bg-[#0A0D14] border-white/[0.06]'
            }`}
          >
            <span className="text-[10px] text-muted-foreground font-mono">
              AIOS Notification Bus · {notifications.length} Events Logged
            </span>

            <button
              onClick={() => markAllAsRead()}
              className="text-[10px] font-mono text-primary hover:underline font-bold"
            >
              Clear Unread
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
