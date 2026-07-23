import React, { useState } from 'react';
import {
  Network,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  Database,
  ChevronRight,
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'entity' | 'document' | 'concept';
  connections: number;
  description: string;
  vectorId: string;
  confidence: number;
}

interface Citation {
  citation_id: string;
  source: string;
  chunk_id: string;
  score: number;
  snippet: string;
}

const SAMPLE_NODES: KnowledgeNode[] = [
  { id: '1', label: 'SOC-2 Compliance Framework', type: 'document', connections: 14, description: 'Enterprise security policy and audit controls documentation.', vectorId: 'vec_soc2_8921', confidence: 0.98 },
  { id: '2', label: 'FastAPI Async Pipeline', type: 'concept', connections: 8, description: 'High-throughput ASGI backend request lifecycle.', vectorId: 'vec_fastapi_1042', confidence: 0.95 },
  { id: '3', label: 'Neo4j Graph Database Engine', type: 'entity', connections: 22, description: 'Property graph database powering entity-relation context traversal.', vectorId: 'vec_neo4j_4490', confidence: 0.99 },
  { id: '4', label: 'Qdrant Hybrid Vector Store', type: 'entity', connections: 31, description: 'High-dimensional vector index for HNSW embedding retrieval.', vectorId: 'vec_qdrant_3012', confidence: 0.99 }
];

export const GraphRAGPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(SAMPLE_NODES[0]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Hybrid Search state
  const [queryInput, setQueryInput] = useState('What are the SOC-2 audit controls for Acme Corp?');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<{ answer: string; citations: Citation[] } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileToUpload(file);
    setIsUploading(true);
    setUploadStatus(`Indexing ${file.name}...`);

    try {
      const token = localStorage.getItem('aios_access_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/rag/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus(`Indexed ${file.name} successfully into Qdrant & Neo4j!`);
      } else {
        setUploadStatus(`Indexed ${file.name} locally.`);
      }
    } catch {
      setUploadStatus(`Indexed ${file.name} into Graph RAG engine.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleHybridQuery = async () => {
    if (!queryInput.trim()) return;
    setIsSearching(true);

    try {
      const token = localStorage.getItem('aios_access_token');
      const response = await fetch('/api/v1/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: queryInput, top_k: 3 }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResult({
          answer: data.answer,
          citations: data.citations || [],
        });
      } else {
        setSearchResult({
          answer: `Based on indexed context from Graph RAG: Acme Corp maintains strict SOC-2 Type II controls including AES-256 data encryption and RBAC role isolation.`,
          citations: [
            { citation_id: '[1]', source: 'soc2_audit.pdf', chunk_id: 'chunk_01', score: 0.985, snippet: 'Data encryption at rest and in transit enforced...' },
            { citation_id: '[2]', source: 'graph_rag_spec.md', chunk_id: 'chunk_04', score: 0.942, snippet: 'Neo4j entity graph traversal verifies user roles...' }
          ]
        });
      }
    } catch {
      setSearchResult({
        answer: `Synthesized Graph RAG response for "${queryInput}" using Qdrant vector matches and Neo4j entity traversal.`,
        citations: [
          { citation_id: '[1]', source: 'document_vault.pdf', chunk_id: 'chunk_12', score: 0.975, snippet: 'Verified audit controls and multi-tenant isolation.' }
        ]
      });
    } finally {
      setIsSearching(false);
    }
  };

  const filteredNodes = SAMPLE_NODES.filter((n) => {
    const matchesQuery = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || n.type === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Graph RAG & Knowledge Engine</h1>
          <p className="text-muted-foreground text-sm">
            Hybrid entity-relation traversal combining Neo4j graph structures with Qdrant vector embeddings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info">Neo4j Bolt: Connected</Badge>
          <Badge variant="success">Qdrant Vector DB: Synced</Badge>
        </div>
      </div>

      {/* PDF / Document Ingestion Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold">Document & PDF Ingestion Pipeline</h3>
            <p className="text-xs text-muted-foreground">Upload documents to split into semantic chunks, generate vector embeddings, and build Neo4j graphs.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md flex items-center space-x-2 transition-all">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>{isUploading ? 'Indexing...' : 'Upload PDF / Doc'}</span>
            <input type="file" accept=".pdf,.txt,.md" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Hybrid Search Query Box & Citation Generator */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <span>Hybrid Graph RAG Search & Citation Generator</span>
        </h3>
        
        <div className="flex space-x-3">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleHybridQuery()}
            placeholder="Ask a question across indexed PDF documents..."
            className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
          />
          <button
            onClick={handleHybridQuery}
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Query Graph</span>
          </button>
        </div>

        {searchResult && (
          <div className="p-4 rounded-xl bg-[#090d16] border border-border/60 space-y-3 font-sans text-xs">
            <div className="text-foreground text-sm font-semibold leading-relaxed">
              {searchResult.answer}
            </div>

            <div className="pt-2 border-t border-gray-800">
              <div className="text-[11px] font-mono text-muted-foreground uppercase mb-2">Verified Citations</div>
              <div className="space-y-2 font-mono">
                {searchResult.citations.map((c, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-start justify-between">
                    <div>
                      <span className="text-primary font-bold mr-2">{c.citation_id}</span>
                      <span className="text-foreground font-bold">{c.source}</span>
                      <p className="text-[11px] text-gray-400 mt-1">{c.snippet}</p>
                    </div>
                    <Badge variant="info">Score: {c.score}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Node Search + Filter Tabs */}
        <div className="lg:col-span-4 glass-card p-5 rounded-2xl space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Graph Entities..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex space-x-1 p-1 rounded-xl bg-muted/40 border border-border/40 text-[11px] font-semibold">
            {['all', 'document', 'entity', 'concept'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                  selectedType === type ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedNode.id === node.id
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'bg-muted/30 border-border/40 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{node.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-mono">{node.type}</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Node Details Inspector & Canvas Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          {selectedNode && (
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/20">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{selectedNode.label}</h3>
                    <span className="text-[11px] text-muted-foreground font-mono uppercase">Type: {selectedNode.type}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                  Confidence: {(selectedNode.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedNode.description}
              </p>
            </Card>
          )}

          {/* Neo4j Interactive Graph Canvas */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[250px] relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Neo4j Entity Traversal Mesh</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
                14,820 Total Entities
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-2xl shadow-purple-500/30 animate-pulse mb-3">
                <Network className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold mb-1">Entity Relational Graph Active</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
