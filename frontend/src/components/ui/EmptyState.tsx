import React from 'react';
import { LucideIcon, Plus, Sparkles, Bot, Search } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Bot,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = '',
}) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  return (
    <div
      className={`glass-card p-10 md:p-14 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto transition-all ${className}`}
    >
      {/* Icon Circle */}
      <div
        className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
          isLight
            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-blue-500/10'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-blue-500/20'
        }`}
      >
        <Icon className="w-8 h-8" />
      </div>

      {/* Text Header */}
      <div className="space-y-1.5 max-w-md">
        <h3 className={`text-lg md:text-xl font-extrabold tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
          {title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Buttons */}
      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl border border-border hover:bg-white/5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
            >
              <span>{secondaryLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
