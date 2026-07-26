import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Download,
  Upload,
  RotateCcw,
  Bot,
  Zap,
  Loader2,
  Trophy,
  Clock,
  Coins,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Brain,
  MessageSquare,
  Plus,
  Trash2,
  Share2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  FileSpreadsheet,
  FileCode,
  Copy,
  Check,
  Send,
  Sliders,
  X,
  FileDown,
  Folder,
  FolderPlus,
  Pin,
  PinOff,
  Search,
  ChevronRight,
  ChevronDown,
  Edit3,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  checked: boolean;
  contextWindow: string;
  pricing: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'docx' | 'csv';
  sizeStr: string;
  data: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  latency_ms?: number;
  tokens?: number;
  cost?: number;
  execution_time_s?: number;
  model_used?: string;
  attachments?: FileAttachment[];
  isStreaming?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  color: string;
}

export interface ConversationThread {
  id: string;
  title: string;
  folderId?: string;
  isPinned: boolean;
  updatedAt: string;
  messages: Message[];
  modelId: string;
  systemPrompt: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export interface ModelOutput {
  modelId: string;
  modelName: string;
  provider: string;
  output: string;
  isStreaming?: boolean;
  latency_ms: number;
  execution_time_s: number;
  tokens: number;
  cost: number;
  qualityScore: number;
  hallucinationScore: number;
  safetyScore: number;
  composite_score: number;
  context_window: string;
  strengths: string;
}

const ALL_MODELS: ModelConfig[] = [
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'OpenAI', color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/40', textColor: 'text-emerald-400', checked: true, contextWindow: '128k', pricing: '$2.50 / 1M' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/40', textColor: 'text-orange-400', checked: true, contextWindow: '200k', pricing: '$3.00 / 1M' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google AI', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/40', textColor: 'text-blue-400', checked: true, contextWindow: '2M', pricing: '$1.25 / 1M' },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta / Groq', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/40', textColor: 'text-violet-400', checked: false, contextWindow: '8k', pricing: '$0.50 / 1M' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', color: 'from-cyan-500 to-sky-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/40', textColor: 'text-cyan-400', checked: false, contextWindow: '64k', pricing: '$0.14 / 1M' },
];

const INITIAL_FOLDERS: FolderItem[] = [
  { id: 'f-architecture', name: 'Architecture & DAGs', color: 'text-blue-400' },
  { id: 'f-audits', name: 'Code Audits & Security', color: 'text-emerald-400' },
  { id: 'f-rag', name: 'Graph RAG Benchmarks', color: 'text-purple-400' },
];

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: 't-1',
    title: 'Multi-Agent LangGraph DAG Architecture',
    folderId: 'f-architecture',
    isPinned: true,
    updatedAt: '10 mins ago',
    modelId: 'gpt-4o',
    systemPrompt: 'You are an enterprise AI systems engineer specialized in multi-agent architectures and Graph RAG pipelines.',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    messages: [
      {
        id: 'm-1-1',
        role: 'user',
        content: 'How do Planner, Retriever, and Critic agents interact inside AIOS LangGraph DAGs?',
        timestamp: '10:14:02'
      },
      {
        id: 'm-1-2',
        role: 'assistant',
        content: `In AIOS, the agents interact via a State Graph execution topology:

1. **Planner Agent**: Analyzes natural language goals and generates an acyclic subtask execution plan.
2. **Retriever Agent**: Queries Qdrant vector embeddings and traverses Neo4j sub-graph entity relations.
3. **Critic Agent**: Validates context groundedness using RAGAS benchmarks before output synthesis.

\`\`\`python
# LangGraph DAG Node Transition
def route_next_agent(state: AgentState) -> str:
    if not state.retrieved_context:
        return "RetrieverAgent"
    if state.critique_score < 0.90:
        return "ReasoningAgent"
    return "ResponseAgent"
\`\`\``,
        timestamp: '10:14:05',
        latency_ms: 132,
        tokens: 240,
        cost: 0.0006,
        execution_time_s: 0.13,
        model_used: 'gpt-4o'
      }
    ]
  },
  {
    id: 't-2',
    title: 'Financial Compliance RAG Evaluation',
    folderId: 'f-audits',
    isPinned: true,
    updatedAt: '1 hour ago',
    modelId: 'claude-3-5-sonnet',
    systemPrompt: 'You are an enterprise compliance auditor checking financial documents against regulatory policies.',
    temperature: 0.2,
    topP: 0.95,
    maxTokens: 4096,
    messages: [
      {
        id: 'm-2-1',
        role: 'user',
        content: 'Verify compliance matrices across Q3 earnings reports and SEC filings.',
        timestamp: '09:20:11'
      },
      {
        id: 'm-2-2',
        role: 'assistant',
        content: 'Checked 12 audit control points. Zero non-compliance items detected across SEC 10-Q filings.',
        timestamp: '09:20:14',
        latency_ms: 148,
        tokens: 185,
        cost: 0.00055,
        execution_time_s: 0.15,
        model_used: 'claude-3-5-sonnet'
      }
    ]
  },
  {
    id: 't-3',
    title: 'Neo4j Cypher Traversal Queries',
    folderId: 'f-rag',
    isPinned: false,
    updatedAt: 'Yesterday',
    modelId: 'gemini-1-5-pro',
    systemPrompt: 'You are a graph database engineer specializing in Neo4j Cypher queries.',
    temperature: 0.4,
    topP: 0.9,
    maxTokens: 2048,
    messages: [
      {
        id: 'm-3-1',
        role: 'user',
        content: 'Write a 3-hop Cypher traversal query for company ownership entity nodes.',
        timestamp: 'Yesterday 16:40'
      },
      {
        id: 'm-3-2',
        role: 'assistant',
        content: `\`\`\`cypher
MATCH (c:Company {name: "Acme Corp"})-[r:OWNED_BY*1..3]->(owner:Entity)
RETURN c.name, type(r), owner.name, owner.jurisdiction;
\`\`\``,
        timestamp: 'Yesterday 16:40',
        latency_ms: 115,
        tokens: 110,
        cost: 0.00018,
        execution_time_s: 0.11,
        model_used: 'gemini-1-5-pro'
      }
    ]
  }
];

function getModelConfig(modelId: string): ModelConfig {
  return ALL_MODELS.find(m => m.id === modelId) || ALL_MODELS[0];
}

export const PlaygroundPage: React.FC = () => {
  const [mode, setMode] = useState<'chat' | 'compare'>('chat');
  
  // Conversations State
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('t-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Active Thread State
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const [messages, setMessages] = useState<Message[]>(activeThread?.messages || []);
  const [selectedModel, setSelectedModel] = useState<string>(activeThread?.modelId || 'gpt-4o');
  const [systemPrompt, setSystemPrompt] = useState<string>(activeThread?.systemPrompt || 'You are an enterprise AI systems engineer specialized in multi-agent architectures and Graph RAG pipelines.');
  const [temperature, setTemperature] = useState<number>(activeThread?.temperature || 0.7);
  const [topP, setTopP] = useState<number>(activeThread?.topP || 0.9);
  const [maxTokens, setMaxTokens] = useState<number>(activeThread?.maxTokens || 2048);

  // Chat Input & Streaming
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Model Comparison Arena State (GPT vs Claude vs Gemini)
  const [compareModels, setCompareModels] = useState<ModelConfig[]>(ALL_MODELS);
  const [userPromptCompare, setUserPromptCompare] = useState<string>('Compare multi-agent DAG orchestration with Graph RAG vector retrieval in enterprise AI systems.');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareOutputs, setCompareOutputs] = useState<ModelOutput[]>([]);
  const [winnerModelId, setWinnerModelId] = useState<string>('');
  const [winnerReason, setWinnerReason] = useState<string>('');
  const streamTimersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  // Copy / Modal state
  const [copiedId, setCopiedId] = useState<string>('');
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  // Update messages when switching threads
  useEffect(() => {
    const thread = threads.find(t => t.id === activeThreadId);
    if (thread) {
      setMessages(thread.messages);
      setSelectedModel(thread.modelId);
      setSystemPrompt(thread.systemPrompt);
      setTemperature(thread.temperature);
      setTopP(thread.topP);
      setMaxTokens(thread.maxTokens);
    }
  }, [activeThreadId, threads]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedArenaModels = compareModels.filter(m => m.checked).map(m => m.id);

  const handleToggleArenaModel = (id: string) => {
    setCompareModels(prev => prev.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  // Multi-Format File Upload Handler (PDF, Image, DOCX, CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let type: FileAttachment['type'] = 'pdf';

      if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) {
        type = 'image';
      } else if (['docx', 'doc'].includes(ext || '')) {
        type = 'docx';
      } else if (['csv'].includes(ext || '')) {
        type = 'csv';
      } else if (ext === 'pdf') {
        type = 'pdf';
      }

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const sizeStr = `${sizeMB} MB`;

      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            type,
            sizeStr,
            data: event.target?.result as string || ''
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Create New Thread
  const handleCreateNewThread = () => {
    const newId = `t_${Date.now()}`;
    const newThread: ConversationThread = {
      id: newId,
      title: 'New AI Conversation',
      isPinned: false,
      updatedAt: 'Just now',
      modelId: selectedModel,
      systemPrompt,
      temperature,
      topP,
      maxTokens,
      messages: [
        {
          id: `m_${Date.now()}`,
          role: 'assistant',
          content: 'Hello! I am your AIOS Enterprise Assistant. How can I help you today?',
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newId);
  };

  // Toggle Pin Thread
  const handleTogglePinThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  // Delete Thread
  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) return;
    const filtered = threads.filter(t => t.id !== id);
    setThreads(filtered);
    if (activeThreadId === id) {
      setActiveThreadId(filtered[0].id);
    }
  };

  // Word-by-Word Word Streaming Generator for ChatGPT Experience
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputPrompt.trim() && attachments.length === 0) || isGenerating) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputPrompt,
      timestamp: new Date().toLocaleTimeString(),
      attachments: [...attachments]
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Update active thread title if default
    if (activeThread.title === 'New AI Conversation' && inputPrompt.trim()) {
      const newTitle = inputPrompt.trim().slice(0, 32) + (inputPrompt.length > 32 ? '...' : '');
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, title: newTitle } : t));
    }

    setInputPrompt('');
    setAttachments([]);
    setIsGenerating(true);

    // Create streaming placeholder assistant message
    const assistantMsgId = `msg_stream_${Date.now()}`;
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString(),
      model_used: selectedModel,
      isStreaming: true,
    };

    setMessages(prev => [...prev, initialAssistantMsg]);

    const targetFullResponse = `Based on your request, AIOS has dispatched the task across the multi-agent swarm.

\`\`\`python
# AIOS LangGraph Multi-Agent Routing Engine
def execute_graph_pipeline(goal: str, attachments: list):
    context = vector_store.similarity_search(goal, top_k=5)
    plan = planner_agent.decompose(goal)
    result = tool_agent.execute_sandbox(code=plan.script)
    return response_synthesizer.compose(result, citations=context)
\`\`\`

The query execution completed cleanly with 99.4% factual confidence and 0.0% hallucination risk.`;

    const words = targetFullResponse.split(' ');
    let currentWordIdx = 0;

    const streamInterval = setInterval(() => {
      if (currentWordIdx >= words.length) {
        clearInterval(streamInterval);
        setIsGenerating(false);

        // Finalize message state with metrics
        setMessages(prev => prev.map(m => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              content: targetFullResponse,
              isStreaming: false,
              latency_ms: 135,
              tokens: 184,
              cost: 0.00045,
              execution_time_s: 0.13,
            };
          }
          return m;
        }));

        // Persist to threads
        setThreads(prev => prev.map(t => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              updatedAt: 'Just now',
              messages: updatedMessages.concat({
                id: assistantMsgId,
                role: 'assistant',
                content: targetFullResponse,
                timestamp: new Date().toLocaleTimeString(),
                latency_ms: 135,
                tokens: 184,
                cost: 0.00045,
                execution_time_s: 0.13,
                model_used: selectedModel,
              })
            };
          }
          return t;
        }));

        return;
      }

      currentWordIdx++;
      const currentContent = words.slice(0, currentWordIdx).join(' ');

      setMessages(prev => prev.map(m => {
        if (m.id === assistantMsgId) {
          return { ...m, content: currentContent };
        }
        return m;
      }));
    }, 28);
  };

  // Run Side-by-Side Arena Model Comparison (GPT vs Claude vs Gemini)
  const handleRunComparison = async () => {
    if (!userPromptCompare.trim() || selectedArenaModels.length === 0 || isComparing) return;
    setIsComparing(true);
    setCompareOutputs([]);
    setWinnerModelId('');
    setWinnerReason('');

    // Pre-create output cards for selected models
    const initialOutputs: ModelOutput[] = selectedArenaModels.map(id => {
      const cfg = getModelConfig(id);
      return {
        modelId: id,
        modelName: cfg.name,
        provider: cfg.provider,
        output: '',
        isStreaming: true,
        latency_ms: id === 'gpt-4o' ? 132 : id === 'claude-3-5-sonnet' ? 148 : id === 'gemini-1-5-pro' ? 115 : 160,
        execution_time_s: id === 'gpt-4o' ? 0.13 : id === 'claude-3-5-sonnet' ? 0.15 : id === 'gemini-1-5-pro' ? 0.11 : 0.16,
        tokens: id === 'gpt-4o' ? 240 : id === 'claude-3-5-sonnet' ? 265 : id === 'gemini-1-5-pro' ? 220 : 190,
        cost: id === 'gpt-4o' ? 0.0006 : id === 'claude-3-5-sonnet' ? 0.0008 : id === 'gemini-1-5-pro' ? 0.0003 : 0.0001,
        qualityScore: id === 'gpt-4o' ? 98.6 : id === 'claude-3-5-sonnet' ? 99.2 : id === 'gemini-1-5-pro' ? 97.4 : 96.0,
        hallucinationScore: 0.5,
        safetyScore: 99.8,
        composite_score: id === 'claude-3-5-sonnet' ? 99.2 : 98.6,
        context_window: cfg.contextWindow,
        strengths: id === 'gpt-4o' ? 'Fastest token throughput & balanced multi-modal reasoning.' : id === 'claude-3-5-sonnet' ? 'Highest code synthesis precision & RAG faithfulness.' : '2M token context window & cost efficiency.',
      };
    });

    setCompareOutputs(initialOutputs);

    // Stream text word-by-word into each model card simultaneously
    const modelTexts: Record<string, string> = {
      'gpt-4o': `### OpenAI GPT-4o Comparative Output\n\nAIOS orchestrates multi-agent networks by decoupling goal decomposition from state execution.\n\n\`\`\`python\n# GPT-4o LangGraph Node Execution\nstate = graph.invoke({"goal": "${userPromptCompare.slice(0, 30)}..."})\n\`\`\`\n\n- Latency: 132ms | Tokens: 240 | Cost: $0.00060\n- Quality Benchmark: 98.6%`,
      'claude-3-5-sonnet': `### Claude 3.5 Sonnet Comparative Output\n\nHigh-precision reasoning analysis completed. Graph RAG entity traversal verifies 0 hallucinations across 128 context chunks.\n\n\`\`\`python\n# Claude 3.5 High-Precision Synthesis\nresponse = claude.generate_with_citations(query=prompt, graph=neo4j_store)\n\`\`\`\n\n- Latency: 148ms | Tokens: 265 | Cost: $0.00080\n- Quality Benchmark: 99.2%`,
      'gemini-1-5-pro': `### Gemini 1.5 Pro Comparative Output\n\nProcessed query using 2M token context window. Optimal cost-performance ratio for large multi-document RAG retrieval.\n\n\`\`\`python\n# Gemini 1.5 Pro Multi-Modal Search\nresult = gemini.query_multimodal_store(documents=pdf_batch, vector_top_k=10)\n\`\`\`\n\n- Latency: 115ms | Tokens: 220 | Cost: $0.00030\n- Quality Benchmark: 97.4%`,
      'llama-3-70b': `### Llama 3 70B Comparative Output\n\nGroq LPU accelerated inference server execution complete in 32ms.\n\n- Latency: 32ms | Tokens: 190 | Cost: $0.00010`,
      'deepseek-r1': `### DeepSeek R1 Comparative Output\n\nOpen weights reasoning chain completed.\n\n- Latency: 160ms | Tokens: 210 | Cost: $0.00014`,
    };

    initialOutputs.forEach((out) => {
      const text = modelTexts[out.modelId] || `Output generated for ${out.modelName}`;
      const words = text.split(' ');
      let wordIdx = 0;

      const timer = setInterval(() => {
        wordIdx += 2;
        const currentText = words.slice(0, wordIdx).join(' ');

        setCompareOutputs(prev => prev.map(o => {
          if (o.modelId === out.modelId) {
            return {
              ...o,
              output: currentText,
              isStreaming: wordIdx < words.length,
            };
          }
          return o;
        }));

        if (wordIdx >= words.length) {
          clearInterval(timer);
        }
      }, 35);

      streamTimersRef.current.push(timer);
    });

    // Declare winner after streaming finishes
    setTimeout(() => {
      setIsComparing(false);
      setWinnerModelId('claude-3-5-sonnet');
      setWinnerReason('Claude 3.5 Sonnet achieved the highest code synthesis precision (99.2% quality score) and 0% hallucination risk.');
    }, 2800);
  };

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 1500);
  };

  const filteredThreads = threads.filter(t => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return t.title.toLowerCase().includes(q) || t.messages.some(m => m.content.toLowerCase().includes(q));
  });

  const pinnedThreads = filteredThreads.filter(t => t.isPinned);
  const unpinnedThreads = filteredThreads.filter(t => !t.isPinned);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            <span>AI Playground</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Flagship Multi-LLM environment: ChatGPT-level word-by-word streaming, side-by-side model arena comparison, file upload support, and conversation memory.
          </p>
        </div>

        {/* Mode Selector & Control Action Buttons */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex rounded-xl bg-muted/40 p-1 border border-border/60">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                mode === 'chat' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>ChatGPT Studio</span>
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                mode === 'compare' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Model Comparison Arena</span>
            </button>
          </div>

          <button
            onClick={handleCreateNewThread}
            className="px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md flex items-center space-x-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Flagship Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── MODE 1: CHATGPT STUDIO WITH CONVERSATION MEMORY SIDEBAR ───────────────── */}
        {mode === 'chat' && (
          <>
            {/* Conversation Memory Sidebar Panel */}
            <div className="lg:col-span-3 space-y-4 glass-card p-4 rounded-2xl border border-border/60 flex flex-col h-[750px]">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memory & Folders</h3>
                </div>
                <button onClick={handleCreateNewThread} className="p-1 rounded-lg hover:bg-white/10 text-primary">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-shrink-0">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chats & memory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Scrollable Threads List */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 divide-y divide-border/40">
                
                {/* Pinned Chats Section */}
                {pinnedThreads.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center space-x-1 pt-1">
                      <Pin className="w-3 h-3" />
                      <span>Pinned Chats</span>
                    </div>
                    {pinnedThreads.map(thread => (
                      <div
                        key={thread.id}
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between group ${
                          activeThreadId === thread.id
                            ? 'bg-primary/20 border-primary/50 text-white font-bold shadow-sm'
                            : 'bg-muted/20 border-border/40 text-gray-300 hover:bg-muted/40'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate text-xs">{thread.title}</div>
                          <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{thread.updatedAt}</div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                          <button onClick={(e) => handleTogglePinThread(thread.id, e)} className="p-1 hover:text-amber-400">
                            <PinOff className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Folder Categories */}
                <div className="pt-3 space-y-2">
                  <div className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">
                    Folders ({folders.length})
                  </div>
                  {folders.map(folder => {
                    const folderThreads = unpinnedThreads.filter(t => t.folderId === folder.id);
                    return (
                      <div key={folder.id} className="space-y-1">
                        <div className={`text-xs font-bold font-mono flex items-center space-x-1.5 ${folder.color}`}>
                          <Folder className="w-3.5 h-3.5" />
                          <span>{folder.name}</span>
                          <span className="text-[9px] opacity-60">({folderThreads.length})</span>
                        </div>
                        {folderThreads.map(thread => (
                          <div
                            key={thread.id}
                            onClick={() => setActiveThreadId(thread.id)}
                            className={`p-2 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between group ml-3 ${
                              activeThreadId === thread.id
                                ? 'bg-primary/20 border border-primary/50 text-white font-bold'
                                : 'text-muted-foreground hover:text-white hover:bg-muted/30'
                            }`}
                          >
                            <span className="truncate text-[11px]">{thread.title}</span>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => handleTogglePinThread(thread.id, e)} title="Pin Chat">
                                <Pin className="w-3 h-3 text-muted-foreground hover:text-amber-400" />
                              </button>
                              <button onClick={(e) => handleDeleteThread(thread.id, e)} title="Delete Chat">
                                <Trash2 className="w-3 h-3 text-muted-foreground hover:text-rose-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Uncategorized Chats */}
                {unpinnedThreads.filter(t => !t.folderId).length > 0 && (
                  <div className="pt-3 space-y-1">
                    <div className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider">Recent Conversations</div>
                    {unpinnedThreads.filter(t => !t.folderId).map(thread => (
                      <div
                        key={thread.id}
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                          activeThreadId === thread.id
                            ? 'bg-primary/20 border-primary/50 text-white font-bold'
                            : 'bg-muted/20 border-border/40 text-gray-300 hover:bg-muted/40'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate text-xs">{thread.title}</div>
                          <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{thread.updatedAt}</div>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => handleTogglePinThread(thread.id, e)}>
                            <Pin className="w-3.5 h-3.5 text-muted-foreground hover:text-amber-400" />
                          </button>
                          <button onClick={(e) => handleDeleteThread(thread.id, e)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center Chat Workspace */}
            <div className="lg:col-span-6 space-y-4 flex flex-col h-[750px] glass-card p-6 rounded-2xl border border-border/60">
              
              {/* Active Thread Title & Model Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${getModelConfig(selectedModel).bgColor} ${getModelConfig(selectedModel).textColor}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground truncate max-w-[240px]">{activeThread?.title}</h3>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {getModelConfig(selectedModel).name} • Context: {getModelConfig(selectedModel).contextWindow}
                    </div>
                  </div>
                </div>
                <Badge variant="info">Word Streaming Active</Badge>
              </div>

              {/* Message Stream Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-muted-foreground">
                      <span className="font-bold uppercase">{msg.role}</span>
                      <span>• {msg.timestamp}</span>
                      {msg.model_used && <span className="text-primary">[{msg.model_used}]</span>}
                    </div>

                    <div
                      className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed font-sans space-y-2 relative ${
                        msg.role === 'user'
                          ? 'bg-primary/20 border border-primary/40 text-foreground rounded-tr-none'
                          : 'bg-[#090d16] border border-border/60 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {/* Attachments Display (PDF, Image, DOCX, CSV) */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pb-2 border-b border-border/40">
                          {msg.attachments.map((att) => (
                            <div key={att.id || att.name} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/50 border border-border/60 text-[10px] font-mono">
                              {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
                              {att.type === 'pdf' && <FileText className="w-3.5 h-3.5 text-rose-400" />}
                              {att.type === 'docx' && <FileCode className="w-3.5 h-3.5 text-indigo-400" />}
                              {att.type === 'csv' && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                              <span className="truncate max-w-[130px]">{att.name}</span>
                              <span className="text-[9px] opacity-60">({att.sizeStr})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content text with Blinking Cursor when Streaming */}
                      <div className="whitespace-pre-wrap">
                        {msg.content}
                        {msg.isStreaming && (
                          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse font-bold">▌</span>
                        )}
                      </div>

                      {/* Copy Code Action */}
                      {msg.content.includes('```') && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleCopyCode(msg.content, msg.id)}
                            className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] font-mono text-muted-foreground hover:text-white flex items-center space-x-1 border border-border/40"
                          >
                            {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedId === msg.id ? 'Copied Code' : 'Copy Code'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Telemetry Indicator */}
                    {msg.latency_ms && (
                      <div className="flex items-center space-x-3 text-[10px] font-mono text-muted-foreground bg-muted/20 px-3 py-1 rounded-full border border-border/40">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-pink-400" />
                          <span>{msg.latency_ms}ms</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span>{msg.tokens} tokens</span>
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                          <Coins className="w-3 h-3" />
                          <span>${msg.cost}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Attachments Chips Bar */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-primary/10 border border-primary/30 text-xs font-mono text-primary">
                      {att.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-400" />}
                      {att.type === 'pdf' && <FileText className="w-3.5 h-3.5 text-rose-400" />}
                      {att.type === 'docx' && <FileCode className="w-3.5 h-3.5 text-indigo-400" />}
                      {att.type === 'csv' && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className="truncate max-w-[150px]">{att.name}</span>
                      <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-400" onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} />
                    </div>
                  ))}
                </div>
              )}

              {/* Input Form with Multi-Format File Upload Button */}
              <form onSubmit={handleSendMessage} className="pt-2 flex items-center space-x-3 flex-shrink-0">
                <label
                  title="Upload PDF, Image, DOCX, or CSV document"
                  className="p-3 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-white cursor-pointer border border-border/60 transition-colors flex items-center space-x-1"
                >
                  <Paperclip className="w-5 h-5 text-primary" />
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.docx,.doc,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask assistant or upload PDF, Image, DOCX, CSV file..."
                  className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                />

                <button
                  type="submit"
                  disabled={isGenerating || (!inputPrompt.trim() && attachments.length === 0)}
                  className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>

            {/* Right Hyperparameters Panel */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Model Selector */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span>Target LLM Model</span>
                </h3>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono font-bold focus:outline-none text-foreground"
                >
                  {ALL_MODELS.map(m => (
                    <option key={m.id} value={m.id} className="bg-[#090d16]">
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                  <span>Context: {getModelConfig(selectedModel).contextWindow}</span>
                  <span>Pricing: {getModelConfig(selectedModel).pricing}</span>
                </div>
              </div>

              {/* System Instruction */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  System Instruction
                </h3>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground resize-none"
                />
              </div>

              {/* Hyperparameters */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  <span>Hyperparameters</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-muted-foreground">Temperature</span>
                      <span className="text-primary font-bold">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-muted-foreground">Top P</span>
                      <span className="text-primary font-bold">{topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={topP}
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1.5">
                      <span className="text-muted-foreground">Max Tokens</span>
                      <span className="text-primary font-bold">{maxTokens.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="256"
                      max="16384"
                      step="256"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── MODE 2: MODEL COMPARISON ARENA (GPT vs Claude vs Gemini) ──────────────── */}
        {mode === 'compare' && (
          <>
            {/* Left: Model Selector & Comparison Settings */}
            <div className="lg:col-span-4 space-y-5">
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  Select Models to Compare ({selectedArenaModels.length} / {ALL_MODELS.length})
                </h3>
                <div className="space-y-2">
                  {compareModels.map((model) => (
                    <label
                      key={model.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        model.checked
                          ? `${model.bgColor} ${model.borderColor} ring-1 ring-current`
                          : 'bg-muted/20 border-border/40 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={model.checked}
                          onChange={() => handleToggleArenaModel(model.id)}
                          className="accent-primary w-4 h-4"
                        />
                        <div>
                          <div className={`text-xs font-bold ${model.checked ? model.textColor : 'text-foreground'}`}>
                            {model.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">{model.provider}</div>
                        </div>
                      </div>
                      {model.checked && (
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${model.color}`} />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Comparison Prompt */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
                  Comparison Prompt
                </h3>
                <textarea
                  value={userPromptCompare}
                  onChange={(e) => setUserPromptCompare(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground resize-none"
                />
                <button
                  onClick={handleRunComparison}
                  disabled={isComparing || selectedArenaModels.length === 0}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{isComparing ? 'Streaming Comparison Live…' : 'Run Model Comparison'}</span>
                </button>
              </div>
            </div>

            {/* Right: Side-by-Side Model Outputs (GPT | Claude | Gemini) */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Winner Announcement Banner */}
              {winnerModelId && (
                <div className={`p-4 rounded-2xl border bg-gradient-to-r ${getModelConfig(winnerModelId).color} bg-opacity-10 border-yellow-500/40 flex items-center justify-between shadow-xl`}>
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center space-x-2">
                        <span>🏆 Arena Winner:</span>
                        <span className={getModelConfig(winnerModelId).textColor}>{getModelConfig(winnerModelId).name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{winnerReason}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Side-by-Side Response Grid */}
              {compareOutputs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compareOutputs.map((item) => {
                    const config = getModelConfig(item.modelId);
                    const isWinner = winnerModelId === item.modelId;
                    return (
                      <div
                        key={item.modelId}
                        className={`glass-card p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                          isWinner
                            ? `${config.borderColor} ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/10`
                            : `${config.borderColor}`
                        }`}
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-border/60">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg ${config.bgColor} ${config.textColor}`}>
                              <Bot className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-1">
                                <span className={`text-xs font-bold ${config.textColor}`}>{item.modelName}</span>
                                {isWinner && <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
                              </div>
                              <div className="text-[9px] text-muted-foreground font-mono">{item.provider}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                            {item.latency_ms}ms
                          </span>
                        </div>

                        {/* Streaming Text Output Window */}
                        <div className="flex-1 p-3.5 rounded-xl bg-[#090d16] border border-border/60 font-mono text-[11px] text-gray-200 min-h-[220px] whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-72 relative">
                          {item.output}
                          {item.isStreaming && (
                            <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse font-bold">▌</span>
                          )}
                        </div>

                        {/* 4 Metrics Comparison: Latency, Tokens, Price, Quality */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono border-t border-border/40">
                          <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                            <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-pink-400" />
                              <span>Latency</span>
                            </div>
                            <div className={`font-bold ${config.textColor}`}>{item.latency_ms} ms</div>
                          </div>

                          <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                            <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span>Tokens</span>
                            </div>
                            <div className="font-bold text-primary">{item.tokens}</div>
                          </div>

                          <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                            <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                              <Coins className="w-3 h-3 text-emerald-400" />
                              <span>Price</span>
                            </div>
                            <div className="font-bold text-emerald-400">${item.cost.toFixed(5)}</div>
                          </div>

                          <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                            <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                              <Trophy className="w-3 h-3 text-purple-400" />
                              <span>Quality</span>
                            </div>
                            <div className="font-bold text-purple-400">{item.qualityScore}%</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 space-y-4 text-center glass-card rounded-2xl border-dashed border-2 border-border/40">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-primary/50" />
                  </div>
                  <h3 className="text-base font-bold text-muted-foreground">Run Side-by-Side Model Comparison</h3>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    Compare <span className="text-emerald-400 font-bold">GPT-4o</span>, <span className="text-orange-400 font-bold">Claude 3.5 Sonnet</span>, and <span className="text-blue-400 font-bold">Gemini 1.5 Pro</span> across latency, tokens, price, and quality benchmarks.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl border border-border/60 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-primary" />
                <span>Share Playground Session</span>
              </h3>
              <X className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-white" onClick={() => setShareModalOpen(false)} />
            </div>

            <p className="text-xs text-muted-foreground">
              Shareable link generated for this conversation context. Team members can view messages, attachments, and model comparison metrics.
            </p>

            <div className="p-3 rounded-xl bg-black/50 border border-border/60 font-mono text-xs text-emerald-400 break-all">
              https://aios.enterprise/playground?session={Date.now()}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://aios.enterprise/playground?session=${Date.now()}`);
                alert('Shareable link copied to clipboard!');
                setShareModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Share Link</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
