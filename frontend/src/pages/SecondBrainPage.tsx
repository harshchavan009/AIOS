import React from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  Database,
  CheckCircle2,
  Sparkles,
  Layers
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const SecondBrainPage: React.FC = () => {
  const DOCUMENTS = [
    { title: 'AIOS Enterprise Security Specifications.pdf', size: '2.4 MB', vectors: 1420, date: '2 mins ago' },
    { title: 'Graph RAG Neo4j Schema Guidelines.docx', size: '1.8 MB', vectors: 980, date: '1 hour ago' },
    { title: 'FastAPI Async Architecture Blueprint.pdf', size: '4.1 MB', vectors: 3120, date: 'Yesterday' },
  ];

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
        {DOCUMENTS.map((doc, idx) => (
          <Card key={idx} variant="glass" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <FileText className="w-6 h-6" />
              </div>
              <Badge variant="success">Indexed</Badge>
            </div>
            <div>
              <h3 className="text-sm font-bold truncate">{doc.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">Size: {doc.size} • {doc.date}</p>
            </div>
            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-mono text-indigo-400">
              <span>{doc.vectors} Vector Chunks</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
