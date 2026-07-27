import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bot,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Layers,
  Brain,
  Database,
  Cpu,
  MessageSquare,
  Shield,
  Loader2,
  ChevronRight,
  ChevronDown,
  Zap,
  Trophy,
  Send,
  ArrowDown,
  Coins,
  Copy,
  Check,
  Pause,
  Sliders,
  Share2,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useNotificationStore } from '../store/useNotificationStore';

// ── Types ────────────────────────────────────────────────────────────────────
export type AgentId = 'PlannerAgent' | 'RetrieverAgent' | 'ToolAgent' | 'ReasoningAgent' | 'CriticAgent' | 'ResponseAgent';
export type AgentStatus = 'idle' | 'running' | 'done' | 'pending';

export interface AgentStepLog {
  timestamp: string;
  text: string;
}

export interface AgentMeta {
  id: AgentId;
  name: string;
  role: string;
  model: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  defaultLogs: string[];
}

export interface AgentState {
  status: AgentStatus;
  logs: AgentStepLog[];
  isStreaming?: boolean;
  executionTimeMs?: number;
  tokensUsed?: number;
  modelUsed?: string;
  retries?: number;
  errors?: number;
}

// ── Agent Swarm Configuration ────────────────────────────────────────────────
const SWARM_AGENTS: AgentMeta[] = [
  {
    id: 'PlannerAgent',
    name: 'Planner',
    role: 'Task Decomposition & DAG Router',
    model: 'GPT-4o',
    icon: <Brain className="w-4 h-4" />,
    color: '#a78bfa',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-400',
    defaultLogs: [
      'Initializing LangGraph DAG state graph...',
      'Decomposing user goal into 4 subtasks...',
      'Mapping execution dependencies (Retriever → Tool → Reasoning → Critic)...',
      'Topological plan compiled cleanly.',
      'Done ✓'
    ]
  },
  {
    id: 'RetrieverAgent',
    name: 'Retriever',
    role: 'Graph RAG & Vector Search',
    model: 'Claude 3.5 Sonnet',
    icon: <Database className="w-4 h-4" />,
    color: '#34d399',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    defaultLogs: [
      'Searching Neo4j graph database...',
      '12 entity nodes found across 3-hop depth',
      'Querying Qdrant HNSW vector collection...',
      'Ranking 8 relevant document citations...',
      'Context groundedness score: 98.4%',
      'Done ✓'
    ]
  },
  {
    id: 'ToolAgent',
    name: 'Python Tool',
    role: 'Isolated MCP Sandbox Execution',
    model: 'Llama 3 70B (Groq)',
    icon: <Terminal className="w-4 h-4" />,
    color: '#fb923c',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-400',
    defaultLogs: [
      'Spawning isolated MCP Python sandbox...',
      'Injecting variables: company="Acme Corp", jurisdiction="SEC"',
      'Executing code verification script...',
      'Execution complete: 0 errors, 3 matrices computed',
      'Done ✓'
    ]
  },
  {
    id: 'ReasoningAgent',
    name: 'Reasoning',
    role: 'Multi-LLM Chain of Thought',
    model: 'Gemini 1.5 Pro',
    icon: <Cpu className="w-4 h-4" />,
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    defaultLogs: [
      'Synthesizing logical chain of thought...',
      'Cross-referencing Neo4j graph nodes with Python tool outputs...',
      'Performing self-reflection consistency pass...',
      'Factual confidence: 99.4%',
      'Done ✓'
    ]
  },
  {
    id: 'CriticAgent',
    name: 'Critic',
    role: 'RAGAS Quality & Faithfulness Guardrail',
    model: 'Claude 3.5 Sonnet',
    icon: <Shield className="w-4 h-4" />,
    color: '#f472b6',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-400',
    defaultLogs: [
      'Evaluating RAGAS benchmark criteria...',
      'Faithfulness: 99.2% | Groundedness: 98.6% | Relevance: 97.8%',
      'Checking hallucination guardrails... 0 detected',
      'Quality Benchmark: PASSED (0.98)',
      'Done ✓'
    ]
  },
  {
    id: 'ResponseAgent',
    name: 'Response',
    role: 'Streaming SSE & Final Output',
    model: 'GPT-4o',
    icon: <MessageSquare className="w-4 h-4" />,
    color: '#60a5fa',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-400',
    defaultLogs: [
      'Composing executive report synthesis...',
      'Formatting IEEE Markdown citations & audit checklist...',
      'Initializing SSE token stream at 124 tokens/sec...',
      'Response output complete.',
      'Done ✓'
    ]
  }
];

const PRESET_QUERIES = [
  'Decompose a financial compliance audit workflow into a LangGraph DAG with Neo4j entity graph traversal and Python tool verification.',
  'Synthesize real-time GPU telemetry and Celery worker queue depth for auto-scaling.',
  'Traverse 3-hop Neo4j entity relations to detect SEC 10-Q compliance gaps in Acme Corp.',
  'Execute Python MCP sandbox code to compute Portfolio VaR risk models across 10k simulations.'
];

export const AgentsPage: React.FC = () => {
  const [goal, setGoal] = useState<string>(PRESET_QUERIES[0]);
  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentState>>(
    (Object.fromEntries(SWARM_AGENTS.map(a => [a.id, { status: 'idle', logs: [] }])) as unknown) as Record<AgentId, AgentState>
  );
  
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeAgentIdx, setActiveAgentIdx] = useState<number>(-1);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [finalOutputText, setFinalOutputText] = useState<string>('');
  const [executionStats, setExecutionStats] = useState<{ totalTime: number; tokens: number; cost: number; score: number } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const addNotification = useNotificationStore((state) => state.addNotification);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Reset Swarm Execution State
  const handleReset = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setAgentStates((Object.fromEntries(SWARM_AGENTS.map(a => [a.id, { status: 'idle', logs: [] }])) as unknown) as Record<AgentId, AgentState>);
    setIsExecuting(false);
    setActiveAgentIdx(-1);
    setFinalOutputText('');
    setExecutionStats(null);
  };

  // Run Interactive Multi-Agent Swarm Stream with Live Per-Node Box Log Streaming
  const handleExecuteSwarm = () => {
    if (!goal.trim() || isExecuting) return;
    handleReset();
    setIsExecuting(true);
    const startTime = Date.now();

    addNotification({
      type: 'agent',
      title: 'Swarm Orchestration Started',
      description: 'LangGraph multi-agent DAG initialized across 6 specialized agents.',
    });

    const stepDelay = Math.floor(600 / speedMultiplier);

    const AGENT_METRICS: Record<AgentId, { execMs: number; tokens: number; retries: number; errors: number }> = {
      PlannerAgent:   { execMs: 45,  tokens: 280, retries: 0, errors: 0 },
      RetrieverAgent: { execMs: 112, tokens: 420, retries: 0, errors: 0 },
      ToolAgent:      { execMs: 195, tokens: 310, retries: 0, errors: 0 },
      ReasoningAgent: { execMs: 165, tokens: 530, retries: 0, errors: 0 },
      CriticAgent:    { execMs: 88,  tokens: 240, retries: 0, errors: 0 },
      ResponseAgent:  { execMs: 130, tokens: 680, retries: 0, errors: 0 },
    };

    // Sequential agent execution pipeline
    SWARM_AGENTS.forEach((agent, agentIdx) => {
      // 1. Trigger agent node start
      const startTimer = setTimeout(() => {
        setActiveAgentIdx(agentIdx);
        setAgentStates(prev => ({
          ...prev,
          [agent.id]: {
            status: 'running',
            logs: [],
            isStreaming: true,
            executionTimeMs: AGENT_METRICS[agent.id].execMs,
            tokensUsed: AGENT_METRICS[agent.id].tokens,
            modelUsed: agent.model,
            retries: AGENT_METRICS[agent.id].retries,
            errors: AGENT_METRICS[agent.id].errors,
          }
        }));

        // Stream logs inside this specific agent box line-by-line
        agent.defaultLogs.forEach((logText, logIdx) => {
          const logTimer = setTimeout(() => {
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
            setAgentStates(prev => {
              const currentLogs = prev[agent.id]?.logs || [];
              return {
                ...prev,
                [agent.id]: {
                  ...prev[agent.id],
                  logs: [...currentLogs, { timestamp, text: logText }]
                }
              };
            });
          }, logIdx * Math.floor(180 / speedMultiplier));
          timersRef.current.push(logTimer);
        });

      }, agentIdx * (agent.defaultLogs.length * Math.floor(180 / speedMultiplier) + stepDelay));

      timersRef.current.push(startTimer);

      // 2. Complete agent node
      const completeTimer = setTimeout(() => {
        setAgentStates(prev => ({
          ...prev,
          [agent.id]: { ...prev[agent.id], status: 'done', isStreaming: false }
        }));
      }, (agentIdx + 1) * (agent.defaultLogs.length * Math.floor(180 / speedMultiplier) + stepDelay) - Math.floor(100 / speedMultiplier));

      timersRef.current.push(completeTimer);
    });

    // Final Swarm Output Completion
    const totalDuration = SWARM_AGENTS.length * (5 * Math.floor(180 / speedMultiplier) + stepDelay);
    const finalTimer = setTimeout(() => {
      setIsExecuting(false);
      setActiveAgentIdx(-1);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      const generatedOutput = `### 🏆 Multi-Agent Swarm Execution Complete\n\n**Goal**: "${goal}"\n\n\`\`\`python\n# AIOS LangGraph DAG Output Payload\nexecution_summary = {\n    "planner_status": "Topological DAG compiled",\n    "retriever_nodes": 12,\n    "vector_citations": 8,\n    "python_mcp_sandbox_errors": 0,\n    "reasoning_confidence": 0.994,\n    "ragas_faithfulness_score": 0.992,\n    "status": "APPROVED_FOR_PRODUCTION"\n}\n\`\`\`\n\n- **Planner**: Decomposed goal into 4 subtasks cleanly.\n- **Retriever**: Queried Neo4j graph (12 entity nodes) & Qdrant vector index.\n- **Python Tool**: Executed sandbox script with 0 errors.\n- **Reasoning**: Factual confidence verified at 99.4%.\n- **Critic**: RAGAS quality benchmark score 98.6% (PASSED).\n- **Response**: Formatted SSE token output with zero hallucination risk.`;

      setFinalOutputText(generatedOutput);
      setExecutionStats({
        totalTime: parseFloat(elapsed),
        tokens: 1420,
        cost: 0.0035,
        score: 98.6,
      });

      addNotification({
        type: 'eval',
        title: 'Swarm Task Completed',
        description: `Executed in ${elapsed}s with 98.6% RAGAS quality score.`,
      });
    }, totalDuration);

    timersRef.current.push(finalTimer);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Bot className="w-8 h-8 text-primary animate-pulse" />
            <span>Multi-Agent Studio Swarm</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Recruiter-grade interactive agent orchestration: Step-by-step DAG flow (Planner → Retriever → Python → Reasoning → Critic → Response) streaming live per-node logs.
          </p>
        </div>

        {/* Telemetry Controls & Speed Selector */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-card border border-border/60">
            <span className="text-[10px] font-mono text-muted-foreground px-2">Speed:</span>
            {[1, 2, 5].map(sp => (
              <button
                key={sp}
                onClick={() => setSpeedMultiplier(sp)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  speedMultiplier === sp ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted transition-all"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleExecuteSwarm}
            disabled={isExecuting || !goal.trim()}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isExecuting ? 'Swarm Executing…' : 'Execute Swarm Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Preset Queries Pills */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">Sample Recruiter Prompts</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => { setGoal(q); handleReset(); }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all text-left truncate max-w-md ${
                goal === q
                  ? 'bg-primary/10 border-primary text-white font-bold'
                  : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              ⚡ {q.slice(0, 65)}...
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Sequential Node Boxes & Output Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Col: Step-by-Step Per-Node Log Box Stream (Planner → Retriever → Python → Reasoning → Critic → Response) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between pb-1 border-b border-border/40">
            <span>LangGraph Multi-Agent Pipeline</span>
            <span className="text-[10px] font-mono text-primary">6 Specialized Agents</span>
          </div>

          <div className="space-y-3">
            {SWARM_AGENTS.map((agent, idx) => {
              const state = agentStates[agent.id] || { status: 'idle', logs: [] };
              const isRunning = state.status === 'running';
              const isDone = state.status === 'done';
              const isPending = state.status === 'idle';

              return (
                <div key={agent.id} className="space-y-3">
                  <div
                    className={`glass-card p-4 rounded-2xl border transition-all ${
                      isRunning
                        ? `${agent.borderColor} ${agent.bgColor} ring-2 ring-current shadow-lg shadow-current/10`
                        : isDone
                        ? `${agent.borderColor} bg-muted/20`
                        : 'border-border/40 bg-muted/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${agent.bgColor} ${agent.textColor}`}>
                          {agent.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-bold ${agent.textColor}`}>{agent.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground font-semibold">[{agent.model}]</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">{agent.role}</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center space-x-2">
                        {isRunning && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold flex items-center space-x-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                            <span>Running...</span>
                          </span>
                        )}
                        {isDone && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-[10px] font-mono font-bold">
                            Waiting
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Per-Node Telemetry Metrics Bar (Execution Time, Model Used, Token Count, Retries, Errors) */}
                    {(isRunning || isDone) && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono">
                        <span className="text-amber-300 font-semibold flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{state.executionTimeMs || 45}ms</span>
                        </span>
                        <span className="text-purple-300 font-semibold flex items-center space-x-1">
                          <Brain className="w-3 h-3 text-purple-400" />
                          <span>{state.modelUsed || agent.model}</span>
                        </span>
                        <span className="text-blue-300 font-semibold flex items-center space-x-1">
                          <Coins className="w-3 h-3 text-blue-400" />
                          <span>{state.tokensUsed || 280} tokens</span>
                        </span>
                        <span className="text-emerald-300 font-semibold flex items-center space-x-1">
                          <RotateCcw className="w-3 h-3 text-emerald-400" />
                          <span>{state.retries || 0} retries</span>
                        </span>
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{state.errors || 0} errors</span>
                        </span>
                      </div>
                    )}

                    {/* Per-Node Live Streaming Terminal Logs Window */}
                    <div className="mt-3 p-3 rounded-xl bg-[#080c14] border border-border/60 font-mono text-[11px] min-h-[90px] max-h-40 overflow-y-auto space-y-1">
                      {state.logs.length === 0 ? (
                        <div className="text-muted-foreground/40 text-[10px]">Awaiting DAG execution dispatch...</div>
                      ) : (
                        state.logs.map((log, lIdx) => (
                          <div key={lIdx} className="flex items-start space-x-2 leading-relaxed">
                            <span className="text-[9px] text-muted-foreground/60 shrink-0">[{log.timestamp}]</span>
                            <span className={log.text.includes('Done') ? 'text-emerald-400 font-bold' : 'text-gray-200'}>
                              {log.text}
                            </span>
                          </div>
                        ))
                      )}
                      {isRunning && (
                        <div className="inline-block w-2 h-3.5 bg-primary animate-pulse ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Flow Connection Arrow */}
                  {idx < SWARM_AGENTS.length - 1 && (
                    <div className="flex justify-center text-muted-foreground/40 py-0.5">
                      <ArrowDown className={`w-4 h-4 ${activeAgentIdx === idx ? 'text-primary animate-bounce' : ''}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Output Synthesis & Performance Metrics */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Execution Telemetry Summary */}
          {executionStats && (
            <div className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Swarm Execution Benchmark</span>
                </span>
                <Badge variant="success">98.6% RAGAS Score</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                <div className="p-2.5 rounded-xl bg-black/40 border border-border/40 space-y-0.5">
                  <div className="text-muted-foreground text-[9px] uppercase">Latency</div>
                  <div className="font-bold text-pink-400">{executionStats.totalTime}s</div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-border/40 space-y-0.5">
                  <div className="text-muted-foreground text-[9px] uppercase">Tokens</div>
                  <div className="font-bold text-primary">{executionStats.tokens}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-black/40 border border-border/40 space-y-0.5">
                  <div className="text-muted-foreground text-[9px] uppercase">Cost</div>
                  <div className="font-bold text-emerald-400">${executionStats.cost}</div>
                </div>
              </div>
            </div>
          )}

          {/* Final Swarm Output Window */}
          <div className="glass-card p-5 rounded-2xl border border-border/60 space-y-3 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Final Swarm Output Synthesis</span>
              </div>

              {finalOutputText && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(finalOutputText);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 1500);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] font-mono text-muted-foreground hover:text-white flex items-center space-x-1 border border-border/40"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 p-4 rounded-xl bg-[#080c14] border border-border/60 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[550px]">
              {finalOutputText ? (
                finalOutputText
              ) : isExecuting ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-xs">Swarm is executing DAG nodes line-by-line...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-3 text-center text-muted-foreground">
                  <Bot className="w-8 h-8 opacity-40 text-primary" />
                  <div className="text-xs max-w-xs">
                    Click <span className="text-primary font-bold">"Execute Swarm Workflow"</span> above to watch Planner, Retriever, Python Tool, Reasoning, Critic, and Response stream logs line-by-line.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
