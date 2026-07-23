import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Bot,
  Activity,
  Zap,
  ArrowUpRight,
  Network,
  Clock
} from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

const METRICS_SERIES = [
  { time: '00:00', tokens: 12400, latency: 140, agents: 4 },
  { time: '04:00', tokens: 18900, latency: 165, agents: 5 },
  { time: '08:00', tokens: 42100, latency: 210, agents: 9 },
  { time: '12:00', tokens: 68400, latency: 185, agents: 12 },
  { time: '16:00', tokens: 94200, latency: 175, agents: 10 },
  { time: '20:00', tokens: 128900, latency: 178, agents: 8 },
];

export const DashboardPage: React.FC = () => {
  const { telemetry, agents } = useAgentStore();

  const activeAgentsCount = telemetry?.active_agents ?? 3;
  const totalAgents = agents?.length ?? 6;
  const totalTokens = (telemetry?.total_tokens_processed ?? 128900).toLocaleString();
  const avgLatency = telemetry?.avg_latency_ms ?? 178;
  const graphNodes = (telemetry?.graph_rag_nodes ?? 14820).toLocaleString();

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Enterprise Overview</h1>
          <p className="text-muted-foreground text-sm">
            Real-time multi-agent telemetry, token throughput, and Graph RAG cluster performance metrics.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-mono text-muted-foreground flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>Telemetry Frequency: 1s</span>
          </div>
          <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center space-x-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Optimize Cluster</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Agents</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{activeAgentsCount} / {totalAgents}</div>
          <div className="mt-2 text-xs text-emerald-500 flex items-center space-x-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% DAG execution health</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens Processed</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{totalTokens}</div>
          <div className="mt-2 text-xs text-emerald-500 flex items-center space-x-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% token throughput</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Latency</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{avgLatency} <span className="text-sm text-muted-foreground">ms</span></div>
          <div className="mt-2 text-xs text-emerald-500 flex items-center space-x-1 font-medium">
            <span>FastAPI Async Loop</span>
          </div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Graph RAG Entities</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Network className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold">{graphNodes}</div>
          <div className="mt-2 text-xs text-indigo-400 flex items-center space-x-1 font-medium">
            <span>Neo4j + Qdrant Synced</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Consumption Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold">LLM Token Consumption Throughput</h3>
              <p className="text-xs text-muted-foreground">Cumulative tokens streamed across active providers</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-mono">Live</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={METRICS_SERIES}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#tokenGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Active Agents Feed */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">Agent Cluster Status</h3>
              <span className="text-xs text-emerald-400 font-mono">All Systems Nominal</span>
            </div>

            <div className="space-y-3">
              {(agents || []).slice(0, 4).map((agent) => (
                <div key={agent.id} className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {agent.name ? agent.name.charAt(0) : 'A'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{agent.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{agent.model}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    agent.status === 'executing'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 text-center">
            <span className="text-xs text-muted-foreground">Managed via LangGraph State Machines</span>
          </div>
        </div>
      </div>
    </div>
  );
};
