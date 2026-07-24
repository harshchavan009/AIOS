import { create } from 'zustand';
import { Agent, SystemTelemetry } from '../types';

interface AgentState {
  agents: Agent[];
  telemetry: SystemTelemetry;
  selectedAgent: Agent | null;
  selectAgent: (agent: Agent | null) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  setTelemetry: (telemetry: Partial<SystemTelemetry>) => void;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-planner',
    name: 'Planner Agent',
    role: 'planner',
    status: 'idle',
    capabilities: ['Task Decomposition', 'DAG Workflow Generation', 'Goal Alignment'],
    model: 'GPT-4o',
    latency_ms: 0,
    tokens_used: 0,
    active_tasks: 0
  },
  {
    id: 'agent-retriever',
    name: 'Graph RAG Retriever Agent',
    role: 'retriever',
    status: 'idle',
    capabilities: ['Hybrid Vector Search', 'Graph Traversal', 'Context Reranking'],
    model: 'Claude 3.5 Sonnet',
    latency_ms: 0,
    tokens_used: 0,
    active_tasks: 0
  },
  {
    id: 'agent-reasoning',
    name: 'Reasoning & Synthesis Agent',
    role: 'reasoning',
    status: 'idle',
    capabilities: ['Deep Deductive Logic', 'Multi-source Synthesis', 'Hypothesis Testing'],
    model: 'Gemini 1.5 Pro',
    latency_ms: 0,
    tokens_used: 0,
    active_tasks: 0
  },
  {
    id: 'agent-critic',
    name: 'Critic & Validator Agent',
    role: 'critic',
    status: 'idle',
    capabilities: ['Factuality Check', 'Hallucination Mitigation', 'Policy Enforcement'],
    model: 'Claude 3.5 Sonnet',
    latency_ms: 0,
    tokens_used: 0,
    active_tasks: 0
  },
  {
    id: 'agent-tool',
    name: 'Tool Execution Agent',
    role: 'tool',
    status: 'idle',
    capabilities: ['MCP Protocol', 'Rest API Calls', 'Sandbox Execution'],
    model: 'GPT-4o Mini',
    latency_ms: 0,
    tokens_used: 0,
    active_tasks: 0
  },
  {
    id: 'agent-response',
    name: 'Response Streaming Agent',
    role: 'response',
    status: 'idle',
    capabilities: ['SSE Streaming', 'Format Standardization', 'UI Serialization'],
    model: 'GPT-4o',
    latency_ms: 0,
    tokens_used: 0,
    active_tasks: 0
  }
];

export const useAgentStore = create<AgentState>((set) => ({
  agents: INITIAL_AGENTS,
  telemetry: {
    status: 'healthy',
    active_agents: 0,
    total_tokens_processed: 0,
    avg_latency_ms: 0,
    graph_rag_nodes: 0,
    vector_index_documents: 0,
    redis_hit_rate: 100.0
  },
  selectedAgent: INITIAL_AGENTS[0],
  selectAgent: (agent) => set({ selectedAgent: agent }),
  updateAgentStatus: (id, status) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a))
  })),
  setTelemetry: (newTelemetry) => set((state) => ({
    telemetry: { ...state.telemetry, ...newTelemetry }
  }))
}));
