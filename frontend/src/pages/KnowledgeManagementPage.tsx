import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  CheckCircle2,
  Loader2,
  RefreshCw,
  FileText,
  Layers,
  Network,
  GitBranch,
  MessageSquare,
  Folder,
  BookOpen,
  Search,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useNotificationStore } from '../store/useNotificationStore';

export interface ConnectorItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  status: 'Connected ✓' | 'Syncing...' | 'Indexed' | 'Ready' | 'Disconnected';
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  lastSync: string;
  itemsCount: string;
}

export interface KnowledgeDocumentItem {
  id: string;
  filename: string;
  source: 'GitHub' | 'Slack' | 'Google Drive' | 'Notion' | 'Confluence' | 'PDF File';
  category: string;
  chunk_count: number;
  embeddings_count: number;
  graph_nodes: number;
  lastSync: string;
  status: 'INDEXED' | 'SYNCING' | 'READY';
}

const INITIAL_CONNECTORS: ConnectorItem[] = [
  {
    id: 'github',
    name: 'GitHub',
    category: 'Code Repositories',
    icon: '🐱',
    status: 'Connected ✓',
    color: '#34d399',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    lastSync: '5 mins ago',
    itemsCount: '48 Repositories',
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Team Messaging & Logs',
    icon: '💬',
    status: 'Connected ✓',
    color: '#34d399',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    lastSync: '12 mins ago',
    itemsCount: '34 Channels',
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    category: 'Document Storage',
    icon: '📁',
    status: 'Syncing...',
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    lastSync: 'Syncing live…',
    itemsCount: '42 Files',
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Knowledge Workspaces',
    icon: '📝',
    status: 'Indexed',
    color: '#60a5fa',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-400',
    lastSync: '1 hour ago',
    itemsCount: '18 Workspaces',
  },
  {
    id: 'confluence',
    name: 'Confluence',
    category: 'Enterprise Wiki',
    icon: '📘',
    status: 'Ready',
    color: '#2dd4bf',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/40',
    textColor: 'text-teal-400',
    lastSync: '2 hours ago',
    itemsCount: '10 Spaces',
  },
];

const INITIAL_DOCUMENTS: KnowledgeDocumentItem[] = [
  {
    id: 'doc-1',
    filename: 'aios-core/agent-orchestrator.py',
    source: 'GitHub',
    category: 'Source Code',
    chunk_count: 32,
    embeddings_count: 1024,
    graph_nodes: 240,
    lastSync: '10 mins ago',
    status: 'INDEXED',
  },
  {
    id: 'doc-2',
    filename: '#compliance-audit-stream',
    source: 'Slack',
    category: 'Channel Logs',
    chunk_count: 64,
    embeddings_count: 2048,
    graph_nodes: 512,
    lastSync: '15 mins ago',
    status: 'INDEXED',
  },
  {
    id: 'doc-3',
    filename: 'Q3_Financial_Compliance_Report.pdf',
    source: 'Google Drive',
    category: 'Financial Filings',
    chunk_count: 128,
    embeddings_count: 4096,
    graph_nodes: 1280,
    lastSync: 'Syncing…',
    status: 'SYNCING',
  },
  {
    id: 'doc-4',
    filename: 'Multi-Agent LangGraph Architecture Specs',
    source: 'Notion',
    category: 'System Architecture',
    chunk_count: 42,
    embeddings_count: 1344,
    graph_nodes: 380,
    lastSync: '1 hour ago',
    status: 'INDEXED',
  },
  {
    id: 'doc-5',
    filename: 'SOC-2 Type II Control Verification Matrix',
    source: 'Confluence',
    category: 'Security Standard',
    chunk_count: 85,
    embeddings_count: 2720,
    graph_nodes: 940,
    lastSync: '2 hours ago',
    status: 'READY',
  },
];

export const KnowledgeManagementPage: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorItem[]>(INITIAL_CONNECTORS);
  const [documents, setDocuments] = useState<KnowledgeDocumentItem[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  const [newConnectorName, setNewConnectorName] = useState<string>('');
  const [newConnectorType, setNewConnectorType] = useState<string>('Jira Enterprise');

  const addNotification = useNotificationStore((state) => state.addNotification);

  // Trigger manual connector re-sync
  const handleSyncConnector = (id: string, name: string) => {
    setSyncingId(id);
    addNotification({
      type: 'knowledge',
      title: 'Connector Sync Dispatched',
      description: `Synchronizing delta changes for ${name}...`,
    });

    setTimeout(() => {
      setConnectors(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status: 'Connected ✓',
            lastSync: 'Just now',
          };
        }
        return c;
      }));
      setSyncingId(null);
      addNotification({
        type: 'knowledge',
        title: 'Connector Synced',
        description: `Successfully indexed latest updates for ${name}.`,
      });
    }, 1500);
  };

  // Connect new enterprise connector
  const handleConnectNewSource = () => {
    if (!newConnectorName.trim()) return;
    const newId = `conn-${Date.now()}`;
    const newConn: ConnectorItem = {
      id: newId,
      name: newConnectorName,
      category: 'Enterprise Integration',
      icon: '🔌',
      status: 'Connected ✓',
      color: '#34d399',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-400',
      lastSync: 'Just now',
      itemsCount: '12 Resources',
    };
    setConnectors(prev => [...prev, newConn]);
    setConnectModalOpen(false);
    setNewConnectorName('');
    addNotification({
      type: 'knowledge',
      title: 'New Data Source Connected',
      description: `Connected ${newConnectorName} to Knowledge Base index.`,
    });
  };

  const filteredDocs = documents.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return d.filename.toLowerCase().includes(q) || d.source.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Database className="w-8 h-8 text-primary animate-pulse" />
            <span>Enterprise Knowledge Base & Data Connectors</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Unified multi-source ingestion across GitHub, Slack, Google Drive, Notion, and Confluence into Qdrant vector index and Neo4j knowledge graph.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setConnectModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Data Source</span>
          </button>
        </div>
      </div>

      {/* ── 3 Core Stat Cards (Documents: 152 | Embeddings: 41,920 | Graph Nodes: 12,442) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Documents: 152 */}
        <div className="glass-card p-6 rounded-2xl border border-border/60 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Total Documents</div>
            <div className="text-3xl md:text-4xl font-extrabold text-foreground font-mono tracking-tight">152</div>
            <div className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Across 5 Connected Sources</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
        </div>

        {/* Embeddings: 41,920 */}
        <div className="glass-card p-6 rounded-2xl border border-border/60 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Qdrant Vector Embeddings</div>
            <div className="text-3xl md:text-4xl font-extrabold text-primary font-mono tracking-tight">41,920</div>
            <div className="text-[11px] text-primary font-mono flex items-center space-x-1 pt-1">
              <Layers className="w-3.5 h-3.5" />
              <span>1536-dim HNSW Vector Store</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/30 group-hover:scale-110 transition-transform">
            <Layers className="w-8 h-8" />
          </div>
        </div>

        {/* Graph Nodes: 12,442 */}
        <div className="glass-card p-6 rounded-2xl border border-border/60 flex items-center justify-between shadow-xl relative overflow-hidden group">
          <div className="space-y-1 z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">Neo4j Graph Nodes</div>
            <div className="text-3xl md:text-4xl font-extrabold text-purple-400 font-mono tracking-tight">12,442</div>
            <div className="text-[11px] text-purple-400 font-mono flex items-center space-x-1 pt-1">
              <Network className="w-3.5 h-3.5" />
              <span>3-Hop Entity Traversal Graph</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
            <Network className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* ── Enterprise Data Connectors Grid (GitHub, Slack, Google Drive, Notion, Confluence) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span>Active Enterprise Integrations & Connectors ({connectors.length})</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Real-Time Ingestion Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {connectors.map((c) => {
            const isSyncing = c.id === syncingId || c.status === 'Syncing...';
            return (
              <div
                key={c.id}
                className={`glass-card p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between hover:scale-[1.02] ${c.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{c.icon}</div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${c.bgColor} ${c.textColor} ${c.borderColor} flex items-center space-x-1`}>
                    {isSyncing && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>{c.status}</span>
                  </span>
                </div>

                <div>
                  <div className="text-base font-bold text-foreground">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{c.category}</div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40 text-[10px] font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Indexed Resources:</span>
                    <span className="text-foreground font-bold">{c.itemsCount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Last Sync:</span>
                    <span className={isSyncing ? 'text-amber-400 font-bold' : 'text-gray-300'}>{c.lastSync}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSyncConnector(c.id, c.name)}
                  disabled={isSyncing}
                  className="w-full py-2 rounded-xl bg-muted/40 hover:bg-muted border border-border/60 text-xs font-semibold text-gray-200 hover:text-white flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-primary'}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Knowledge Document Repositories Table ── */}
      <div className="glass-card p-6 rounded-2xl border border-border/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold text-foreground">Indexed Knowledge Repositories</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search indexed repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                <th className="pb-3">Repository / Document</th>
                <th className="pb-3">Source Connector</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Chunks</th>
                <th className="pb-3">Vector Embeddings</th>
                <th className="pb-3">Graph Nodes</th>
                <th className="pb-3">Last Synced</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 font-bold text-foreground">{doc.filename}</td>
                  <td className="py-3 text-primary">{doc.source}</td>
                  <td className="py-3 text-muted-foreground">{doc.category}</td>
                  <td className="py-3 text-gray-200">{doc.chunk_count}</td>
                  <td className="py-3 text-blue-400 font-bold">{doc.embeddings_count.toLocaleString()}</td>
                  <td className="py-3 text-purple-400 font-bold">{doc.graph_nodes.toLocaleString()}</td>
                  <td className="py-3 text-muted-foreground">{doc.lastSync}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      doc.status === 'INDEXED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      doc.status === 'SYNCING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
                      'bg-teal-500/10 text-teal-400 border-teal-500/30'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Connect New Data Source Modal ── */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-border/60 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Plus className="w-5 h-5 text-primary" />
                <span>Connect New Enterprise Data Source</span>
              </h3>
              <X className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-white" onClick={() => setConnectModalOpen(false)} />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Integration Name</label>
                <input
                  type="text"
                  autoFocus
                  value={newConnectorName}
                  onChange={(e) => setNewConnectorName(e.target.value)}
                  placeholder="e.g. Jira Security Board"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Connector Type</label>
                <select
                  value={newConnectorType}
                  onChange={(e) => setNewConnectorType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none text-foreground"
                >
                  <option value="Jira Enterprise">Jira Enterprise</option>
                  <option value="Zendesk Support">Zendesk Support</option>
                  <option value="Salesforce CRM">Salesforce CRM</option>
                  <option value="Box Storage">Box Storage</option>
                  <option value="PostgreSQL DB">PostgreSQL DB</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button onClick={() => setConnectModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border/60 text-xs font-semibold hover:bg-muted">Cancel</button>
              <button
                onClick={handleConnectNewSource}
                disabled={!newConnectorName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-40"
              >
                Connect Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
