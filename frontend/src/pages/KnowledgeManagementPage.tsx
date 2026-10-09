import React, { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle2,
  FileText,
  Layers,
  Network,
  GitBranch,
  Search,
  ExternalLink,
  X,
} from 'lucide-react';
import { PageLayout } from '../components/layouts/PageLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNotificationStore } from '../store/useNotificationStore';

export interface ConnectorItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  status: 'Connected' | 'Available';
  lastSync: string;
}

export interface KnowledgeDocumentItem {
  id?: string;
  filename: string;
  source?: string;
  chunk_count: number;
  status: string;
}

const AVAILABLE_CONNECTORS: ConnectorItem[] = [
  { id: 'github', name: 'GitHub', category: 'Code Repositories', icon: '🐱', status: 'Available', lastSync: 'Manual trigger' },
  { id: 'slack', name: 'Slack', category: 'Team Channels', icon: '💬', status: 'Available', lastSync: 'Manual trigger' },
  { id: 'gdrive', name: 'Google Drive', category: 'Document Storage', icon: '📁', status: 'Available', lastSync: 'Manual trigger' },
  { id: 'notion', name: 'Notion', category: 'Workspaces', icon: '📝', status: 'Available', lastSync: 'Manual trigger' },
  { id: 'confluence', name: 'Confluence', category: 'Enterprise Wikis', icon: '📘', status: 'Available', lastSync: 'Manual trigger' },
];

export const KnowledgeManagementPage: React.FC = () => {
  const [connectors] = useState<ConnectorItem[]>(AVAILABLE_CONNECTORS);
  const [documents, setDocuments] = useState<KnowledgeDocumentItem[]>([]);
  const [graphNodeCount, setGraphNodeCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  const [newConnectorName, setNewConnectorName] = useState<string>('');
  const [newConnectorType, setNewConnectorType] = useState<string>('Jira Enterprise');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const fetchKnowledgeData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('aios_access_token');
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const [docsRes, graphRes] = await Promise.all([
        fetch('/api/v1/rag/documents', { headers }),
        fetch('/api/v1/rag/graph', { headers }),
      ]);

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.documents || []);
      }

      if (graphRes.ok) {
        const graphData = await graphRes.json();
        setGraphNodeCount(graphData.nodes?.length || 0);
      }
    } catch {
      // keep fallback empty
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  const totalDocuments = documents.length;
  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 1), 0);

  const filteredDocs = documents.filter((d) =>
    d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnectNewSource = () => {
    if (!newConnectorName.trim()) return;
    addNotification({
      type: 'knowledge',
      title: 'Connector Request Logged',
      description: `${newConnectorName} (${newConnectorType}) configured for future sync.`,
    });
    setConnectModalOpen(false);
    setNewConnectorName('');
  };

  return (
    <PageLayout
      title="Knowledge Management"
      description="Enterprise data pipelines, document vector embeddings, and Neo4j graph indices."
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setConnectModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Connect Source
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── 3 Real Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="surface-card p-5 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-muted">Total Documents</div>
            <div className="text-2xl sm:text-3xl font-semibold text-text font-mono">{totalDocuments}</div>
            <div className="text-[11px] text-muted font-mono flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              <span>{totalDocuments === 0 ? 'No documents ingested yet' : `${totalDocuments} indexed in vault`}</span>
            </div>
          </div>

          <div className="surface-card p-5 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-muted">Vector Embeddings</div>
            <div className="text-2xl sm:text-3xl font-semibold text-text font-mono">{totalChunks}</div>
            <div className="text-[11px] text-muted font-mono flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-accent" />
              <span>{totalChunks === 0 ? 'Empty vector collection' : `${totalChunks} chunks in vector index`}</span>
            </div>
          </div>

          <div className="surface-card p-5 space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-muted">Knowledge Graph Nodes</div>
            <div className="text-2xl sm:text-3xl font-semibold text-text font-mono">{graphNodeCount}</div>
            <div className="text-[11px] text-muted font-mono flex items-center space-x-1">
              <Network className="w-3.5 h-3.5 text-accent" />
              <span>{graphNodeCount === 0 ? 'Graph unpopulated' : `${graphNodeCount} entity nodes extracted`}</span>
            </div>
          </div>
        </div>

        {/* ── Connectors Grid ── */}
        <div className="surface-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-accent" />
              <span>Enterprise Data Integrations ({connectors.length})</span>
            </span>
            <span className="text-[11px] font-mono text-muted">Available Connectors</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {connectors.map((c) => (
              <div key={c.id} className="p-3.5 rounded bg-elevated border border-border flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{c.icon}</span>
                  <Badge variant="neutral">{c.status}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-text">{c.name}</h4>
                  <p className="text-[11px] text-muted">{c.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    addNotification({
                      type: 'knowledge',
                      title: 'Integration Setup',
                      description: `To connect ${c.name}, provide API credentials in Workspace Settings.`,
                    });
                  }}
                  className="w-full text-[10px]"
                >
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Document Table ── */}
        <div className="surface-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-text">Ingested Document Ledger</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded bg-elevated border border-border text-xs text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-lg space-y-2">
              <FileText className="w-8 h-8 text-muted mx-auto opacity-50" />
              <p className="text-xs font-medium text-text">No documents in knowledge index</p>
              <p className="text-[11px] text-muted">Upload PDF, Markdown, or text files in Second Brain or via API to populate your semantic index.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border text-muted text-[10px] uppercase">
                    <th className="pb-2.5">Document Name</th>
                    <th className="pb-2.5">Chunks</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDocs.map((doc, idx) => (
                    <tr key={idx} className="hover:bg-elevated/50 transition-colors">
                      <td className="py-2.5 font-medium text-text">{doc.filename}</td>
                      <td className="py-2.5 text-muted">{doc.chunk_count}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant="success">
                          {doc.status || 'INDEXED'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Connect Modal ── */}
        {connectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
            <div className="surface-card p-5 rounded-lg w-full max-w-md space-y-4 border border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text">Connect Data Source</h3>
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="p-1 rounded text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted">Integration Name</label>
                  <input
                    type="text"
                    value={newConnectorName}
                    onChange={(e) => setNewConnectorName(e.target.value)}
                    placeholder="e.g. Engineering Jira Backlog"
                    className="w-full px-3 py-1.5 rounded bg-elevated border border-border text-xs text-text focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted">Connector Type</label>
                  <select
                    value={newConnectorType}
                    onChange={(e) => setNewConnectorType(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-elevated border border-border text-xs text-text focus:outline-none focus:border-accent"
                  >
                    <option value="Jira Enterprise">Jira Enterprise</option>
                    <option value="Zendesk Support">Zendesk Support</option>
                    <option value="Salesforce CRM">Salesforce CRM</option>
                    <option value="Box Storage">Box Storage</option>
                    <option value="PostgreSQL DB">PostgreSQL DB</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setConnectModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!newConnectorName.trim()}
                  onClick={handleConnectNewSource}
                >
                  Save Integration
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
