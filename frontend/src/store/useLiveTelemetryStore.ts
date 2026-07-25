import { create } from 'zustand';
import { useNotificationStore } from './useNotificationStore';

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
  hardwareHistory: HardwareDataPoint[];
  dailyTrends: DailyTrendPoint[];
  llmLatencies: {
    openai_gpt4o_ms: number;
    anthropic_claude_ms: number;
    google_gemini_ms: number;
  };
  streamRateTokensSec: number;
  isLive: boolean;
  tickCounter: number;
  startTicker: () => void;
  stopTicker: () => void;
  updateFromApi: (data: any) => void;
}

const AGENT_SEQUENCE = [3, 4, 5, 4, 3, 4, 5, 6];

const INITIAL_HARDWARE_HISTORY: HardwareDataPoint[] = [
  { time: '10:00:00', cpu: 18.2, ram: 44.5, gpu: 12.0 },
  { time: '10:00:02', cpu: 22.4, ram: 45.1, gpu: 14.2 },
  { time: '10:00:04', cpu: 28.1, ram: 46.0, gpu: 18.5 },
  { time: '10:00:06', cpu: 24.5, ram: 45.8, gpu: 15.0 },
  { time: '10:00:08', cpu: 31.0, ram: 47.2, gpu: 21.4 },
  { time: '10:00:10', cpu: 26.8, ram: 46.5, gpu: 16.8 },
  { time: '10:00:12', cpu: 34.2, ram: 48.0, gpu: 24.1 },
];

const INITIAL_DAILY_TRENDS: DailyTrendPoint[] = [
  { day: 'Mon', cost: 12.4, tokens: 420000 },
  { day: 'Tue', cost: 18.2, tokens: 680000 },
  { day: 'Wed', cost: 15.6, tokens: 540000 },
  { day: 'Thu', cost: 24.8, tokens: 920000 },
  { day: 'Fri', cost: 29.5, tokens: 1150000 },
  { day: 'Sat', cost: 21.0, tokens: 780000 },
  { day: 'Sun', cost: 26.4, tokens: 990000 },
];

const SAMPLE_EVENTS = [
  { type: 'agent' as const, title: 'Active Agents Updated', description: 'LangGraph cluster scaled active workers (4/6)' },
  { type: 'workflow' as const, title: 'Token Throughput Spike', description: 'SSE stream velocity reached 124 tokens/sec' },
  { type: 'knowledge' as const, title: 'Graph RAG Sync', description: 'Neo4j knowledge graph indexed 18 new entity nodes' },
  { type: 'eval' as const, title: 'Model Latency Check', description: 'OpenAI GPT-4o latency measured at 134ms' },
  { type: 'document' as const, title: 'Vector Store Synced', description: 'Qdrant collection updated with 32 document embeddings' },
];

let timerId: ReturnType<typeof setInterval> | null = null;

export const useLiveTelemetryStore = create<TelemetryStoreState>((set, get) => ({
  summary: {
    active_agents: 3,
    running_jobs: 2,
    queued_tasks: 11,
    worker_status: '3 Workers Active',
    database_health: 'PostgreSQL 16 Healthy',
    redis_health: 'Redis 7 Connected',
    neo4j_status: 'Connected (1,420 Nodes)',
    qdrant_status: 'Connected (3,890 Vectors)',
    api_usage_total: 1420,
    token_usage_total: 1845200,
    cost_today_usd: 33.21,
    monthly_cost_usd: 996.30,
    average_latency_ms: 138,
    gpu_usage_percent: 18.4,
    gpu_memory: '4.2 GB / 16 GB',
    cpu_usage_percent: 24.5,
    memory_usage_percent: 46.8,
    container_status: '7 / 7 Containers Active'
  },
  hardwareHistory: INITIAL_HARDWARE_HISTORY,
  dailyTrends: INITIAL_DAILY_TRENDS,
  llmLatencies: {
    openai_gpt4o_ms: 138,
    anthropic_claude_ms: 154,
    google_gemini_ms: 118,
  },
  streamRateTokensSec: 88.5,
  isLive: true,
  tickCounter: 0,

  updateFromApi: (data: any) => {
    if (!data || !data.summary_metrics) return;
    const sm = data.summary_metrics;
    const hw = data.hardware || {};
    const lat = data.llm_latencies || {};
    const pipe = data.pipeline_stream || {};

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newHwPoint: HardwareDataPoint = {
      time: timeStr,
      cpu: hw.cpu_percent ?? sm.cpu_usage_percent ?? 25,
      ram: hw.ram_percent ?? sm.memory_usage_percent ?? 47,
      gpu: hw.gpu_percent ?? sm.gpu_usage_percent ?? 18,
    };

    set((state) => {
      const updatedHw = [...state.hardwareHistory.slice(-14), newHwPoint];
      return {
        summary: { ...state.summary, ...sm },
        hardwareHistory: updatedHw,
        llmLatencies: {
          openai_gpt4o_ms: lat.openai_gpt4o_ms || state.llmLatencies.openai_gpt4o_ms,
          anthropic_claude_ms: lat.anthropic_claude_ms || state.llmLatencies.anthropic_claude_ms,
          google_gemini_ms: lat.google_gemini_ms || state.llmLatencies.google_gemini_ms,
        },
        streamRateTokensSec: pipe.stream_rate_tokens_sec || state.streamRateTokensSec,
      };
    });
  },

  startTicker: () => {
    if (timerId) return;

    timerId = setInterval(() => {
      const state = get();
      const nextTick = state.tickCounter + 1;
      const agentCount = AGENT_SEQUENCE[nextTick % AGENT_SEQUENCE.length];
      const tokenIncrement = Math.floor(65 + Math.random() * 95);
      const newTokens = state.summary.token_usage_total + tokenIncrement;
      const newCost = Number((newTokens * 0.000018).toFixed(2));

      const jitterCpu = Math.min(95, Math.max(12, Number((24.5 + Math.sin(nextTick * 0.5) * 12 + Math.random() * 8).toFixed(1))));
      const jitterRam = Math.min(95, Math.max(30, Number((46.0 + Math.cos(nextTick * 0.4) * 4 + Math.random() * 3).toFixed(1))));
      const jitterGpu = Math.min(95, Math.max(8, Number((18.0 + Math.sin(nextTick * 0.7) * 9 + Math.random() * 5).toFixed(1))));

      const jitterLatency = Math.floor(125 + Math.sin(nextTick * 0.6) * 28 + Math.random() * 15);
      const streamRate = Number((82.5 + Math.sin(nextTick * 0.8) * 35 + Math.random() * 20).toFixed(1));

      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
      const newHwPoint: HardwareDataPoint = {
        time: timeStr,
        cpu: jitterCpu,
        ram: jitterRam,
        gpu: jitterGpu,
      };

      const updatedHistory = [...state.hardwareHistory.slice(-14), newHwPoint];

      // Update daily trends for graph animations
      const updatedTrends = state.dailyTrends.map((dt, idx) => {
        if (idx === state.dailyTrends.length - 1) {
          return {
            ...dt,
            tokens: dt.tokens + tokenIncrement,
            cost: Number((dt.cost + tokenIncrement * 0.000018).toFixed(2)),
          };
        }
        return dt;
      });

      set({
        tickCounter: nextTick,
        hardwareHistory: updatedHistory,
        dailyTrends: updatedTrends,
        streamRateTokensSec: streamRate,
        summary: {
          ...state.summary,
          active_agents: agentCount,
          running_jobs: agentCount > 3 ? 4 : 2,
          queued_tasks: 8 + agentCount,
          worker_status: `${agentCount} Workers Active`,
          token_usage_total: newTokens,
          cost_today_usd: newCost,
          monthly_cost_usd: Number((newCost * 30).toFixed(2)),
          average_latency_ms: jitterLatency,
          cpu_usage_percent: jitterCpu,
          memory_usage_percent: jitterRam,
          gpu_usage_percent: jitterGpu,
          api_usage_total: state.summary.api_usage_total + 1,
        },
        llmLatencies: {
          openai_gpt4o_ms: Math.floor(135 + Math.random() * 24),
          anthropic_claude_ms: Math.floor(148 + Math.random() * 32),
          google_gemini_ms: Math.floor(115 + Math.random() * 18),
        },
      });

      // Spawn periodic toast notifications every ~5 ticks (10s)
      if (nextTick % 5 === 0) {
        const ev = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
        let desc = ev.description;
        if (ev.type === 'agent') {
          desc = `LangGraph cluster active workers updated (${agentCount}/6)`;
        } else if (ev.type === 'workflow') {
          desc = `SSE token stream rate peaked at ${streamRate} tokens/sec`;
        }
        useNotificationStore.getState().addNotification({
          type: ev.type,
          title: ev.title,
          description: desc,
        });
      }
    }, 2000);
  },

  stopTicker: () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  },
}));
