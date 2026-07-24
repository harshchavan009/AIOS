export type UserRole = 'Owner' | 'Admin' | 'Developer' | 'Analyst' | 'Viewer' | 'engineer' | 'admin' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_superuser: boolean;
  is_verified?: boolean;
  oauth_provider?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  device_name: string;
  ip_address?: string;
  user_agent?: string;
  last_active_at: string;
  expires_at: string;
  is_current?: boolean;
}

export interface LoginHistoryItem {
  id: string;
  email: string;
  ip_address?: string;
  user_agent?: string;
  status: string;
  failure_reason?: string;
  created_at: string;
}

export interface InviteItem {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  invite_token: string;
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
