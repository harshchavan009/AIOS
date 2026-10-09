import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Zap,
  Clock,
  DollarSign,
  ArrowRight,
  RotateCcw,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  Cpu,
  Layers,
  Terminal,
  FileText,
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
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { PageSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { PageLayout } from '../components/layouts/PageLayout';
import { useLiveTelemetryStore } from '../store/useLiveTelemetryStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface ExecutionRun {
  id: string;
  workflow: string;
  agent: string;
  status: 'completed' | 'running' | 'failed';
  trigger: 'REST API' | 'Manual' | 'Webhook' | 'Schedule';
  duration: string;
  tokens: number;
  costUsd: number;
  timestamp: string;
  steps: {
    name: string;
    duration: string;
    status: 'completed' | 'running' | 'failed';
    model: string;
    tokens: number;
  }[];
}

const INITIAL_RUNS: ExecutionRun[] = [];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, hardwareHistory, streamRateTokensSec } = useLiveTelemetryStore();
  const { currentWorkspace } = useWorkspaceStore();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchTraces = async () => {
      try {
        const token = localStorage.getItem('aios_access_token');
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
        const res = await fetch('/api/v1/observability/traces', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.traces) && isMounted) {
            const mappedRuns: ExecutionRun[] = data.traces.map((t: any, idx: number) => {
              const durMs = t.duration_ms || (t.end_time && t.start_time ? Math.round((t.end_time - t.start_time) * 1000) : 0);
              const duration = durMs > 0 ? (durMs < 1000 ? `${durMs}ms` : `${(durMs / 1000).toFixed(1)}s`) : 'running';
              const tokens = t.attributes?.tokens || 0;
              const costUsd = Number(((tokens / 1000) * 0.002).toFixed(4));
              return {
                id: t.span_id || `span_${idx}`,
                workflow: t.name || 'Workflow Execution',
                agent: t.attributes?.agent || 'LangGraph Worker',
                status: t.status === 'completed' ? 'completed' : (t.status === 'error' ? 'failed' : 'running'),
                trigger: (t.attributes?.trigger || 'REST API') as any,
                duration,
                tokens,
                costUsd,
                timestamp: t.start_time ? new Date(t.start_time * 1000).toLocaleTimeString() : 'Just now',
                steps: [
                  {
                    name: t.name || 'Step Execution',
                    duration,
                    status: t.status === 'completed' ? 'completed' : 'running',
                    model: t.attributes?.model || 'Claude / GPT-4o',
                    tokens,
                  }
                ]
              };
            });
            setRuns(mappedRuns);
            if (mappedRuns.length > 0) {
              setSelectedRunId(mappedRuns[0].id);
            }
          }
        }
      } catch {
        // Fallback or network error
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTraces();
    const interval = setInterval(fetchTraces, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return <PageSkeleton title="Loading Enterprise Dashboard..." />;
  }

  if (hasError) {
    return (
      <div className="py-12">
        <ErrorState
          title="Telemetry service disconnected"
          description="Failed to establish connection with FastAPI telemetry SSE stream."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 400);
          }}
        />
      </div>
    );
  }

  // Filter runs by search query and status filter
  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.agent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedRun = runs.find((r) => r.id === selectedRunId) || runs[0];

  return (
    <PageLayout
      title="Dashboard"
      description="System execution telemetry, active agent swarms, and runtime cost accounting."
      actions={
        <div className="flex items-center space-x-2">
          <Badge variant="info">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse mr-1.5" />
            Streaming Live
          </Badge>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 250);
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/agents')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Run
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Top Metric Tiles (4 Key Metrics, Not 17 Equal Cards) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Active Agents & Swarms */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Swarms</span>
              <Bot className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {summary.active_agents}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Active tasks
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">LangGraph distributed worker swarm</p>
          </CardContent>
        </Card>

        {/* Tile 2: Token Throughput */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Token Throughput</span>
              <Zap className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {streamRateTokensSec}
              </span>
              <span className="text-xs text-muted-foreground font-mono">tokens/sec</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground font-mono">
              {summary.token_usage_total.toLocaleString()} total processed
            </p>
          </CardContent>
        </Card>

        {/* Tile 3: Average Latency (p50 / p95) */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Average Latency</span>
              <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                {summary.average_latency_ms}
              </span>
              <span className="text-xs text-muted-foreground font-mono">ms (p50)</span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">FastAPI event loop execution</p>
          </CardContent>
        </Card>

        {/* Tile 4: Spend Run-Rate */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Cost Today</span>
              <DollarSign className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="flex items-baseline space-x-2 pt-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground font-mono">
                ${summary.cost_today_usd.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / ${summary.monthly_cost_usd.toFixed(0)} mo
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-muted-foreground">Aggregated across all providers</p>
          </CardContent>
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Execution Runs Table & Trace Detail Inspector */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Runs Table Section (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Workflow Execution Runs
              </h2>
              <p className="text-xs text-muted-foreground">
                Recent agent DAG pipeline invocations and execution status.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center space-x-1.5">
              {(['all', 'running', 'completed', 'failed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded text-xs capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-secondary text-foreground font-semibold border border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by workflow name, agent, or run ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {filteredRuns.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={runs.length === 0 ? "No execution runs recorded" : "No execution runs found"}
              description={
                runs.length === 0
                  ? "No workflow DAGs or agent swarms have been executed yet. Invocations from the Playground, Agent Studio, or API will appear here."
                  : `No runs matched the query "${searchQuery}".`
              }
              actionLabel={runs.length === 0 ? "Open Playground" : "Clear Filter"}
              onAction={() => {
                if (runs.length === 0) {
                  navigate('/playground');
                } else {
                  setSearchQuery('');
                  setStatusFilter('all');
                }
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Run ID</TableHead>
                  <TableHead>Workflow / DAG</TableHead>
                  <TableHead className="w-20">Trigger</TableHead>
                  <TableHead className="w-20 text-right">Duration</TableHead>
                  <TableHead className="w-20 text-right">Tokens</TableHead>
                  <TableHead className="w-16 text-right">Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => {
                  const isSelected = run.id === selectedRunId;
                  return (
                    <TableRow
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-secondary/70 font-medium' : ''
                      }`}
                    >
                      <TableCell>
                        <Badge
                          variant={
                            run.status === 'completed'
                              ? 'success'
                              : run.status === 'running'
                              ? 'info'
                              : 'destructive'
                          }
                          dot
                        >
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        {run.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
                            {run.workflow}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {run.agent}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {run.trigger}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground text-xs">
                        {run.duration}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground text-xs">
                        {run.tokens.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground text-xs">
                        ${run.costUsd.toFixed(4)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Selected Run Trace Detail Inspector (4 cols) */}
        {selectedRun ? (
          <div className="lg:col-span-4 rounded-lg border border-border bg-card p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Run Trace Detail</span>
                  <span className="font-mono text-muted-foreground">({selectedRun.id})</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Step-by-step DAG telemetry and latency breakdown.
                </p>
              </div>
              <Badge
                variant={
                  selectedRun.status === 'completed'
                    ? 'success'
                    : selectedRun.status === 'running'
                    ? 'info'
                    : 'destructive'
                }
                dot
              >
                {selectedRun.status}
              </Badge>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-secondary/50 text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground block font-sans">Latency</span>
                <span className="font-semibold text-foreground">{selectedRun.duration}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-sans">Tokens</span>
                <span className="font-semibold text-foreground">{selectedRun.tokens.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block font-sans">Cost</span>
                <span className="font-semibold text-foreground">${selectedRun.costUsd.toFixed(4)}</span>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-foreground block">
                Execution Timeline ({selectedRun.steps.length} steps)
              </span>

              <div className="space-y-1.5">
                {selectedRun.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded border border-border/80 bg-background space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-medium text-foreground truncate max-w-[180px]">
                        {st.name}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">{st.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>{st.model}</span>
                      {st.tokens > 0 && <span className="font-mono">{st.tokens} tok</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-between">
              <Button
                variant="secondary"
                size="xs"
                className="w-full text-xs"
                onClick={() => navigate('/agents')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Inspect in Agent Studio
              </Button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 rounded-lg border border-border border-dashed bg-card/40 p-8 flex flex-col items-center justify-center text-center space-y-2 min-h-[280px]">
            <Terminal className="w-8 h-8 text-muted-foreground opacity-30" />
            <div className="text-xs font-medium text-foreground">No Run Selected</div>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-normal">
              Execute a workflow in the Playground or Agent Studio to inspect step-by-step trace spans.
            </p>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Real-Time Hardware Telemetry Sparkline Chart */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-lg border border-border bg-card p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Host System Telemetry
              </h3>
              <p className="text-xs text-muted-foreground">
                Live CPU and memory utilization across active worker threads.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                CPU: {summary.cpu_usage_percent}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                RAM: {summary.memory_usage_percent}%
              </span>
            </div>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hardwareHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.15)" />
                <XAxis dataKey="time" stroke="rgba(128, 128, 128, 0.6)" fontSize={10} />
                <YAxis stroke="rgba(128, 128, 128, 0.6)" fontSize={10} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--elevated)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  name="CPU (%)"
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="ram"
                  name="RAM (%)"
                  stroke="var(--muted)"
                  fill="var(--muted)"
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Foundation Models Gateway Status (4 cols) */}
        <div className="lg:col-span-4 rounded-lg border border-border bg-card p-5 space-y-3 shadow-xs">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Model Gateway Availability
            </h3>
            <p className="text-xs text-muted-foreground">
              Provider response latency and health status.
            </p>
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 rounded bg-secondary/40 border border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-medium text-foreground">Claude 3.5 Sonnet</span>
              </div>
              <span className="font-mono text-muted-foreground">284ms • $0.003</span>
            </div>

            <div className="p-2.5 rounded bg-secondary/40 border border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-medium text-foreground">OpenAI GPT-4o</span>
              </div>
              <span className="font-mono text-muted-foreground">312ms • $0.0025</span>
            </div>

            <div className="p-2.5 rounded bg-secondary/40 border border-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-medium text-foreground">Gemini 1.5 Pro</span>
              </div>
              <span className="font-mono text-muted-foreground">340ms • $0.0012</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="xs"
            className="w-full text-xs mt-2"
            onClick={() => navigate('/models')}
          >
            Manage Model Gateway
          </Button>
        </div>
      </div>
      </div>
    </PageLayout>
  );
};
