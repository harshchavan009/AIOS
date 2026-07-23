import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="p-4 rounded-2xl glass-card border border-white/10 shadow-2xl flex items-start justify-between space-x-3 animate-slide-up"
        >
          <div className="flex items-start space-x-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
            <div>
              <div className="text-sm font-bold text-foreground">{toast.title}</div>
              {toast.message && <div className="text-xs text-muted-foreground mt-0.5">{toast.message}</div>}
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
