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
    'Create a Planner Agent',
    'Compare GPT-4o vs Claude',
    'Generate Prompt',
    'Debug Workflow',
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

    // AI Response Engine logic
    setTimeout(() => {
      let botResponse = '';
      let actionUrl: string | undefined;
      let actionText: string | undefined;

      const qLower = query.toLowerCase();

      if (qLower.includes('planner agent') || qLower.includes('create')) {
        botResponse =
          "I can help you build a **Planner Agent** powered by LangGraph. A Planner Agent decomposes complex goals into atomic tasks and delegates work across worker nodes.\n\nWould you like to open the Agent Builder with the Planner template pre-loaded?";
        actionUrl = '/agent-builder';
        actionText = 'Open Agent Builder →';
      } else if (qLower.includes('compare') || qLower.includes('gpt-4o') || qLower.includes('claude')) {
        botResponse =
          "**GPT-4o vs Claude 3.5 Sonnet Comparison:**\n\n• **OpenAI GPT-4o**: 145ms avg latency, $2.50/1M tokens, 128K context, high function calling speed.\n• **Claude 3.5 Sonnet**: 185ms avg latency, $3.00/1M tokens, 200K context, superior coding & reasoning precision.\n\nYou can run comparative prompt tests side-by-side in the Multi-LLM Playground.";
        actionUrl = '/playground';
        actionText = 'Open LLM Playground →';
      } else if (qLower.includes('prompt')) {
        botResponse =
          "I've generated an **Enterprise RAG Synthesizer Prompt** draft:\n\n```markdown\nSystem: You are an expert RAG response generator. Ground your output strictly on the retrieved Neo4j knowledge graph nodes and Qdrant vector chunks.\n```\n\nYou can test and register this prompt in Prompt Studio.";
        actionUrl = '/prompt-studio';
        actionText = 'Open Prompt Studio →';
      } else if (qLower.includes('debug') || qLower.includes('workflow') || qLower.includes('dag')) {
        botResponse =
          "**Workflow Diagnostic Report:**\n\n✓ All 4 LangGraph DAG nodes (Planner, Retriever, Tool, Critic) are healthy.\n✓ FastAPI REST Gateway latency: 12ms\n✓ Redis PubSub cache hit rate: 94.2%\n\nNo deadlocks or worker failures detected.";
        actionUrl = '/dashboard';
        actionText = 'View System Dashboard →';
      } else {
        botResponse = `I've analyzed your query "${query}". AIOS Multi-Agent cluster is online and active with 4 worker nodes. What specific action would you like me to execute?`;
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
    }, 700);
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
            <span className="text-[10px] uppercase font-mono font-bold text-blue-300 leading-none">Need Help?</span>
            <span className="text-xs font-extrabold tracking-tight leading-tight">Ask AI Copilot</span>
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
              placeholder="Ask Copilot (e.g. Debug Workflow)..."
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
