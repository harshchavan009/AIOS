import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Cpu,
  Database,
  Network,
  Settings,
  Terminal,
  X,
  Shield,
  ArrowRight,
  Sparkles,
  Bot,
  FileText,
  Upload,
  Play,
  Layers,
  BarChart3,
  Compass,
  Code2,
  Brain,
  SlidersHorizontal,
  Command,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Pages' | 'Models' | 'Agents' | 'Prompts' | 'Workflows' | 'Documents' | 'Actions';
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const listRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const COMMANDS: CommandItem[] = [
    {
      id: 'page-api-explorer',
      title: 'REST API Explorer',
      subtitle: 'OpenAPI REST endpoints documentation and cURL / Python examples',
      category: 'Pages',
      icon: Code2,
      action: () => handleNavigate('/api-explorer'),
    },
    {
      id: 'page-graph-rag',
      title: 'Graph RAG',
      subtitle: 'Neo4j Knowledge Graph & Entity Relations',
      category: 'Pages',
      icon: Network,
      shortcut: '⌘4',
      action: () => handleNavigate('/knowledge-graph'),
    },
    {
      id: 'page-knowledge-base',
      title: 'Knowledge Base',
      subtitle: 'Neo4j & Qdrant Knowledge Management Store',
      category: 'Pages',
      icon: Brain,
      action: () => handleNavigate('/knowledge'),
    },
    {
      id: 'page-dashboard',
      title: 'Enterprise Dashboard',
      subtitle: 'Real-time telemetry, 17 system metrics, and Docker status',
      category: 'Pages',
      icon: Cpu,
      shortcut: '⌘1',
      action: () => handleNavigate('/dashboard'),
    },
    {
      id: 'page-playground',
      title: 'Playground',
      subtitle: 'Multi-LLM comparative generation sandbox',
      category: 'Pages',
      icon: Play,
      shortcut: '⌘2',
      action: () => handleNavigate('/playground'),
    },
    {
      id: 'page-prompt-studio',
      title: 'Prompt Studio',
      subtitle: 'Prompt engineering, registry, and versioning',
      category: 'Pages',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'page-agent-builder',
      title: 'Agent Builder',
      subtitle: 'Build custom multi-agent LangGraph nodes',
      category: 'Pages',
      icon: Bot,
      action: () => handleNavigate('/agent-builder'),
    },
    {
      id: 'page-models',
      title: 'Model Management',
      subtitle: 'LLM providers, rate limits, and latencies',
      category: 'Pages',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'page-analytics',
      title: 'Executive Analytics',
      subtitle: 'Token usage volume, expenditures, and latency trends',
      category: 'Pages',
      icon: BarChart3,
      shortcut: '⌘3',
      action: () => handleNavigate('/analytics'),
    },

    // ── Models ────────────────────────────────────────────────────────────────
    {
      id: 'model-neo4j-retriever',
      title: 'Neo4j Retriever',
      subtitle: 'Graph-aware vector retrieval model adapter for Neo4j',
      category: 'Models',
      icon: Network,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-gpt4o',
      title: 'OpenAI GPT-4o',
      subtitle: 'Flagship multi-modal LLM router engine (128K ctx)',
      category: 'Models',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-claude',
      title: 'Claude 3.5 Sonnet',
      subtitle: 'High precision reasoning & code synthesis model',
      category: 'Models',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-gemini',
      title: 'Gemini 1.5 Pro',
      subtitle: '2 Million token context window & multi-modal RAG',
      category: 'Models',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-llama3',
      title: 'Llama 3 70B (Groq)',
      subtitle: 'Ultra-low latency LPU inference engine',
      category: 'Models',
      icon: Terminal,
      action: () => handleNavigate('/models'),
    },

    // ── Agents ────────────────────────────────────────────────────────────────
    {
      id: 'agent-planner',
      title: 'Planner Agent',
      subtitle: 'LangGraph task decomposition and topology planner',
      category: 'Agents',
      icon: Brain,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-retriever',
      title: 'Retriever Agent',
      subtitle: 'Neo4j graph traversal and Qdrant vector search worker',
      category: 'Agents',
      icon: Network,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-tool',
      title: 'Python Tool Agent',
      subtitle: 'MCP tool execution & sandboxed Python runtime',
      category: 'Agents',
      icon: Terminal,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-critic',
      title: 'Critic Agent',
      subtitle: 'RAGAS quality evaluator & faithfulness validator',
      category: 'Agents',
      icon: Shield,
      action: () => handleNavigate('/agents'),
    },

    // ── Prompts ───────────────────────────────────────────────────────────────
    {
      id: 'prompt-neo4j-cypher',
      title: 'Neo4j Cypher Generator',
      subtitle: 'Generate Cypher graph queries from natural language goals',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'prompt-rag-synthesizer',
      title: 'Enterprise RAG Synthesizer',
      subtitle: 'Grounded response generation with full source citations',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'prompt-task-planner',
      title: 'Multi-Agent Task Decomposition Prompt',
      subtitle: 'Structured JSON system prompt for atomic task breakdown',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },

    // ── Workflows ─────────────────────────────────────────────────────────────
    {
      id: 'wf-neo4j-indexing',
      title: 'Neo4j Knowledge Graph Indexing Workflow',
      subtitle: 'Automated entity extraction and Cypher graph sync pipeline',
      category: 'Workflows',
      icon: Layers,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'wf-compliance-audit',
      title: 'Enterprise Financial Compliance Audit',
      subtitle: 'Multi-agent LangGraph audit DAG with tool verification',
      category: 'Workflows',
      icon: Layers,
      action: () => handleNavigate('/agents'),
    },

    // ── Documents ─────────────────────────────────────────────────────────────
    {
      id: 'doc-neo4j-arch',
      title: 'Neo4j_Graph_Architecture_v4.pdf',
      subtitle: 'Indexed in Qdrant & Neo4j vector store (128 vectors)',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },
    {
      id: 'doc-aios-spec',
      title: 'AIOS_Enterprise_Spec_v3.pdf',
      subtitle: 'System architecture and API gateway spec',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },
    {
      id: 'doc-rag-benchmarks',
      title: 'RAG_Benchmark_Results_2026.csv',
      subtitle: 'RAGAS evaluation dataset across 500 test cases',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },

    // ── Quick Actions ─────────────────────────────────────────────────────────
    {
      id: 'create-prompt',
      title: 'Create Prompt',
      subtitle: 'Open Prompt Studio to draft and test new system prompts',
      category: 'Actions',
      icon: Sparkles,
      shortcut: '⌘P',
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'create-agent',
      title: 'Create Agent',
      subtitle: 'Build a new autonomous multi-agent worker node',
      category: 'Actions',
      icon: Bot,
      shortcut: '⌘A',
      action: () => handleNavigate('/agent-builder'),
    },
    {
      id: 'upload-pdf',
      title: 'Upload PDF / Document',
      subtitle: 'Index documents into Qdrant & Neo4j vector store',
      category: 'Actions',
      icon: Upload,
      shortcut: '⌘U',
      action: () => handleNavigate('/second-brain'),
    },
  ];

  const filteredCommands = COMMANDS.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  if (!isOpen) return null;

  // Group commands by category for display
  const categories: Array<CommandItem['category']> = [
    'Pages',
    'Models',
    'Agents',
    'Prompts',
    'Workflows',
    'Documents',
    'Actions',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-200 ${
          isLight
            ? 'bg-white border-gray-200 text-gray-900 shadow-blue-500/10'
            : 'bg-[#0E121B] border-white/10 text-white shadow-black/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className={`flex items-center px-4 py-3.5 border-b ${isLight ? 'border-gray-200 bg-gray-50/50' : 'border-white/10 bg-[#080B10]'}`}>
          <Search className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
          <input
            type="text"
            className={`w-full bg-transparent placeholder:text-muted-foreground focus:outline-none text-base font-medium ${
              isLight ? 'text-gray-900' : 'text-white'
            }`}
            placeholder="Type a command or search (e.g., Create Agent, Upload PDF, Open Dashboard)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command List View */}
        <div className="max-h-[26rem] overflow-y-auto p-2 divide-y divide-white/[0.04]" ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm space-y-2">
              <Command className="w-8 h-8 mx-auto text-gray-500 opacity-50" />
              <p>No matching commands found for "{query}"</p>
              <p className="text-xs opacity-60 font-mono">Try searching "Dashboard", "Agent", "Upload", or "Prompt"</p>
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredCommands.filter((c) => c.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="py-1.5">
                  <div className="px-3 py-1 text-[10px] font-bold font-mono text-muted-foreground/70 uppercase tracking-wider">
                    {cat}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {catItems.map((cmd) => {
                      const globalIdx = filteredCommands.findIndex((c) => c.id === cmd.id);
                      const isSelected = globalIdx === selectedIndex;
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          type="button"
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${
                            isSelected
                              ? isLight
                                ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-sm'
                                : 'bg-blue-600/15 border border-blue-500/30 text-white'
                              : 'border border-transparent hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : isLight
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-white/5 text-gray-400 group-hover:text-white'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold truncate ${isSelected ? 'text-blue-500' : ''}`}>
                                {cmd.title}
                              </div>
                              {cmd.subtitle && (
                                <div className="text-[11px] text-muted-foreground truncate font-sans opacity-80">
                                  {cmd.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 ml-3">
                            {cmd.shortcut && (
                              <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                                isLight
                                  ? 'bg-white border-gray-200 text-gray-500'
                                  : 'bg-white/5 border-white/10 text-gray-400'
                              }`}>
                                {cmd.shortcut}
                              </kbd>
                            )}
                            <ArrowRight className={`w-3.5 h-3.5 transition-opacity ${isSelected ? 'opacity-100 text-blue-500' : 'opacity-0'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between text-[11px] text-muted-foreground ${
          isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#080B10] border-white/10'
        }`}>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] font-mono border border-white/10">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] font-mono border border-white/10">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1 py-0.5 bg-white/10 rounded text-[9px] font-mono border border-white/10">Esc</kbd>
              <span>Close</span>
            </span>
          </div>

          <div className="flex items-center space-x-1 font-mono text-[10px]">
            <span className="text-blue-500 font-bold">AIOS</span> Command Palette
          </div>
        </div>
      </div>
    </div>
  );
};

