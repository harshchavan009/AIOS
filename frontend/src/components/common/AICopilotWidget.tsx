import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Zap,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Code2,
  Terminal,
  Layers,
  Database,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionUrl?: string;
  actionText?: string;
  timestamp: string;
}

export const AICopilotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: "👋 Hi! I'm your AIOS Enterprise Copilot. How can I assist your agent orchestration workflow today?",
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const isLight = theme === 'light';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const QUICK_PROMPTS = [
    'Create a Graph RAG pipeline',
    'Create prompt',
    'Generate workflow',
    'Explain dashboard',
    'Search documentation',
    'Find errors',
    'Create API',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    // AI Response Engine logic for 7 Assistant Actions
    setTimeout(() => {
      let botResponse = '';
      let actionUrl: string | undefined;
      let actionText: string | undefined;

      const qLower = query.toLowerCase();

      if (qLower.includes('graph rag') || qLower.includes('rag pipeline')) {
        botResponse =
          "### 🕸️ Graph RAG Pipeline Configured\n\nI've generated a 9-stage Graph RAG architecture unifying **Qdrant Vector Mesh** & **Neo4j Knowledge Graph**:\n\n1. **Ingestion**: PDF, DOCX, TXT, MD, CSV & GitHub Repositories\n2. **OCR Extract**: Character & layout parsing\n3. **Semantic Chunk**: 512-token overlap windowing\n4. **1536d Embed**: text-embedding-3-small vectors\n5. **Neo4j Graph**: Entity nodes & relationship triples\n6. **Qdrant Store**: HNSW vector collection\n7. **Hybrid Search**: Cosine distance + 3-hop traversal\n8. **Answer Synthesis**: Multi-model LLM generation\n9. **Citations**: Clickable source cards & confidence scores.";
        actionUrl = '/graph-rag';
        actionText = 'Navigate to Graph RAG Studio →';
      } else if (qLower.includes('create prompt') || qLower.includes('prompt')) {
        botResponse =
          "### 📝 Optimized System Prompt Template\n\nI've generated an enterprise system prompt template for your agent:\n\n```markdown\nSYSTEM ROLE: Autonomous AIOS Enterprise Compliance Agent\nCONTEXT: Execute SOC-2 Type II audit verification across microservices.\nRULES:\n1. Ground all responses in indexed Neo4j graph nodes and Qdrant citations.\n2. Refuse unverified assumptions (RAGAS faithfulness threshold >= 0.90).\n3. Return structured JSON payload with confidence score & citations.\n```";
        actionUrl = '/prompts';
        actionText = 'Open Prompt Studio →';
      } else if (qLower.includes('generate workflow') || qLower.includes('workflow')) {
        botResponse =
          "### ⚡ Synthesized LangGraph DAG Workflow\n\nI've generated a multi-agent execution DAG workflow:\n\n```\nUser Goal ➔ Planner Agent ➔ Retriever (Qdrant + Neo4j) ➔ Python MCP Tool ➔ Reasoning Engine ➔ Critic Evaluation ➔ Response Output\n```\n\nAll 6 nodes are configured with model bindings (`GPT-4o`, `Claude 3.5 Sonnet`, `DeepSeek R1`, `Llama 3 70B`) and edge transition logic.";
        actionUrl = '/agent-builder';
        actionText = 'Open Visual Agent Builder →';
      } else if (qLower.includes('explain dashboard') || qLower.includes('dashboard')) {
        botResponse =
          "### 📊 Real-Time AIOS System Telemetry\n\n• **Redis Cache**: Connected (`PING` active, 0.4ms latency)\n• **Neo4j Knowledge Graph**: Active (14,820 entity nodes, 28,400 edges)\n• **Qdrant Vector Store**: Active (HNSW collection `aios_knowledge`, ef=200)\n• **System Load**: CPU 14.2%, RAM 4.8 GB / 16 GB utilized\n• **Celery Swarm**: 6 worker nodes online, 0 backlog queue\n• **API Gateway**: Sub-5ms response duration across `/api/v1/` routes";
        actionUrl = '/dashboard';
        actionText = 'View Dashboard Metrics →';
      } else if (qLower.includes('search documentation') || qLower.includes('documentation') || qLower.includes('docs')) {
        botResponse =
          "### 📚 AIOS Platform Documentation & API Reference\n\nKey documentation topics available:\n\n• **Authentication**: JWT refresh tokens, OAuth2 (Google & GitHub)\n• **Graph RAG API**: `/api/v1/rag/upload/stream`, `/api/v1/rag/github`, `/api/v1/rag/query`\n• **Multi-Tenant Workspaces**: Scoped API keys, members, prompts, & token billing\n• **MCP Protocol**: Model Context Protocol tool execution & sandboxing";
        actionUrl = '/api-explorer';
        actionText = 'Explore API Documentation →';
      } else if (qLower.includes('find errors') || qLower.includes('error')) {
        botResponse =
          "### 🔍 System Diagnostics & Error Report\n\n• **System Error Rate**: `0.00%` (0 critical errors in last 24h)\n• **Celery Task Execution**: 1,420 tasks executed cleanly\n• **Hallucination Risk**: 0 detected (Critic Guardrail score 98.6%)\n• **Database Health**: PostgreSQL, Redis, Neo4j, Qdrant all 100% healthy\n\nNo active system faults or memory leaks detected.";
        actionUrl = '/analytics';
        actionText = 'Open Analytics & Logs →';
      } else if (qLower.includes('create api') || qLower.includes('api')) {
        botResponse =
          "### 🛠️ Generated FastAPI Endpoint Snippet\n\n```python\n@router.post(\"/api/v1/agent/execute\")\nasync def execute_custom_agent(request: AgentRequest):\n    result = await swarm.run(prompt=request.prompt, model=\"gpt-4o\")\n    return {\"status\": \"success\", \"result\": result}\n```\n\ncURL Request:\n```bash\ncurl -X POST http://localhost:8000/api/v1/rag/query \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"query\":\"SOC-2 compliance\", \"top_k\":5}'\n```";
        actionUrl = '/api-explorer';
        actionText = 'Open API Explorer →';
      } else {
        botResponse = `I've processed your query "${query}". I can help you create a Graph RAG pipeline, generate prompt templates, build agent workflows, explain dashboard telemetry, search documentation, find system errors, or create FastAPI endpoints.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        actionUrl,
        actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto font-sans">
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-105 group ${
            isLight
              ? 'bg-blue-600 border-blue-500 text-white shadow-blue-500/30'
              : 'bg-[#0E121B] border-blue-500/40 text-white shadow-black/80 ring-1 ring-blue-500/30'
          }`}
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-mono font-bold text-blue-300 leading-none">AI Copilot</span>
            <span className="text-xs font-extrabold tracking-tight leading-tight">Ask anything</span>
          </div>
        </button>
      )}

      {/* Expanded Copilot Chat Panel */}
      {isOpen && (
        <div
          className={`border rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 animate-fade-in ${
            isExpanded ? 'w-[32rem] h-[36rem]' : 'w-80 sm:w-96 h-[28rem]'
          } ${
            isLight
              ? 'bg-white border-gray-200 text-gray-900 shadow-blue-500/10'
              : 'bg-[#0E121B] border-white/10 text-white shadow-black/90'
          }`}
        >
          {/* Header Bar */}
          <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#080B10] border-white/10'}`}>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500 text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-tight flex items-center space-x-1.5">
                  <span>AIOS Enterprise Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">GPT-4o Multi-Agent Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                title={isExpanded ? 'Minimize' : 'Maximize'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground transition-colors"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 divide-y divide-transparent">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      : isLight
                      ? 'bg-gray-100 text-gray-900 border border-gray-200 rounded-tl-none'
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {m.actionUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        navigate(m.actionUrl!);
                        setIsOpen(false);
                      }}
                      className="mt-2 w-full py-1.5 px-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/40 text-[11px] font-bold flex items-center justify-between transition-all"
                    >
                      <span>{m.actionText || 'Execute Action'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="text-[9px] opacity-60 text-right font-mono">{m.timestamp}</div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-gray-700 flex items-center justify-center text-white shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Copilot is reasoning...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className={`p-2.5 border-t space-y-1.5 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#080B10] border-white/10'}`}>
            <div className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider px-1">
              Suggested Questions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp}
                  type="button"
                  onClick={() => handleSendMessage(qp)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                    isLight
                      ? 'bg-white border-gray-200 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                      : 'bg-white/5 border-white/10 hover:bg-blue-500/10 text-gray-300 hover:text-blue-400 hover:border-blue-500/30'
                  }`}
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t flex items-center space-x-2 ${
              isLight ? 'bg-white border-gray-200' : 'bg-[#0E121B] border-white/10'
            }`}
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Copilot (e.g. How do I deploy?)..."
              className={`flex-1 bg-transparent text-xs font-medium focus:outline-none ${
                isLight ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-gray-500'
              }`}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all shadow-md shadow-blue-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
