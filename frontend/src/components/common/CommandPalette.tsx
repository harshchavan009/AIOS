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
  Code2,
  Brain,
  Command,
  User,
  Users as UsersIcon,
  BookOpen,
  FolderGit2,
  Workflow as WorkflowIcon,
  CheckCircle2,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export type CommandCategory =
  | 'Pages'
  | 'Prompts'
  | 'Agents'
  | 'Workflows'
  | 'Knowledge Base'
  | 'Documents'
  | 'Models'
  | 'Users'
  | 'APIs'
  | 'Chats'
  | 'Actions';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
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
    // ── 1. Pages ──────────────────────────────────────────────────────────────
    {
      id: 'page-dashboard',
      title: 'Enterprise Infrastructure Dashboard',
      subtitle: 'Real-time live telemetry, 17 system metric indicators, running agents & Docker status',
      category: 'Pages',
      icon: Cpu,
      shortcut: '⌘1',
      action: () => handleNavigate('/dashboard'),
    },
    {
      id: 'page-playground',
      title: 'Multi-LLM Playground',
      subtitle: 'Side-by-side prompt execution and comparative generation sandbox',
      category: 'Pages',
      icon: Play,
      shortcut: '⌘2',
      action: () => handleNavigate('/playground'),
    },
    {
      id: 'page-prompt-studio',
      title: 'Prompt Studio & Registry',
      subtitle: 'Prompt engineering, template versioning, and LLM evaluation benchmarks',
      category: 'Pages',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'page-agent-builder',
      title: 'Agent Builder & Visual Canvas',
      subtitle: 'Build and wire custom multi-agent LangGraph execution nodes',
      category: 'Pages',
      icon: Bot,
      action: () => handleNavigate('/agent-builder'),
    },
    {
      id: 'page-graph-rag',
      title: 'Graph RAG & Entity Explorer',
      subtitle: 'Neo4j Knowledge Graph, sub-graph traversal & entity relationship visualization',
      category: 'Pages',
      icon: Network,
      shortcut: '⌘4',
      action: () => handleNavigate('/knowledge-graph'),
    },
    {
      id: 'page-knowledge-base',
      title: 'Knowledge Base Store',
      subtitle: 'Neo4j & Qdrant hybrid vector management store',
      category: 'Pages',
      icon: Brain,
      action: () => handleNavigate('/knowledge'),
    },
    {
      id: 'page-models',
      title: 'Model Management',
      subtitle: 'LLM providers, model router configuration, rate limits & latency monitors',
      category: 'Pages',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'page-analytics',
      title: 'Executive LLMOps Analytics',
      subtitle: 'Token volume trends, cost breakdown, latency distribution & error rates',
      category: 'Pages',
      icon: BarChart3,
      shortcut: '⌘3',
      action: () => handleNavigate('/analytics'),
    },
    {
      id: 'page-api-explorer',
      title: 'REST API Explorer & OpenAPI Docs',
      subtitle: 'Interactive REST API endpoint documentation with cURL and Python SDK examples',
      category: 'Pages',
      icon: Code2,
      action: () => handleNavigate('/api-explorer'),
    },
    {
      id: 'page-settings',
      title: 'Settings & Workspace Preferences',
      subtitle: 'API keys, organization members, security controls & billing options',
      category: 'Pages',
      icon: Settings,
      action: () => handleNavigate('/settings'),
    },

    // ── 2. Prompts ────────────────────────────────────────────────────────────
    {
      id: 'prompt-cypher-gen',
      title: 'Neo4j Cypher Query Generator',
      subtitle: 'Translate natural language queries into optimized Cypher graph traversal syntax',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'prompt-rag-synthesizer',
      title: 'Enterprise RAG Grounded Synthesizer',
      subtitle: 'Grounded factual answer composition with inline IEEE source document citations',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'prompt-task-decomposition',
      title: 'Multi-Agent Task Decomposition Template',
      subtitle: 'Structured JSON system prompt for atomic task DAG node generation',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'prompt-code-auditor',
      title: 'Python MCP Code Auditor',
      subtitle: 'Security & syntax verification prompt for sandboxed Python tool execution',
      category: 'Prompts',
      icon: Sparkles,
      action: () => handleNavigate('/prompt-studio'),
    },

    // ── 3. Agents ─────────────────────────────────────────────────────────────
    {
      id: 'agent-planner',
      title: 'Planner Agent',
      subtitle: 'LangGraph task decomposition engine and topological DAG router',
      category: 'Agents',
      icon: WorkflowIcon,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-retriever',
      title: 'Retriever Agent',
      subtitle: 'Neo4j knowledge graph traversal & Qdrant vector nearest neighbor search',
      category: 'Agents',
      icon: Network,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-tool',
      title: 'Python Tool Agent',
      subtitle: 'Isolated MCP sandbox runtime for running custom Python code and REST APIs',
      category: 'Agents',
      icon: Terminal,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-reasoning',
      title: 'Reasoning Agent',
      subtitle: 'Chain-of-thought synthesis and factual multi-hop deduction node',
      category: 'Agents',
      icon: Brain,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-critic',
      title: 'Critic Agent',
      subtitle: 'RAGAS quality benchmark, groundedness scorer & hallucination validator',
      category: 'Agents',
      icon: Shield,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'agent-response',
      title: 'Response Agent',
      subtitle: 'Structured markdown formatter, executive summary builder & streaming output node',
      category: 'Agents',
      icon: Bot,
      action: () => handleNavigate('/agents'),
    },

    // ── 4. Workflows ──────────────────────────────────────────────────────────
    {
      id: 'wf-graph-indexing',
      title: 'Neo4j Knowledge Graph Sync Workflow',
      subtitle: 'Automated entity extraction, graph relation linking & vector embedding indexing',
      category: 'Workflows',
      icon: FolderGit2,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'wf-financial-audit',
      title: 'Enterprise Compliance & Financial Audit DAG',
      subtitle: 'Multi-agent LangGraph workflow for document verification and regulatory reporting',
      category: 'Workflows',
      icon: FolderGit2,
      action: () => handleNavigate('/agents'),
    },
    {
      id: 'wf-auto-dev',
      title: 'Autonomous Software Engineering Workflow',
      subtitle: 'End-to-end task decomposition, code generation, sandboxed testing & PR creation',
      category: 'Workflows',
      icon: FolderGit2,
      action: () => handleNavigate('/auto-dev'),
    },

    // ── 5. Knowledge Base ─────────────────────────────────────────────────────
    {
      id: 'kb-neo4j-graph',
      title: 'Neo4j Enterprise Knowledge Graph Store',
      subtitle: '14,820 entity nodes, 38,450 relation edges with Cypher query interface',
      category: 'Knowledge Base',
      icon: Network,
      action: () => handleNavigate('/knowledge-graph'),
    },
    {
      id: 'kb-qdrant-vector',
      title: 'Qdrant Vector Embeddings Collection',
      subtitle: 'Collection: `aios_embeddings_v2` (3,890 vectors, HNSW index cosine distance)',
      category: 'Knowledge Base',
      icon: Database,
      action: () => handleNavigate('/knowledge'),
    },
    {
      id: 'kb-hybrid-retrieval',
      title: 'Hybrid BM25 + Vector Fusion Index',
      subtitle: 'Reciprocal Rank Fusion (RRF) index combining keyword sparse and dense vectors',
      category: 'Knowledge Base',
      icon: BookOpen,
      action: () => handleNavigate('/knowledge'),
    },

    // ── 6. Documents ──────────────────────────────────────────────────────────
    {
      id: 'doc-neo4j-spec',
      title: 'Neo4j_Graph_Architecture_v4.pdf',
      subtitle: 'Indexed in Qdrant & Neo4j vector store (128 chunk embeddings)',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },
    {
      id: 'doc-aios-architecture',
      title: 'AIOS_Enterprise_Spec_v3.pdf',
      subtitle: 'System clean architecture specification and API gateway protocol',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },
    {
      id: 'doc-ragas-eval',
      title: 'RAG_Benchmark_Results_2026.csv',
      subtitle: 'RAGAS evaluation report across 500 test cases with faithfulness scores',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },
    {
      id: 'doc-soc2-compliance',
      title: 'SOC2_Type_II_Compliance_Report.pdf',
      subtitle: 'Enterprise security matrix and access control audit logs',
      category: 'Documents',
      icon: FileText,
      action: () => handleNavigate('/second-brain'),
    },

    // ── 7. Models ─────────────────────────────────────────────────────────────
    {
      id: 'model-gpt4o',
      title: 'OpenAI GPT-4o',
      subtitle: 'Flagship multi-modal LLM router engine (128K context, 138ms latency)',
      category: 'Models',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-claude-35',
      title: 'Anthropic Claude 3.5 Sonnet',
      subtitle: 'High-precision reasoning, logic & code synthesis model (154ms latency)',
      category: 'Models',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-gemini-15',
      title: 'Google Gemini 1.5 Pro',
      subtitle: '2 Million token context window & multi-modal RAG embedding engine',
      category: 'Models',
      icon: Database,
      action: () => handleNavigate('/models'),
    },
    {
      id: 'model-llama-3',
      title: 'Llama 3 70B (Groq LPU)',
      subtitle: 'Ultra-low latency open weights inference server (32ms latency)',
      category: 'Models',
      icon: Terminal,
      action: () => handleNavigate('/models'),
    },

    // ── 8. Users ──────────────────────────────────────────────────────────────
    {
      id: 'user-harsh',
      title: 'Harsh Chavan',
      subtitle: 'harsh@aios.ai — Platform Owner & Chief Architect (Admin)',
      category: 'Users',
      icon: User,
      action: () => handleNavigate('/settings'),
    },
    {
      id: 'user-sarah',
      title: 'Sarah Chen',
      subtitle: 'sarah.chen@aios.ai — Lead AI & Multi-Agent Engineer',
      category: 'Users',
      icon: User,
      action: () => handleNavigate('/settings'),
    },
    {
      id: 'user-alex',
      title: 'Alex Rivera',
      subtitle: 'alex.rivera@aios.ai — SecOps & Compliance Lead',
      category: 'Users',
      icon: User,
      action: () => handleNavigate('/settings'),
    },
    {
      id: 'user-system-bot',
      title: 'AIOS System Worker Bot',
      subtitle: 'system-bot@aios.internal — Automated Celery Worker Account',
      category: 'Users',
      icon: UsersIcon,
      action: () => handleNavigate('/settings'),
    },

    // ── 9. APIs ───────────────────────────────────────────────────────────────
    {
      id: 'api-upload-stream',
      title: 'POST /api/v1/rag/upload/stream',
      subtitle: 'Stream 9-stage Graph RAG upload pipeline (OCR ➔ Neo4j ➔ Qdrant)',
      category: 'APIs',
      icon: Code2,
      action: () => handleNavigate('/api-explorer'),
    },
    {
      id: 'api-github-ingest',
      title: 'POST /api/v1/rag/github',
      subtitle: 'Clone and index GitHub repository into Graph RAG pipeline',
      category: 'APIs',
      icon: Code2,
      action: () => handleNavigate('/api-explorer'),
    },
    {
      id: 'api-hybrid-query',
      title: 'POST /api/v1/rag/query',
      subtitle: 'Execute hybrid vector similarity search + 3-hop Neo4j entity traversal',
      category: 'APIs',
      icon: Code2,
      action: () => handleNavigate('/api-explorer'),
    },
    {
      id: 'api-billing-subscription',
      title: 'GET /api/v1/billing/subscription',
      subtitle: 'Fetch active subscription plan, token usage metrics & invoice history',
      category: 'APIs',
      icon: Code2,
      action: () => handleNavigate('/api-explorer'),
    },

    // ── 10. Chats ─────────────────────────────────────────────────────────────
    {
      id: 'chat-thread-1',
      title: 'Graph RAG & LangGraph DAG Conversation Thread',
      subtitle: 'Live AI Playground chat thread with Mermaid diagram & Markdown output',
      category: 'Chats',
      icon: Play,
      action: () => handleNavigate('/playground'),
    },
    {
      id: 'chat-copilot-thread',
      title: 'AIOS Enterprise Copilot Session',
      subtitle: 'Bottom-right platform assistant session (7 action commands)',
      category: 'Chats',
      icon: Sparkles,
      action: () => handleNavigate('/playground'),
    },
    {
      id: 'chat-model-arena',
      title: 'Model Comparison Arena Thread',
      subtitle: 'GPT-4o vs Claude 3.5 Sonnet side-by-side prompt execution benchmark',
      category: 'Chats',
      icon: BarChart3,
      action: () => handleNavigate('/playground'),
    },

    // ── 11. Actions ───────────────────────────────────────────────────────────
    {
      id: 'action-create-agent',
      title: 'Create Custom Agent',
      subtitle: 'Launch Agent Builder to configure a new autonomous agent node',
      category: 'Actions',
      icon: Bot,
      shortcut: '⌘A',
      action: () => handleNavigate('/agent-builder'),
    },
    {
      id: 'action-create-prompt',
      title: 'Create System Prompt',
      subtitle: 'Open Prompt Studio to draft, test, and register new system prompts',
      category: 'Actions',
      icon: Sparkles,
      shortcut: '⌘P',
      action: () => handleNavigate('/prompt-studio'),
    },
    {
      id: 'action-upload-doc',
      title: 'Upload Document / Knowledge File',
      subtitle: 'Index PDF or CSV files into Qdrant & Neo4j vector stores',
      category: 'Actions',
      icon: Upload,
      shortcut: '⌘U',
      action: () => handleNavigate('/second-brain'),
    },
  ];

  // Category filter tabs list
  const CATEGORIES: Array<string> = [
    'All',
    'Prompts',
    'Agents',
    'Documents',
    'Users',
    'Workflows',
    'APIs',
    'Models',
    'Chats',
    'Pages',
  ];

  const filteredCommands = COMMANDS.filter((cmd) => {
    const matchesFilter =
      activeCategoryFilter === 'All' || cmd.category === activeCategoryFilter;
    if (!matchesFilter) return false;

    const q = query.toLowerCase().trim();
    if (!q) return true;

    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Reset selected index when query or filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategoryFilter]);

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

  // Group active filtered commands by category for display
  const activeDisplayCategories = CATEGORIES.filter(
    (cat) => cat !== 'All' && (activeCategoryFilter === 'All' || activeCategoryFilter === cat)
  ) as CommandCategory[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans"
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
            placeholder="Search everything (Pages, Prompts, Agents, Workflows, Knowledge Base, Documents, Models, Users)..."
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

        {/* Category Filter Pills Bar */}
        <div className={`flex items-center space-x-1 px-4 py-2 border-b overflow-x-auto scrollbar-none text-xs font-medium ${
          isLight ? 'border-gray-200 bg-gray-100/60' : 'border-white/[0.06] bg-[#0A0D15]'
        }`}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : isLight
                    ? 'text-gray-600 hover:bg-gray-200'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Command List View */}
        <div className="max-h-[26rem] overflow-y-auto p-2 divide-y divide-white/[0.04]" ref={listRef}>
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm space-y-2">
              <Command className="w-8 h-8 mx-auto text-gray-500 opacity-50" />
              <p>No matching entities found for "{query}"</p>
              <p className="text-xs opacity-60 font-mono">
                Try searching "Dashboard", "Planner Agent", "Neo4j", "GPT-4o", or "Harsh"
              </p>
            </div>
          ) : (
            activeDisplayCategories.map((cat) => {
              const catItems = filteredCommands.filter((c) => c.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="py-1.5">
                  <div className="px-3 py-1 text-[10px] font-bold font-mono text-muted-foreground/70 uppercase tracking-wider flex items-center justify-between">
                    <span>{cat}</span>
                    <span className="text-[9px] opacity-60 font-sans">{catItems.length} items</span>
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
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono border border-white/10">Ctrl / ⌘ + K</kbd>
              <span>Toggle</span>
            </span>
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
            <span className="text-blue-500 font-bold">AIOS</span> Global Search
          </div>
        </div>
      </div>
    </div>
  );
};
