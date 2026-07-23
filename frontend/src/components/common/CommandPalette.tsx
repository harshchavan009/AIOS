import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Cpu, Database, Network, Settings, Terminal, X, Shield, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const COMMANDS = [
    { title: 'Enterprise Dashboard', icon: Cpu, path: '/dashboard', category: 'Navigation' },
    { title: 'Multi-Agent Orchestration Workspace', icon: Terminal, path: '/agents', category: 'Modules' },
    { title: 'Graph RAG & Knowledge Base', icon: Network, path: '/graph-rag', category: 'Modules' },
    { title: 'LLM Gateway & Token Metrics', icon: Database, path: '/dashboard', category: 'Infrastructure' },
    { title: 'Platform Security & Access Control (RBAC)', icon: Shield, path: '/settings', category: 'Settings' },
    { title: 'System Configurations', icon: Settings, path: '/settings', category: 'Settings' },
  ];

  const filteredCommands = COMMANDS.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden glass-card">
        <div className="flex items-center px-4 border-b border-border/60">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            type="text"
            className="w-full py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
            placeholder="Type a command or search AIOS modules... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No matching AIOS commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cmd.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {cmd.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{cmd.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-muted/30 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>AIOS Global Command Palette</span>
          <div className="flex items-center space-x-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">⌘K</kbd>
            <span>to open</span>
          </div>
        </div>
      </div>
    </div>
  );
};
