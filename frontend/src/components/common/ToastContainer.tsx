import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  Zap,
  FileText,
  Bot,
  Award,
  Key,
  Database,
  X
} from 'lucide-react';
import { useNotificationStore, NotificationItem } from '../../store/useNotificationStore';
import { useThemeStore } from '../../store/useThemeStore';

export const ToastContainer: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const { theme } = useThemeStore();
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);

  const isLight = theme === 'light';

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      // Check if latest notification was created recently and not already active
      setActiveToasts((prev) => {
        if (prev.some((t) => t.id === latest.id)) return prev;
        return [latest, ...prev].slice(0, 3); // keep max 3 visible toasts
      });

      // Auto dismiss after 4500ms
      const timer = setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== latest.id));
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const dismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-auto">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all transform duration-300 animate-slide-up flex items-start space-x-3.5 ${
            isLight
              ? 'bg-white/95 border-gray-200 text-gray-900 shadow-blue-500/10'
              : 'bg-[#111827]/95 border-white/10 text-white shadow-black/50'
          }`}
        >
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-blue-50 border-blue-100' : 'bg-blue-950/40 border-blue-800/30'
            }`}
          >
            {getIcon(toast.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold truncate tracking-tight">{toast.title}</h4>
              <span className="text-[10px] text-muted-foreground font-mono ml-2 shrink-0">Live Event</span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground line-clamp-2 leading-relaxed">
              {toast.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
