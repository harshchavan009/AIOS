import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: '⌘ + K', description: 'Open Global Command Palette' },
    { key: '⌘ + Shift + D', description: 'Toggle Theme System (Graphite vs Light)' },
    { key: 'N', description: 'Open Notifications Panel' },
    { key: 'Esc', description: 'Close Modals & Dropdown Menus' },
    { key: '⌘ + /', description: 'Open Keyboard Shortcuts Cheatsheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-white/10 glass-card p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Keyboard Shortcuts</h3>
              <p className="text-xs text-gray-400">Boost your productivity with global hotkeys</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <span className="text-xs font-medium text-gray-300">{item.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-bold bg-[#07090D] border border-white/[0.08] rounded-lg text-blue-400 shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
