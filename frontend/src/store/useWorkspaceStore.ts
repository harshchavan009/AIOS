import { create } from 'zustand';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface WorkspaceResources {
  prompts: number;
  documents: number;
  agents: number;
  settings: {
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
    id: 'ws-a',
    organization_id: 'org-acme',
    name: 'Workspace A',
    slug: 'workspace-a',
    resources: {
      prompts: 14,
      documents: 42,
      agents: 6,
      settings: { environment: 'Production', llmProvider: 'OpenAI GPT-4o', region: 'us-east-1' },
    },
  },
  {
    id: 'ws-b',
    organization_id: 'org-acme',
    name: 'Workspace B',
    slug: 'workspace-b',
    resources: {
      prompts: 8,
      documents: 24,
      agents: 4,
      settings: { environment: 'Staging / QA', llmProvider: 'Claude 3.5 Sonnet', region: 'eu-west-1' },
    },
  },
  {
    id: 'ws-c',
    organization_id: 'org-acme',
    name: 'Workspace C',
    slug: 'workspace-c',
    resources: {
      prompts: 19,
      documents: 88,
      agents: 10,
      settings: { environment: 'SOC-2 Sandbox', llmProvider: 'Multi-LLM Mesh', region: 'us-west-2' },
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
