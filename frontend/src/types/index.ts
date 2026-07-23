export type UserRole = 'admin' | 'engineer' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export type AgentRole = 'planner' | 'retriever' | 'reasoning' | 'critic' | 'tool' | 'response';
export type AgentStatus = 'idle' | 'executing' | 'completed' | 'failed' | 'paused';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  capabilities: string[];
  model: string;
  latency_ms: number;
  tokens_used: number;
  active_tasks: number;
}

export interface SystemTelemetry {
  status: 'healthy' | 'degraded' | 'unhealthy';
  active_agents: number;
  total_tokens_processed: number;
  avg_latency_ms: number;
  graph_rag_nodes: number;
  vector_index_documents: number;
  redis_hit_rate: number;
}

export interface MetricSeriesPoint {
  time: string;
  tokens: number;
  latency: number;
  agents: number;
}
