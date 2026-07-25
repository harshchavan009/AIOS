import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Check,
  Zap,
  FileText,
  Bot,
  Award,
  Key,
  Database,
  Sparkles,
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
      setActiveToasts((prev) => {
        if (prev.some((t) => t.id === latest.id)) return prev;
        return [latest, ...prev].slice(0, 4); // keep max 4 visible toasts
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

  const getIcon = (type: NotificationItem['type'], title: string) => {
    if (title.startsWith('✓') || title.toLowerCase().includes('created')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    switch (type) {
      case 'agent':
        return <Bot className="w-4 h-4 text-indigo-400" />;
      case 'document':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'knowledge':
        return <Database className="w-4 h-4 text-teal-400" />;
      case 'key':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'workflow':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'eval':
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <Check className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-auto">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all transform duration-300 animate-slide-up flex items-start space-x-3 ${
            isLight
              ? 'bg-white/95 border-gray-200 text-gray-900 shadow-blue-500/10'
              : 'bg-[#0E121B]/95 border-white/10 text-white shadow-black/80'
          }`}
        >
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              isLight ? 'bg-blue-50 border-blue-100' : 'bg-white/5 border-white/10'
            }`}
          >
            {getIcon(toast.type, toast.title)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold truncate tracking-tight text-foreground flex items-center space-x-1">
                <span>{toast.title}</span>
              </h4>
              <span className="text-[10px] text-muted-foreground/70 font-mono ml-2 shrink-0">Just now</span>
            </div>
            {toast.description && (
              <p className="text-[11px] mt-0.5 text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                {toast.description}
              </p>
            )}
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
