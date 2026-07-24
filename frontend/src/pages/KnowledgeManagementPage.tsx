import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface KnowledgeDoc {
  filename: string;
  chunk_count: number;
  status: string;
}

export const KnowledgeManagementPage: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem('aios_access_token');
        const res = await fetch('/api/v1/rag/documents', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch {
        // preserve state
      }
    };
    fetchDocs();
  }, []);

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
        {documents.length > 0 ? (
          documents.map((d, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Database className="w-5 h-5" />
                </div>
                <Badge variant="success">{d.status.toUpperCase()}</Badge>
              </div>
              <div>
                <div className="text-sm font-bold truncate">{d.filename}</div>
                <div className="text-xs text-muted-foreground font-mono">Qdrant Vector Store</div>
              </div>
              <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>{d.chunk_count} Chunks</span>
                <span>Live Index</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 glass-card p-8 rounded-2xl text-center text-muted-foreground text-sm space-y-2">
            <div>No knowledge documents indexed yet. Upload files in the Graph RAG page or connect data sources.</div>
          </div>
        )}
      </div>
    </div>
  );
};
