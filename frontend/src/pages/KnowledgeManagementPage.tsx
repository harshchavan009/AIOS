import React, { useState } from 'react';
import {
  Database,
  FileText,
  Globe,
  Share2,
  CheckCircle2,
  RefreshCw,
  Plus,
  Layers,
  Search,
  Network,
  Cpu
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface KnowledgeConnector {
  id: string;
  name: string;
  type: 'Slack' | 'Notion' | 'Google Drive' | 'Git Repo' | 'PostgreSQL';
  status: 'active' | 'syncing' | 'paused';
  documents: number;
  lastSync: string;
}

const CONNECTORS: KnowledgeConnector[] = [
  { id: 'c-1', name: 'Enterprise Engineering Notion Space', type: 'Notion', status: 'active', documents: 1420, lastSync: '5 mins ago' },
  { id: 'c-2', name: 'Compliance & Legal Slack Archive', type: 'Slack', status: 'active', documents: 8920, lastSync: '1 min ago' },
  { id: 'c-3', name: 'AIOS Master GitHub Codebase', type: 'Git Repo', status: 'active', documents: 3120, lastSync: '12 mins ago' },
  { id: 'c-4', name: 'SOC-2 Audit Google Drive Vault', type: 'Google Drive', status: 'active', documents: 540, lastSync: '1 hour ago' }
];

export const KnowledgeManagementPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Enterprise Knowledge Management</h1>
          <p className="text-muted-foreground text-sm">
            Unified data ingestion across Notion, Slack, Google Drive, Git Repos, Qdrant vector index, and Neo4j knowledge graph.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all">
            <Plus className="w-4 h-4" />
            <span>Connect Data Source</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {CONNECTORS.map((c) => (
          <div key={c.id} className="glass-card glass-card-hover p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Database className="w-5 h-5" />
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>
            <div>
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{c.type}</div>
            </div>
            <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>{c.documents.toLocaleString()} docs</span>
              <span>Synced {c.lastSync}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
