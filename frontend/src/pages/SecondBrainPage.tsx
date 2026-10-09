import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLayout } from '../components/layouts/PageLayout';
import { useNotificationStore } from '../store/useNotificationStore';

interface VaultDoc {
  filename: string;
  chunk_count: number;
  status: string;
}

export const SecondBrainPage: React.FC = () => {
  const [documents, setDocuments] = useState<VaultDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

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

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadTrigger = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt,.md,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const token = localStorage.getItem('aios_access_token');
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/v1/rag/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          addNotification({
            type: 'knowledge',
            title: 'Document Ingestion Complete',
            description: `${file.name} successfully indexed (${data.chunk_count || 1} chunks, ${data.file_size_kb || 0} KB).`,
          });
          await fetchDocs();
        } else {
          throw new Error('Upload rejected');
        }
      } catch {
        addNotification({
          type: 'agent_failed',
          title: 'Upload Failed',
          description: `Failed to index ${file.name}. Please ensure the backend service is running.`,
        });
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  const handleLoadSampleData = async () => {
    setIsUploading(true);
    try {
      const sampleContent = `# AIOS Architecture Overview\n\nAIOS is an autonomous agent operating system with LangGraph orchestration and hybrid Graph RAG.\nIt connects vector similarity embeddings with entity relationship graphs for deterministic context retrieval.\nCore features include isolated sandbox execution, model routing, and end-to-end telemetry.`;
      const blob = new Blob([sampleContent], { type: 'text/markdown' });
      const file = new File([blob], 'aios_architecture_overview.md', { type: 'text/markdown' });

      const token = localStorage.getItem('aios_access_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/rag/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        addNotification({
          type: 'knowledge',
          title: 'Sample Data Ingested',
          description: 'Loaded sample architecture document into vector store and knowledge graph.',
        });
        await fetchDocs();
      }
    } catch {
      // ignore
    } finally {
      setIsUploading(false);
    }
  };

  const headerActions = (
    <Button
      variant="primary"
      size="sm"
      isLoading={isUploading}
      onClick={handleUploadTrigger}
      leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
    >
      Upload Document
    </Button>
  );

  return (
    <PageLayout
      title="Second Brain"
      description="Semantic memory storage, document ingestion, and hybrid vector embedding indexer."
      actions={headerActions}
    >
      <div className="space-y-6">
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {documents.map((doc, idx) => (
              <Card key={idx} variant="default" className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-md bg-accent/15 text-accent">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="success">
                    {doc.status || 'Indexed'}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-foreground truncate">{doc.filename}</h3>
                  <p className="text-xs text-muted-foreground flex items-center space-x-1.5 mt-1 font-mono">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{doc.chunk_count} Chunks</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No documents ingested yet"
            description="Your memory vault is currently empty. Upload research papers, architecture specifications, or company manuals to build your semantic index."
            actionLabel={isUploading ? "Uploading..." : "Upload Document"}
            onAction={handleUploadTrigger}
            secondaryLabel="Load Sample Document"
            onSecondaryAction={handleLoadSampleData}
          />
        )}
      </div>
    </PageLayout>
  );
};
