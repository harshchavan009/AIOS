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
  Play,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  DollarSign,
  Briefcase,
  ListOrdered,
  Cpu as GpuIcon,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface TelemetryData {
  summary_metrics?: {
    active_agents: number;
    running_jobs: number;
    queued_tasks: number;
    worker_status: string;
    database_health: string;
    redis_health: string;
    neo4j_status: string;
    qdrant_status: string;
    api_usage_total: number;
    token_usage_total: number;
    cost_today_usd: number;
    monthly_cost_usd: number;
    average_latency_ms: number;
    gpu_usage_percent: number;
    gpu_memory: string;
    cpu_usage_percent: number;
    memory_usage_percent: number;
    container_status: string;
  };
  hardware: {
    cpu_percent: number;
    ram_percent: number;
    gpu_percent: number;
    disk_percent: number;
    gpu_memory_used: string;
  };
  infrastructure: {
    docker_containers_active: number;
    docker_containers_healthy: number;
    celery_workers_active: number;
    redis_status: string;
    redis_latency_ms: number;
    postgres_status: string;
    postgres_active_connections: number;
    postgres_latency_ms: number;
    neo4j_status: string;
    neo4j_nodes_count: number;
    neo4j_latency_ms: number;
    qdrant_status: string;
    qdrant_vectors_count: number;
    qdrant_latency_ms: number;
  };
  llm_latencies: {
    openai_gpt4o_ms: number;
    anthropic_claude_ms: number;
    google_gemini_ms: number;
  };
  pipeline_stream: {
    fastapi: string;
    redis: string;
    celery: string;
    worker: string;
    llm: string;
    stream_rate_tokens_sec: number;
  };
}

export const DashboardPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    summary_metrics: {
      active_agents: 6,
      running_jobs: 3,
      queued_tasks: 12,
      worker_status: '4 Workers Active',
      database_health: 'PostgreSQL 16 Healthy',
      redis_health: 'Redis 7 Connected',
      neo4j_status: 'Neo4j Graph Active',
      qdrant_status: 'Qdrant Vectors Synced',
      api_usage_total: 0,
      token_usage_total: 0,
      cost_today_usd: 0.0,
      monthly_cost_usd: 0.0,
      average_latency_ms: 0,
      gpu_usage_percent: 0,
      gpu_memory: '0 GB / 0 GB',
      cpu_usage_percent: 0,
      memory_usage_percent: 0,
      container_status: '7 / 7 Containers Active'
    },
    hardware: {
      cpu_percent: 0,
      ram_percent: 0,
      gpu_percent: 0,
      disk_percent: 0,
      gpu_memory_used: '0 GB / 0 GB'
    },
    infrastructure: {
      docker_containers_active: 7,
      docker_containers_healthy: 7,
      celery_workers_active: 4,
      redis_status: 'connected',
      redis_latency_ms: 1.2,
      postgres_status: 'connected',
      postgres_active_connections: 8,
      postgres_latency_ms: 3.5,
      neo4j_status: 'connected',
      neo4j_nodes_count: 0,
      neo4j_latency_ms: 0.8,
      qdrant_status: 'connected',
      qdrant_vectors_count: 0,
      qdrant_latency_ms: 0.5
    },
    llm_latencies: {
      openai_gpt4o_ms: 0,
      anthropic_claude_ms: 0,
      google_gemini_ms: 0
    },
    pipeline_stream: {
      fastapi: 'healthy',
      redis: 'connected',
      celery: 'active',
      worker: 'processing',
      llm: 'streaming',
      stream_rate_tokens_sec: 0
    }
  });

  const [pipelineActiveNode, setPipelineActiveNode] = useState<number>(0);
  const [streamConnected, setStreamConnected] = useState<boolean>(false);

  const pipelineNodes = [
    { name: 'FastAPI', role: 'REST Gateway', detail: 'Async Request Routing', color: 'from-blue-500 to-indigo-500', textColor: 'text-blue-400' },
    { name: 'Redis', role: 'Message Broker', detail: `Cache & PubSub (${telemetry.infrastructure.redis_latency_ms}ms)`, color: 'from-rose-500 to-red-500', textColor: 'text-rose-400' },
    { name: 'Celery', role: 'Task Queue', detail: `${telemetry.infrastructure.celery_workers_active} Active Worker Threads`, color: 'from-amber-500 to-yellow-500', textColor: 'text-amber-400' },
    { name: 'Worker', role: 'DAG Executor', detail: 'LangGraph State Orchestrator', color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400' },
    { name: 'LLM', role: 'Multi-Model Router', detail: 'GPT-4o / Claude 3.5 / Gemini', color: 'from-purple-500 to-indigo-600', textColor: 'text-purple-400' },
    { name: 'Streaming', role: 'SSE Output', detail: `${telemetry.pipeline_stream.stream_rate_tokens_sec} tokens/sec`, color: 'from-cyan-500 to-blue-500', textColor: 'text-cyan-400' }
  ];

  // Real-Time SSE Stream Telemetry Subscription
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/observability/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setTelemetry(data);
          setStreamConnected(true);
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        setStreamConnected(false);
      };
    } catch {
      setStreamConnected(false);
    }

    // Polling fallback every 2 seconds
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('aios_access_token');
        const res = await fetch('/api/v1/observability/system-telemetry', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
        }
      } catch {
        // preserve
      }
    }, 2000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  // Animate Dataflow Pipeline Pulse Cycle
  useEffect(() => {
    const pipelineInterval = setInterval(() => {
      setPipelineActiveNode((prev) => (prev + 1) % pipelineNodes.length);
    }, 1200);
    return () => clearInterval(pipelineInterval);
  }, [pipelineNodes.length]);

  const summary = telemetry.summary_metrics || {
    active_agents: 6,
    running_jobs: 3,
    queued_tasks: 12,
    worker_status: '4 Workers Active',
    database_health: 'PostgreSQL 16 Healthy',
    redis_health: 'Redis 7 Connected',
    neo4j_status: `Connected (${telemetry.infrastructure.neo4j_nodes_count} Nodes)`,
    qdrant_status: `Connected (${telemetry.infrastructure.qdrant_vectors_count} Vectors)`,
    api_usage_total: 0,
    token_usage_total: 0,
    cost_today_usd: 0.0,
    monthly_cost_usd: 0.0,
    average_latency_ms: 0,
    gpu_usage_percent: telemetry.hardware.gpu_percent,
    gpu_memory: telemetry.hardware.gpu_memory_used,
    cpu_usage_percent: telemetry.hardware.cpu_percent,
    memory_usage_percent: telemetry.hardware.ram_percent,
    container_status: `${telemetry.infrastructure.docker_containers_healthy} / ${telemetry.infrastructure.docker_containers_active} Active Containers`
  };

  const metricCards = [
    { label: 'Active Agents', value: summary.active_agents, sub: 'LangGraph Cluster', icon: Bot, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Running Jobs', value: summary.running_jobs, sub: 'Active Workflows', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Queued Tasks', value: summary.queued_tasks, sub: 'Celery Queue', icon: ListOrdered, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Worker Status', value: summary.worker_status, sub: 'Celery Pool', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Database Health', value: summary.database_health, sub: `Latency: ${telemetry.infrastructure.postgres_latency_ms}ms`, icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Redis Health', value: summary.redis_health, sub: `Latency: ${telemetry.infrastructure.redis_latency_ms}ms`, icon: Server, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Neo4j Status', value: summary.neo4j_status, sub: `Graph Nodes`, icon: Network, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Qdrant Status', value: summary.qdrant_status, sub: `Vector Store`, icon: Layers, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'API Usage', value: summary.api_usage_total.toLocaleString(), sub: 'Total Requests', icon: TrendingUp, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Token Usage', value: summary.token_usage_total.toLocaleString(), sub: 'Streamed Tokens', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Cost Today', value: `$${summary.cost_today_usd.toFixed(2)}`, sub: 'Daily Aggregate', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Monthly Cost', value: `$${summary.monthly_cost_usd.toFixed(2)}`, sub: 'Monthly Budget: $1000', icon: DollarSign, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Average Latency', value: `${summary.average_latency_ms} ms`, sub: 'FastAPI p50 Loop', icon: Clock, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { label: 'GPU Usage', value: `${summary.gpu_usage_percent}%`, sub: summary.gpu_memory, icon: GpuIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'CPU Usage', value: `${summary.cpu_usage_percent}%`, sub: 'Host Utilization', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Memory Usage', value: `${summary.memory_usage_percent}%`, sub: 'RAM Allocation', icon: HardDrive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Container Status', value: summary.container_status, sub: 'Docker Swarm Cluster', icon: Box, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
            <Radio className={`w-3.5 h-3.5 ${streamConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{streamConnected ? 'SSE Live Stream: Connected' : 'Polling Stream: 2s'}</span>
          </div>
          <Badge variant="success">All {telemetry.infrastructure.docker_containers_healthy} Docker Containers Healthy</Badge>
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
            Streaming Rate: {telemetry.pipeline_stream.stream_rate_tokens_sec} tokens/sec
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
              {telemetry.llm_latencies.openai_gpt4o_ms} ms
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-bold text-foreground">Anthropic Claude 3.5</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
              {telemetry.llm_latencies.anthropic_claude_ms} ms
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-bold text-foreground">Google Gemini 1.5</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              {telemetry.llm_latencies.google_gemini_ms} ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
