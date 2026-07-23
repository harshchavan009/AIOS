import { create } from 'zustand';
import { Agent, SystemTelemetry } from '../types';

interface AgentState {
  agents: Agent[];
  telemetry: SystemTelemetry;
  selectedAgent: Agent | null;
  selectAgent: (agent: Agent | null) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-planner',
    name: 'Planner Agent',
    role: 'planner',
    status: 'executing',
    capabilities: ['Task Decomposition', 'DAG Workflow Generation', 'Goal Alignment'],
    model: 'GPT-4o',
    latency_ms: 240,
    tokens_used: 14200,
    active_tasks: 3
  },
  {
    id: 'agent-retriever',
    name: 'Graph RAG Retriever Agent',
    role: 'retriever',
    status: 'executing',
    capabilities: ['Hybrid Vector Search', 'Graph Traversal', 'Context Reranking'],
    model: 'Claude 3.5 Sonnet',
    latency_ms: 180,
    tokens_used: 32900,
    active_tasks: 7
  },
  {
    id: 'agent-reasoning',
    name: 'Reasoning & Synthesis Agent',
    role: 'reasoning',
    status: 'idle',
    capabilities: ['Deep Deductive Logic', 'Multi-source Synthesis', 'Hypothesis Testing'],
    model: 'Gemini 1.5 Pro',
    latency_ms: 310,
    tokens_used: 48100,
    active_tasks: 0
  },
  {
    id: 'agent-critic',
    name: 'Critic & Validator Agent',
    role: 'critic',
    status: 'idle',
    capabilities: ['Factuality Check', 'Hallucination Mitigation', 'Policy Enforcement'],
    model: 'Claude 3.5 Sonnet',
    latency_ms: 195,
    tokens_used: 19400,
    active_tasks: 0
  },
  {
    id: 'agent-tool',
    name: 'Tool Execution Agent',
    role: 'tool',
    status: 'executing',
    capabilities: ['MCP Protocol', 'Rest API Calls', 'Sandbox Execution'],
    model: 'GPT-4o Mini',
    latency_ms: 95,
    tokens_used: 8200,
    active_tasks: 2
  },
  {
    id: 'agent-response',
    name: 'Response Streaming Agent',
    role: 'response',
    status: 'idle',
    capabilities: ['SSE Streaming', 'Format Standardization', 'UI Serialization'],
    model: 'GPT-4o',
    latency_ms: 45,
    tokens_used: 6100,
    active_tasks: 0
  }
];

export const useAgentStore = create<AgentState>((set) => ({
  agents: INITIAL_AGENTS,
  telemetry: {
    status: 'healthy',
    active_agents: 3,
    total_tokens_processed: 128900,
    avg_latency_ms: 178,
    graph_rag_nodes: 14820,
    vector_index_documents: 84200,
    redis_hit_rate: 99.4
  },
  selectedAgent: INITIAL_AGENTS[0],
  selectAgent: (agent) => set({ selectedAgent: agent }),
  updateAgentStatus: (id, status) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a))
  }))
}));
