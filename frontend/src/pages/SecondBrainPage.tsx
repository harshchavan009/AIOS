import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface VaultDoc {
  filename: string;
  chunk_count: number;
  status: string;
}

export const SecondBrainPage: React.FC = () => {
  const [documents, setDocuments] = useState<VaultDoc[]>([]);

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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Second Brain & Document Vault</h1>
          <p className="text-muted-foreground text-sm">
            Semantic memory storage, document ingestion, and hybrid vector embedding indexer.
          </p>
        </div>
        <Button variant="gradient" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.length > 0 ? (
          documents.map((doc, idx) => (
            <Card key={idx} variant="glass" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <Badge variant="success">{doc.status.toUpperCase()}</Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold truncate">{doc.filename}</h3>
                <p className="text-xs text-muted-foreground mt-1">Indexed in Graph RAG Vector Store</p>
              </div>
              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono text-indigo-400">
                <span>{doc.chunk_count} Vector Chunks</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-3 glass-card p-8 rounded-2xl text-center text-muted-foreground text-sm">
            No documents in Second Brain vault. Upload documents in Graph RAG engine to populate your semantic memory vault.
          </div>
        )}
      </div>
    </div>
  );
};
