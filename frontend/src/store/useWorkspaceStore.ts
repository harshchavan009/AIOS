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
  setWorkspace: (ws: Workspace | null) => void;
  fetchOrganizations: () => Promise<void>;
  fetchWorkspaces: (orgId?: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  organizations: [],
  workspaces: [],
  currentOrganization: null,
  currentWorkspace: null,

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
        if (Array.isArray(data) && data.length > 0) {
          set({ organizations: data, currentOrganization: data[0] });
          get().fetchWorkspaces(data[0].id);
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
      const url = orgId ? `/api/v1/workspaces?organization_id=${orgId}` : '/api/v1/workspaces';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        set({ workspaces: list, currentWorkspace: list[0] || null });
      }
    } catch (e) {
      console.error('Fetch workspaces error:', e);
    }
  }
}));
