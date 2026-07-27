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
  Maximize2,
  PlayCircle,
  RefreshCw,
  MoreHorizontal,
  ExternalLink,
  Code
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useNotificationStore } from '../store/useNotificationStore';

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
        content: `### AIOS LangGraph DAG Topology

The agents interact via a decoupled State Graph execution pipeline:

| Agent Node | Primary Responsibility | Input Context | Output State |
| :--- | :--- | :--- | :--- |
| **Planner Agent** | Task DAG Decomposition | Natural Language Goal | Execution Plan |
| **Retriever Agent** | Graph RAG & Vector Traversal | Embedding Query | Qdrant/Neo4j Chunks |
| **Critic Agent** | Hallucination Benchmark | Retrieved Chunks | Groundedness Score |

\`\`\`mermaid
graph TD;
    Goal[User Prompt Goal] --> Planner[Planner Agent];
    Planner --> Retriever[Retriever Agent];
    Retriever --> VectorStore[(Qdrant Vector DB)];
    Retriever --> GraphDB[(Neo4j Property Graph)];
    VectorStore --> Critic[Critic Agent];
    GraphDB --> Critic;
    Critic -->|Score >= 0.90| Response[Synthesizer Agent];
    Critic -->|Score < 0.90| Reasoning[Reasoning Fix Agent];
\`\`\`

\`\`\`python
# AIOS LangGraph State Graph Transition
def route_next_agent(state: AgentState) -> str:
    if not state.retrieved_context:
        return "RetrieverAgent"
    if state.critique_score < 0.90:
        return "ReasoningAgent"
    return "ResponseAgent"
\`\`\``,
        timestamp: '10:14:05',
        latency_ms: 132,
        tokens: 280,
        cost: 0.0007,
        execution_time_s: 0.13,
        model_used: 'gpt-4o'
      }
    ]
  }
];

function getModelConfig(modelId: string): ModelConfig {
  return ALL_MODELS.find(m => m.id === modelId) || ALL_MODELS[0];
}

// ── RICH CONTENT RENDERER (Markdown, Mermaid, Tables, Code, Images) ───────────
const RichContentRenderer: React.FC<{
  content: string;
  msgId: string;
  isStreaming?: boolean;
  onCopyCode: (code: string, id: string) => void;
  onPreviewImage: (src: string) => void;
  copiedId: string;
}> = ({ content, msgId, isStreaming, onCopyCode, onPreviewImage, copiedId }) => {

  // Helper to parse blocks: ```mermaid, ```code, | tables |, and markdown
  const renderBlocks = () => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
      }

      const lang = match[1].toLowerCase();
      const codeText = match[2];

      if (lang === 'mermaid') {
        parts.push({ type: 'mermaid', code: codeText });
      } else {
        parts.push({ type: 'code', lang: lang || 'text', code: codeText });
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts.map((part, idx) => {
      if (part.type === 'code') {
        const codeId = `${msgId}-code-${idx}`;
        return (
          <div key={idx} className="my-3 rounded-2xl border border-border/80 bg-[#06080e] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-border/40 font-mono text-[11px]">
              <span className="font-bold text-blue-400 uppercase tracking-wider">{part.lang}</span>
              <button
                type="button"
                onClick={() => onCopyCode(part.code || '', codeId)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
              >
                {copiedId === codeId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === codeId ? 'Copied Code' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono overflow-x-auto text-gray-200 leading-relaxed">
              <code>{part.code}</code>
            </pre>
          </div>
        );
      }

      if (part.type === 'mermaid') {
        return (
          <div key={idx} className="my-3 p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between font-mono text-[11px] text-indigo-300 border-b border-indigo-500/30 pb-2">
              <span className="font-bold flex items-center space-x-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mermaid Architecture Graph</span>
              </span>
              <Badge variant="info">Visual Flowchart</Badge>
            </div>
            {/* Visual Representation of Diagram Nodes */}
            <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/20 text-xs font-mono space-y-2 text-indigo-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-300 font-bold">
                  User Goal
                </span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold">
                  Planner Agent
                </span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                  Retriever (Qdrant + Neo4j)
                </span>
                <span>➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                  Critic Validation
                </span>
              </div>
              <pre className="text-[10px] text-muted-foreground pt-2 border-t border-indigo-500/20 font-mono">
                {(part.code || '').trim()}
              </pre>
            </div>
          </div>
        );
      }

      // Process Text for Tables and Formatting
      return <TextWithTables key={idx} text={part.text || ''} onPreviewImage={onPreviewImage} />;
    });
  };

  return (
    <div className="space-y-2 leading-relaxed">
      {renderBlocks()}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse font-bold">▌</span>
      )}
    </div>
  );
};

// Sub-component for Markdown Tables and Image formatting
const TextWithTables: React.FC<{ text: string; onPreviewImage: (src: string) => void }> = ({ text, onPreviewImage }) => {
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Markdown Table row
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (line.includes('---')) {
        // Table divider line, skip
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    if (inTable && (!line.trim().startsWith('|') || i === lines.length - 1)) {
      // Flush table
      elements.push(
        <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-2xl border border-border/60 bg-white/5">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-white/10 border-b border-border/60 text-foreground">
                {tableHeader.map((h, hIdx) => (
                  <th key={hIdx} className="px-3.5 py-2.5 font-extrabold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-gray-300">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }

    if (!inTable && line.trim()) {
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-sm font-extrabold text-foreground mt-3 mb-1">{line.replace('### ', '')}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-base font-extrabold text-foreground mt-3 mb-1">{line.replace('## ', '')}</h2>);
      } else if (line.startsWith('- ')) {
        elements.push(
          <div key={i} className="flex items-start space-x-2 text-xs text-gray-200 ml-2">
            <span className="text-blue-400">•</span>
            <span>{line.replace('- ', '')}</span>
          </div>
        );
      } else {
        elements.push(<p key={i} className="text-xs text-gray-200 my-1">{line}</p>);
      }
    }
  }

  return <>{elements}</>;
};


export const PlaygroundPage: React.FC = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [mode, setMode] = useState<'chat' | 'compare'>('chat');
  
  // Conversations State
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS);
  const [threads, setThreads] = useState<ConversationThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('t-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Editing User Prompt State
  const [editingMsgId, setEditingMsgId] = useState<string>('');
  const [editingText, setEditingText] = useState<string>('');

  // Lightbox Image Preview Modal
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Model Comparison Arena State
  const [compareModels, setCompareModels] = useState<ModelConfig[]>(ALL_MODELS);
  const [userPromptCompare, setUserPromptCompare] = useState<string>('Compare multi-agent DAG orchestration with Graph RAG vector retrieval in enterprise AI systems.');
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareOutputs, setCompareOutputs] = useState<ModelOutput[]>([]);
  const streamTimersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  // Copy / Share / Export State
  const [copiedId, setCopiedId] = useState<string>('');
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState<boolean>(false);

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

  // File Upload Handler (PDF, Image, DOCX, CSV)
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
        addNotification({
          type: 'document',
          title: 'Document Attached',
          description: `Attached ${file.name} (${sizeStr}) to conversation context.`,
        });
      };
      reader.readAsDataURL(file);
    });
  };

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

  const handleTogglePinThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) return;
    const filtered = threads.filter(t => t.id !== id);
    setThreads(filtered);
    if (activeThreadId === id) {
      setActiveThreadId(filtered[0].id);
    }
  };

  // Word-by-Word Word Streaming Generator
  const handleSendMessage = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || inputPrompt;
    if ((!promptToUse.trim() && attachments.length === 0) || isGenerating) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: promptToUse,
      timestamp: new Date().toLocaleTimeString(),
      attachments: [...attachments]
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    if (activeThread.title === 'New AI Conversation' && promptToUse.trim()) {
      const newTitle = promptToUse.trim().slice(0, 32) + (promptToUse.length > 32 ? '...' : '');
      setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, title: newTitle } : t));
    }

    setInputPrompt('');
    setAttachments([]);
    setIsGenerating(true);

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

    const targetFullResponse = `### AIOS Graph RAG Execution Analysis

Based on your prompt, AIOS queried vector embeddings and traversed sub-graph relations.

| Component | Status | Latency |
| :--- | :--- | :--- |
| **Qdrant Vector Mesh** | Grounded (99.4%) | 12ms |
| **Neo4j Property Graph** | 3-Hop Traversal | 28ms |
| **LLM Inference Mesh** | ${getModelConfig(selectedModel).name} | 95ms |

\`\`\`mermaid
graph TD;
    UserQuery[User Query] --> Embeddings[Vector Embeddings];
    Embeddings --> Neo4j[Neo4j Entity Subgraph];
    Neo4j --> RAGSynthesis[RAG Response Synthesizer];
\`\`\`

\`\`\`python
# AIOS Graph Execution Response
def synthesize_response(query: str):
    return llm_mesh.generate(prompt=query, model="${selectedModel}")
\`\`\`

Execution complete with 0.0% hallucination risk.`;

    const words = targetFullResponse.split(' ');
    let currentWordIdx = 0;

    const streamInterval = setInterval(() => {
      if (currentWordIdx >= words.length) {
        clearInterval(streamInterval);
        setIsGenerating(false);

        setMessages(prev => prev.map(m => {
          if (m.id === assistantMsgId) {
            return {
              ...m,
              content: targetFullResponse,
              isStreaming: false,
              latency_ms: 135,
              tokens: 210,
              cost: 0.0005,
              execution_time_s: 0.13,
            };
          }
          return m;
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
    }, 25);
  };

  // Action: Copy Response
  const handleCopyResponse = (content: string, msgId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    addNotification({
      type: 'login',
      title: 'Response Copied',
      description: 'Assistant response copied to clipboard.',
    });
    setTimeout(() => setCopiedId(''), 1500);
  };

  // Action: Regenerate Assistant Message
  const handleRegenerate = (assistantMsgId: string) => {
    if (isGenerating) return;
    const msgIdx = messages.findIndex(m => m.id === assistantMsgId);
    if (msgIdx <= 0) return;
    const previousUserMsg = messages[msgIdx - 1];
    if (previousUserMsg && previousUserMsg.role === 'user') {
      const truncated = messages.slice(0, msgIdx);
      setMessages(truncated);
      handleSendMessage(previousUserMsg.content);
    }
  };

  // Action: Edit User Prompt
  const handleSaveEditPrompt = (msgId: string) => {
    if (!editingText.trim()) return;
    const msgIdx = messages.findIndex(m => m.id === msgId);
    if (msgIdx < 0) return;
    const truncated = messages.slice(0, msgIdx);
    setMessages(truncated);
    setEditingMsgId('');
    handleSendMessage(editingText);
  };

  // Action: Continue Response
  const handleContinueResponse = (msgId: string) => {
    if (isGenerating) return;
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          content: m.content + '\n\nContinued token generation completed.',
        };
      }
      return m;
    }));
  };

  // Action: Export Conversation (.md or .json)
  const handleExportConversation = (format: 'md' | 'json') => {
    let content = '';
    let fileName = `aios_chat_${activeThread.id}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      fileName += '.json';
      mimeType = 'application/json';
    } else {
      content = `# ${activeThread.title}\n\nDate: ${new Date().toLocaleString()}\nModel: ${selectedModel}\n\n` +
        messages.map(m => `### ${m.role.toUpperCase()} (${m.timestamp})\n${m.content}\n`).join('\n---\n\n');
      fileName += '.md';
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false);

    addNotification({
      type: 'document',
      title: 'Conversation Exported',
      description: `Exported thread as ${fileName}`,
    });
  };

  const selectedArenaModels = compareModels.filter(m => m.checked).map(m => m.id);

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-12">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
            <span>Live AI Playground</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Markdown, Mermaid diagrams, Tables, Image lightbox, Token Streaming, Code highlighting, PDF upload, Copy, Regenerate, Edit, & Share.
          </p>
        </div>

        {/* Mode Selector & Control Action Buttons */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex rounded-xl bg-muted/40 p-1 border border-border/60">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                mode === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>ChatGPT Studio</span>
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 ${
                mode === 'compare' ? 'bg-blue-600 text-white shadow-md' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Model Arena</span>
            </button>
          </div>

          <button
            onClick={handleCreateNewThread}
            className="px-3 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>New Chat</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 flex items-center space-x-1.5 text-foreground"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export...</span>
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#0e121b] p-1.5 shadow-2xl z-50 text-xs font-mono space-y-1">
                <button
                  onClick={() => handleExportConversation('md')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-gray-200"
                >
                  <span>Markdown (.md)</span>
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                </button>
                <button
                  onClick={() => handleExportConversation('json')}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 flex items-center justify-between text-gray-200"
                >
                  <span>JSON (.json)</span>
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShareModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/25 flex items-center space-x-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {mode === 'chat' && (
          <>
            {/* Conversation Memory Sidebar */}
            <div className="lg:col-span-3 space-y-4 glass-card p-4 rounded-2xl border border-border/60 flex flex-col h-[750px]">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Memory & Folders</h3>
                </div>
                <button onClick={handleCreateNewThread} className="p-1 rounded-lg hover:bg-white/10 text-blue-400">
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
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-mono focus:outline-none focus:border-blue-500 text-foreground"
                />
              </div>

              {/* Threads List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveThreadId(t.id)}
                    className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between group ${
                      activeThreadId === t.id
                        ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold shadow-sm'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate text-xs font-semibold">{t.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{t.updatedAt}</div>
                    </div>
                    <button onClick={(e) => handleDeleteThread(t.id, e)} className="opacity-0 group-hover:opacity-100 text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
                <Badge variant="success">Streaming & Markdown Active</Badge>
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
                      {msg.model_used && <span className="text-blue-400">[{msg.model_used}]</span>}
                    </div>

                    <div
                      className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed font-sans space-y-2 relative ${
                        msg.role === 'user'
                          ? 'bg-blue-600/20 border border-blue-500/40 text-foreground rounded-tr-none'
                          : 'bg-[#090d16] border border-border/60 text-gray-200 rounded-tl-none'
                      }`}
                    >
                      {/* Attachments Display (PDF, Image, DOCX, CSV) */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 pb-2 border-b border-border/40">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id || att.name}
                              onClick={() => att.type === 'image' && setLightboxSrc(att.data)}
                              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/50 border border-border/60 text-[10px] font-mono cursor-pointer hover:border-blue-500/50"
                            >
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

                      {/* Inline User Prompt Editing */}
                      {editingMsgId === msg.id ? (
                        <div className="space-y-2 py-1">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-black/60 border border-blue-500 text-xs font-mono focus:outline-none"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingMsgId('')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 border text-[10px] font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditPrompt(msg.id)}
                              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                            >
                              Save & Resubmit
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Rich Formatted Content Renderer (Markdown, Mermaid, Tables, Code) */
                        <RichContentRenderer
                          content={msg.content}
                          msgId={msg.id}
                          isStreaming={msg.isStreaming}
                          onCopyCode={(code, id) => {
                            navigator.clipboard.writeText(code);
                            setCopiedId(id);
                            setTimeout(() => setCopiedId(''), 1500);
                          }}
                          onPreviewImage={(src) => setLightboxSrc(src)}
                          copiedId={copiedId}
                        />
                      )}

                      {/* Action Bar (Copy Response, Regenerate, Edit Prompt, Continue) */}
                      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                        {msg.role === 'assistant' ? (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleCopyResponse(msg.content, msg.id)}
                              className="hover:text-blue-400 flex items-center space-x-1"
                            >
                              {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              onClick={() => handleRegenerate(msg.id)}
                              className="hover:text-emerald-400 flex items-center space-x-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                            <button
                              onClick={() => handleContinueResponse(msg.id)}
                              className="hover:text-purple-400 flex items-center space-x-1"
                            >
                              <PlayCircle className="w-3 h-3" />
                              <span>Continue</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingMsgId(msg.id);
                              setEditingText(msg.content);
                            }}
                            className="hover:text-blue-400 flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit Prompt</span>
                          </button>
                        )}
                      </div>
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
                    <div key={att.id} className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400">
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
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="pt-2 flex items-center space-x-3 flex-shrink-0">
                <label
                  title="Upload PDF, Image, DOCX, or CSV document"
                  className="p-3 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-white cursor-pointer border border-border/60 transition-colors flex items-center space-x-1"
                >
                  <Paperclip className="w-5 h-5 text-blue-400" />
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
                  className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-blue-500 text-foreground placeholder:text-muted-foreground"
                />

                <button
                  type="submit"
                  disabled={isGenerating || (!inputPrompt.trim() && attachments.length === 0)}
                  className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
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
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>Target LLM Model</span>
                </h3>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono font-bold focus:outline-none text-foreground"
                >
                  {ALL_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hyperparameter Controls */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Inference Parameters</span>
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Temperature</span>
                    <span className="text-blue-400 font-bold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Top-P Sampling</span>
                    <span className="text-purple-400 font-bold">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Max Tokens</span>
                    <span className="text-emerald-400 font-bold">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Share Conversation Link Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-md w-full border border-blue-500/40 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-extrabold text-foreground">Share Conversation</h3>
              <Badge variant="info">Public Access</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate a shareable public snapshot URL for this conversation thread.
            </p>
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-blue-400 flex items-center justify-between">
              <span className="truncate pr-2">https://aios.dev/share/{activeThread.id}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://aios.dev/share/${activeThread.id}`);
                  addNotification({
                    type: 'login',
                    title: 'Link Copied',
                    description: 'Share URL copied to clipboard.',
                  });
                }}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] shrink-0"
              >
                Copy Link
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {lightboxSrc && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4" onClick={() => setLightboxSrc(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/20">
            <img src={lightboxSrc} alt="Preview Lightbox" className="w-full h-full object-contain" />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
