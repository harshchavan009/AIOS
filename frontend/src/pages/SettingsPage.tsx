import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Key,
  Database,
  Shield,
  Server,
  Building2,
  Users,
  Plus,
  Copy,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'org' | 'team' | 'api-keys' | 'audit'>('general');
  const { currentOrganization, currentWorkspace } = useWorkspaceStore();

  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'Production Agent Service', prefix: 'aios_pk_prod_9918', created: '2026-07-20' },
    { id: 'key-2', name: 'DevOps CI/CD Automation', prefix: 'aios_pk_cicd_4412', created: '2026-07-22' }
  ]);

  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) return;
    const rawKey = `aios_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(rawKey);
    setApiKeys([
      ...apiKeys,
      { id: `key-${Date.now()}`, name: newKeyName, prefix: rawKey.substring(0, 14), created: 'Just now' }
    ]);
    setNewKeyName('');
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Organization & Platform Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage multi-tenant organizations, team RBAC, programmatic API keys, and enterprise security audit logs.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex space-x-2 border-b border-border/60 pb-1 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'general', label: 'General & LLM Keys', icon: SlidersHorizontal },
          { id: 'org', label: 'Organization & Workspaces', icon: Building2 },
          { id: 'team', label: 'Team Members & RBAC', icon: Users },
          { id: 'api-keys', label: 'Programmatic API Keys', icon: Key },
          { id: 'audit', label: 'Security & Audit Logs', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Provider Keys */}
      {activeTab === 'general' && (
        <div className="space-y-6 max-w-4xl">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-border/60">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">LLM Model Provider Keys</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value="sk-proj-aios-enterprise-openai-key"
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Anthropic Claude API Key</label>
                <input
                  type="password"
                  value="sk-ant-aios-enterprise-claude-key"
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Organization & Workspaces */}
      {activeTab === 'org' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-base font-bold">{currentOrganization?.name || 'Acme Enterprise AI'}</h3>
                <p className="text-xs text-muted-foreground font-mono">Slug: {currentOrganization?.slug || 'acme-enterprise'}</p>
              </div>
            </div>
            <Badge variant="success">ENTERPRISE TIER</Badge>
          </div>

          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase font-mono">Workspaces in Organization</div>
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-foreground">{currentWorkspace?.name || 'Production Agent Cluster'}</div>
                <div className="text-[10px] text-muted-foreground font-mono">slug: {currentWorkspace?.slug || 'production-cluster'}</div>
              </div>
              <Badge variant="info">Active Workspace</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Team Members & RBAC */}
      {activeTab === 'team' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-base font-bold">Organization Team Members</h3>
            <button className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="space-y-2">
            {[
              { name: 'Senior AI Systems Engineer', email: 'engineer@aios.enterprise', role: 'Organization Owner' },
              { name: 'MLOps Lead', email: 'mlops@aios.enterprise', role: 'Admin' },
              { name: 'Security Auditor', email: 'auditor@aios.enterprise', role: 'Viewer' }
            ].map((m, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-foreground">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{m.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Programmatic API Keys */}
      {activeTab === 'api-keys' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-base font-bold">Programmatic Service API Keys</h3>
          </div>

          <div className="flex space-x-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key Description (e.g. 'CI/CD Deployment Key')"
              className="flex-1 px-4 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleGenerateApiKey}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Key</span>
            </button>
          </div>

          {generatedKey && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 space-y-1">
              <div>New API Secret Generated (Save this key, it won't be shown again):</div>
              <div className="font-bold text-white bg-black/40 p-2 rounded-lg break-all">{generatedKey}</div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            {apiKeys.map((k) => (
              <div key={k.id} className="p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="font-bold text-foreground">{k.name}</div>
                  <div className="text-[10px] text-muted-foreground">{k.prefix}...</div>
                </div>
                <Badge variant="success">ACTIVE</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-card p-6 rounded-2xl space-y-4 max-w-4xl">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-base font-bold">Enterprise Security Audit Logs</h3>
            <Badge variant="info">SOC-2 Audit Active</Badge>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-80 overflow-y-auto">
            {[
              { time: '11:04:12', action: 'USER_LOGIN', user: 'engineer@aios.enterprise', ip: '127.0.0.1' },
              { time: '11:02:40', action: 'API_KEY_CREATED', user: 'engineer@aios.enterprise', ip: '127.0.0.1' },
              { time: '10:58:19', action: 'AGENT_DISPATCH', user: 'engineer@aios.enterprise', ip: '127.0.0.1' }
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#090d16] border border-border/40 flex items-center justify-between text-gray-300">
                <span className="text-muted-foreground">[{log.time}]</span>
                <span className="text-primary font-bold">{log.action}</span>
                <span>{log.user}</span>
                <span className="text-emerald-400 font-mono">{log.ip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
