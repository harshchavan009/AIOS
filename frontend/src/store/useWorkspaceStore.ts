import { create } from 'zustand';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
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
  { id: 'ws-prod', organization_id: 'org-acme', name: 'Production Agent Cluster', slug: 'production-cluster' },
  { id: 'ws-[#01]', organization_id: 'org-acme', name: 'SOC-2 Compliance Sandbox', slug: 'soc2-sandbox' }
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
