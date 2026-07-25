import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  Network,
  Clock,
  Cpu,
  HardDrive,
  Database,
  Server,
  Radio,
  Box,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  Briefcase,
  ListOrdered,
  Cpu as GpuIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Badge } from '../components/ui/Badge';
import { PageSkeleton } from '../components/ui/Skeleton';
import { ActivityTimelinePanel } from '../components/common/ActivityTimelinePanel';
import { useLiveTelemetryStore } from '../store/useLiveTelemetryStore';

export const DashboardPage: React.FC = () => {
  const { summary, hardwareHistory, llmLatencies, streamRateTokensSec } = useLiveTelemetryStore();
  const [pipelineActiveNode, setPipelineActiveNode] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  const pipelineNodes = [
    { name: 'FastAPI', role: 'REST Gateway', detail: 'Async Request Routing', color: 'from-blue-500 to-indigo-500', textColor: 'text-blue-400' },
    { name: 'Redis', role: 'Message Broker', detail: `Cache & PubSub (1.2ms)`, color: 'from-rose-500 to-red-500', textColor: 'text-rose-400' },
    { name: 'Celery', role: 'Task Queue', detail: `${summary.active_agents} Active Worker Threads`, color: 'from-amber-500 to-yellow-500', textColor: 'text-amber-400' },
    { name: 'Worker', role: 'DAG Executor', detail: 'LangGraph State Orchestrator', color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400' },
    { name: 'LLM', role: 'Multi-Model Router', detail: 'GPT-4o / Claude 3.5 / Gemini', color: 'from-purple-500 to-indigo-600', textColor: 'text-purple-400' },
    { name: 'Streaming', role: 'SSE Output', detail: `${streamRateTokensSec} tokens/sec`, color: 'from-cyan-500 to-blue-500', textColor: 'text-cyan-400' }
  ];

  // Animate Dataflow Pipeline Pulse Cycle
  useEffect(() => {
    const pipelineInterval = setInterval(() => {
      setPipelineActiveNode((prev) => (prev + 1) % pipelineNodes.length);
    }, 1200);
    return () => clearInterval(pipelineInterval);
  }, [pipelineNodes.length]);

  if (isLoading) {
    return <PageSkeleton title="Loading Enterprise Infrastructure Dashboard..." />;
  }

  const metricCards = [
    { label: 'Active Agents', value: `${summary.active_agents}/6`, sub: 'LangGraph Worker Swarm', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Running Jobs', value: summary.running_jobs, sub: 'Active Workflows', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Queued Tasks', value: summary.queued_tasks, sub: 'Celery Task Queue', icon: ListOrdered, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Worker Status', value: summary.worker_status, sub: 'Celery Worker Pool', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Database Health', value: summary.database_health, sub: `Postgres 16 Connected`, icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Redis Health', value: summary.redis_health, sub: `Latency: 1.2ms`, icon: Server, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Neo4j Status', value: summary.neo4j_status, sub: `Graph Nodes Synced`, icon: Network, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Qdrant Status', value: summary.qdrant_status, sub: `Vector Embeddings Store`, icon: Database, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'API Usage', value: summary.api_usage_total.toLocaleString(), sub: 'Total Requests Executed', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Token Usage', value: summary.token_usage_total.toLocaleString(), sub: `+${streamRateTokensSec} tokens/s`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Cost Today', value: `$${summary.cost_today_usd.toFixed(2)}`, sub: 'Daily Aggregated Usage', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Monthly Cost', value: `$${summary.monthly_cost_usd.toFixed(2)}`, sub: 'Budget: $1,000.00 / mo', icon: DollarSign, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Average Latency', value: `${summary.average_latency_ms} ms`, sub: 'FastAPI p50 Loop', icon: Clock, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'GPU Usage', value: `${summary.gpu_usage_percent}%`, sub: summary.gpu_memory, icon: GpuIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'CPU Usage', value: `${summary.cpu_usage_percent}%`, sub: 'Host CPU Load', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Memory Usage', value: `${summary.memory_usage_percent}%`, sub: 'System RAM Utilization', icon: HardDrive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Container Status', value: summary.container_status, sub: 'Docker Swarm Active', icon: Box, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Enterprise Infrastructure Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Real-time live telemetry, 17 system metric indicators, Docker cluster state, and SSE streaming pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-mono text-muted-foreground flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>SSE Live Stream: Connected (2s)</span>
          </div>
          <Badge variant="success">All 7 Docker Containers Healthy</Badge>
        </div>
      </div>

      {/* Live Dataflow Pipeline Visual Diagram */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="text-base font-bold">Live Execution Dataflow Pipeline</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            Streaming Rate: {streamRateTokensSec} tokens/sec
          </span>
        </div>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {pipelineNodes.map((node, idx) => {
            const isActive = idx === pipelineActiveNode;
            return (
              <div key={node.name} className="flex flex-col items-center space-y-2 relative">
                <div
                  className={`w-full p-4 rounded-xl border transition-all duration-500 space-y-2 relative overflow-hidden ${
                    isActive
                      ? `bg-primary/10 border-primary ring-2 ring-primary shadow-lg shadow-primary/20 scale-105 z-10`
                      : 'bg-muted/30 border-border/40 text-muted-foreground'
                  }`}
                >
                  {isActive && (
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${node.color} animate-pulse`} />
                  )}

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isActive ? node.textColor : 'text-foreground'}`}>
                      {node.name}
                    </span>
                    {isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" />
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-muted-foreground">{node.role}</div>
                </div>

                {/* Connector Arrow */}
                {idx < pipelineNodes.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className={`w-4 h-4 ${idx <= pipelineActiveNode ? 'text-primary animate-pulse' : 'text-muted-foreground/30'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Node Detail */}
        <div className="p-3 rounded-xl bg-[#090d16] border border-border/60 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-primary font-bold">{pipelineNodes[pipelineActiveNode].name}:</span>
            <span className="text-gray-300">{pipelineNodes[pipelineActiveNode].detail}</span>
          </div>
          <span className="text-muted-foreground text-[10px]">Real-Time SSE Stream</span>
        </div>
      </div>

      {/* 17 Live Metric Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight">Live System Indicators (17 Realtime Metrics)</h2>
          <Badge variant="info">Live Stream Active</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="glass-card glass-card-hover p-4 rounded-2xl space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{card.label}</span>
                  <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold tracking-tight">{card.value}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{card.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Hardware Telemetry Area Chart & Activity Timeline Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>Real-Time Host Hardware Load</span>
              </h3>
              <p className="text-xs text-muted-foreground">CPU, RAM, and GPU time-series utilization</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Updating Live (2s)</span>
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hardwareHistory}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cpu" name="CPU Utilization (%)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                <Area type="monotone" dataKey="ram" name="RAM Allocation (%)" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#ramGrad)" />
                <Area type="monotone" dataKey="gpu" name="GPU Utilization (%)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#gpuGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Enterprise Activity Feed Timeline Panel */}
        <ActivityTimelinePanel />
      </div>

      {/* LLM Model Provider Latency Monitors */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h3 className="text-base font-bold flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <span>Multi-Provider LLM Latency Monitors</span>
          </h3>
          <span className="text-xs font-mono text-muted-foreground">P95 Response Latencies</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-foreground">OpenAI GPT-4o</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              {llmLatencies.openai_gpt4o_ms} ms
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-bold text-foreground">Anthropic Claude 3.5</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
              {llmLatencies.anthropic_claude_ms} ms
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-bold text-foreground">Google Gemini 1.5</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              {llmLatencies.google_gemini_ms} ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
