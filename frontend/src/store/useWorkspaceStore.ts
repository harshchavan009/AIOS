import { create } from 'zustand';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface WorkspaceResources {
  users?: number;
  documents: number;
  apiKeys?: number;
  agents: number;
  prompts: number;
  analytics?: {
    tokens_today: number;
    cost_today_usd: number;
    environment?: string;
  };
  settings?: {
    environment: string;
    llmProvider: string;
    region: string;
  };
}

export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  resources?: WorkspaceResources;
}

interface WorkspaceState {
  organizations: Organization[];
  workspaces: Workspace[];
  currentOrganization: Organization | null;
  currentWorkspace: Workspace | null;
  setOrganization: (org: Organization) => void;
  setWorkspace: (ws: Workspace) => void;
  fetchOrganizations: () => Promise<void>;
  fetchWorkspaces: (orgId: string) => Promise<void>;
}

const DEFAULT_ORGS: Organization[] = [
  { id: 'org-acme', name: 'Acme Enterprise AI', slug: 'acme-enterprise', plan: 'enterprise' },
  { id: 'org-labs', name: 'AIOS R&D Labs', slug: 'aios-labs', plan: 'pro' }
];

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-startup',
    organization_id: 'org-acme',
    name: 'My Startup',
    slug: 'my-startup',
    resources: {
      users: 4,
      documents: 18,
      apiKeys: 3,
      agents: 4,
      prompts: 12,
      analytics: { tokens_today: 480000, cost_today_usd: 8.64, environment: 'SaaS MVP (Production)' },
      settings: { environment: 'SaaS MVP', llmProvider: 'OpenAI GPT-4o', region: 'us-east-1' },
    },
  },
  {
    id: 'ws-openai',
    organization_id: 'org-acme',
    name: 'OpenAI Team',
    slug: 'openai-team',
    resources: {
      users: 8,
      documents: 64,
      apiKeys: 6,
      agents: 8,
      prompts: 35,
      analytics: { tokens_today: 2400000, cost_today_usd: 43.20, environment: 'GPT-4o Inference Cluster' },
      settings: { environment: 'LLM Cluster', llmProvider: 'OpenAI GPT-4o / O3', region: 'us-west-2' },
    },
  },
  {
    id: 'ws-finance',
    organization_id: 'org-acme',
    name: 'Finance Team',
    slug: 'finance-team',
    resources: {
      users: 5,
      documents: 112,
      apiKeys: 4,
      agents: 6,
      prompts: 22,
      analytics: { tokens_today: 1100000, cost_today_usd: 19.80, environment: 'SOC-2 Enforced Vault' },
      settings: { environment: 'SOC-2 Enforced', llmProvider: 'Claude 3.5 Sonnet', region: 'us-east-1' },
    },
  },
  {
    id: 'ws-healthcare',
    organization_id: 'org-acme',
    name: 'Healthcare',
    slug: 'healthcare',
    resources: {
      users: 6,
      documents: 95,
      apiKeys: 5,
      agents: 5,
      prompts: 18,
      analytics: { tokens_today: 950000, cost_today_usd: 17.10, environment: 'HIPAA Compliant Sandbox' },
      settings: { environment: 'HIPAA Vault', llmProvider: 'Google Gemini 1.5 Pro', region: 'eu-west-1' },
    },
  },
  {
    id: 'ws-research',
    organization_id: 'org-acme',
    name: 'Research Lab',
    slug: 'research-lab',
    resources: {
      users: 10,
      documents: 140,
      apiKeys: 8,
      agents: 10,
      prompts: 45,
      analytics: { tokens_today: 3800000, cost_today_usd: 68.40, environment: 'Deep Learning & Graph RAG' },
      settings: { environment: 'Graph RAG Mesh', llmProvider: 'Multi-Model Swarm', region: 'us-west-1' },
    },
  },
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  organizations: DEFAULT_ORGS,
  workspaces: DEFAULT_WORKSPACES,
  currentOrganization: DEFAULT_ORGS[0],
  currentWorkspace: DEFAULT_WORKSPACES[0],

  setOrganization: (org) => {
    set({ currentOrganization: org });
    get().fetchWorkspaces(org.id);
  },

  setWorkspace: (ws) => {
    set({ currentWorkspace: ws });
  },

  fetchOrganizations: async () => {
    try {
      const token = localStorage.getItem('aios_access_token');
      if (!token) return;
      const res = await fetch('/api/v1/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          set({ organizations: data, currentOrganization: data[0] });
        }
      }
    } catch (e) {
      console.error('Fetch orgs error:', e);
    }
  },

  fetchWorkspaces: async (orgId) => {
    try {
      const token = localStorage.getItem('aios_access_token');
      if (!token) return;
      const res = await fetch(`/api/v1/workspaces?organization_id=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ workspaces: data, currentWorkspace: data[0] || null });
      }
    } catch (e) {
      console.error('Fetch workspaces error:', e);
    }
  }
}));
