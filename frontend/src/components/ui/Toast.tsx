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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="p-3.5 rounded-lg bg-card border border-border shadow-md flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" strokeWidth={1.5} />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={1.5} />}
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">{toast.title}</div>
              {toast.message && <div className="text-xs text-muted-foreground leading-normal">{toast.message}</div>}
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss toast"
            className="text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
