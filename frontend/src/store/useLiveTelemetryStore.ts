import { create } from 'zustand';

export interface HardwareDataPoint {
  time: string;
  cpu: number;
  ram: number;
  gpu: number;
}

export interface DailyTrendPoint {
  day: string;
  cost: number;
  tokens: number;
}

export interface RunningAgent {
  name: string;
  agent_id: string;
  status: string;
  detail: string;
  color?: string;
}

export interface TelemetrySummary {
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
}

export interface TelemetryStoreState {
  summary: TelemetrySummary;
  runningAgents: RunningAgent[];
  hardwareHistory: HardwareDataPoint[];
  dailyTrends: DailyTrendPoint[];
  llmLatencies: {
    openai_gpt4o_ms: number;
    anthropic_claude_ms: number;
    google_gemini_ms: number;
  };
  streamRateTokensSec: number;
  isLive: boolean;
  hasLiveApi: boolean;
  tickCounter: number;
  startTicker: () => void;
  stopTicker: () => void;
  updateFromApi: (data: any) => void;
  registerDeployedAgent: (agentName: string, detail: string) => void;
}

let timerId: ReturnType<typeof setInterval> | null = null;

export const useLiveTelemetryStore = create<TelemetryStoreState>((set, get) => ({
  summary: {
    active_agents: 0,
    running_jobs: 0,
    queued_tasks: 0,
    worker_status: '1 Worker Active (Local)',
    database_health: 'Database Engine Ready',
    redis_health: 'Cache Ready',
    neo4j_status: 'Knowledge Graph Ready',
    qdrant_status: 'Vector Store Ready',
    api_usage_total: 0,
    token_usage_total: 0,
    cost_today_usd: 0.0,
    monthly_cost_usd: 0.0,
    average_latency_ms: 0,
    gpu_usage_percent: 0.0,
    gpu_memory: '0 GB / 0 GB',
    cpu_usage_percent: 0.0,
    memory_usage_percent: 0.0,
    container_status: 'Active'
  },
  runningAgents: [],
  hardwareHistory: [],
  dailyTrends: [],
  llmLatencies: {
    openai_gpt4o_ms: 0,
    anthropic_claude_ms: 0,
    google_gemini_ms: 0,
  },
  streamRateTokensSec: 0,
  isLive: true,
  hasLiveApi: false,
  tickCounter: 0,

  updateFromApi: (data: any) => {
    if (!data || !data.summary_metrics) return;
    const sm = data.summary_metrics;
    const hw = data.hardware || {};
    const lat = data.llm_latencies || {};
    const pipe = data.pipeline_stream || {};
    const agents = data.running_agents || [];

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newHwPoint: HardwareDataPoint = {
      time: timeStr,
      cpu: hw.cpu_percent ?? sm.cpu_usage_percent ?? 0,
      ram: hw.ram_percent ?? sm.memory_usage_percent ?? 0,
      gpu: hw.gpu_percent ?? sm.gpu_usage_percent ?? 0,
    };

    set((state) => {
      const updatedHw = [...state.hardwareHistory.slice(-14), newHwPoint];
      return {
        hasLiveApi: true,
        summary: { ...state.summary, ...sm },
        runningAgents: agents,
        hardwareHistory: updatedHw,
        llmLatencies: {
          openai_gpt4o_ms: lat.openai_gpt4o_ms || 0,
          anthropic_claude_ms: lat.anthropic_claude_ms || 0,
          google_gemini_ms: lat.google_gemini_ms || 0,
        },
        streamRateTokensSec: pipe.stream_rate_tokens_sec || 0,
      };
    });
  },

  registerDeployedAgent: (agentName: string, detail: string) => {
    const newAgent: RunningAgent = {
      name: agentName,
      agent_id: `${agentName.replace(/\s+/g, '')}Agent`,
      status: 'Running',
      detail: detail || 'Deployed LangGraph Worker',
      color: 'emerald'
    };
    set((state) => ({
      runningAgents: [newAgent, ...state.runningAgents.filter(a => a.name !== agentName)],
      summary: {
        ...state.summary,
        active_agents: state.summary.active_agents + 1
      }
    }));
  },

  startTicker: () => {
    if (timerId) return;

    const pollBackend = async () => {
      try {
        const token = localStorage.getItem('aios_access_token');
        const res = await fetch('/api/v1/observability/system-telemetry', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          get().updateFromApi(data);
        }
      } catch {
        // Keep idle state without simulating fake numbers
      }
    };

    pollBackend();
    timerId = setInterval(pollBackend, 5000);
  },

  stopTicker: () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
}));
