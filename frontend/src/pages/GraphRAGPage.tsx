import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  FileText,
  Search,
  CheckCircle2,
  Loader2,
  Network,
  Database,
  Cpu,
  Sparkles,
  RotateCcw,
  BookOpen,
  Link2,
  Layers,
  FileUp,
  Zap,
  Eye,
  Copy,
  Users,
  Building2,
  Calendar,
  GitCommit,
  Check,
  Play,
  Share2,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageLayout } from '../components/layouts/PageLayout';

// ── Types ─────────────────────────────────────────────────────────────────────
export type PipelineStepId = 'UPLOAD' | 'OCR' | 'CHUNK' | 'EMBEDDING' | 'NEO4J' | 'QDRANT' | 'SEARCH' | 'ANSWER' | 'CITATION';
export type StepStatus = 'pending' | 'running' | 'done' | 'error';

export interface PipelineStepState {
  status: StepStatus;
  detail: string;
}

export interface ExtractedEntities {
  people: { name: string; role: string }[];
  companies: { name: string; industry: string }[];
  dates: { date: string; event: string }[];
  relationships: { source: string; relation: string; target: string }[];
}

export interface IndexedDoc {
  filename: string;
  chunk_count: number;
  neo4j_entities: number;
  neo4j_relations: number;
  file_size_kb: number;
  word_count: number;
  entities: ExtractedEntities;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'people' | 'company' | 'date' | 'concept';
  connections: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface Citation {
  citation_id: string;
  source: string;
  chunk_id: string;
  score: number;
  snippet: string;
}

export interface QueryResult {
  answer: string;
  citations: Citation[];
  top_nodes: GraphNode[];
  top_relations: GraphEdge[];
  vector_matches: number;
  graph_entities: string[];
  latency_ms: number;
}

// ── 9-Stage Pipeline Config: Upload → OCR → Chunk → Embedding → Neo4j → Qdrant → Search → Answer → Citation ──
const PIPELINE_STEPS: { id: PipelineStepId; label: string; icon: React.ReactNode; desc: string; color: string; progressTarget: number }[] = [
  { id: 'UPLOAD',    label: '1. Ingest Payload',   icon: <Upload className="w-4 h-4 text-sky-400" />,     desc: 'Receiving File / GitHub Repo Payload', color: '#38bdf8', progressTarget: 11 },
  { id: 'OCR',       label: '2. OCR Extract',      icon: <FileText className="w-4 h-4 text-amber-400" />,  desc: 'Optical character & layout extraction', color: '#f59e0b', progressTarget: 22 },
  { id: 'CHUNK',     label: '3. Semantic Chunk',   icon: <Layers className="w-4 h-4 text-purple-400" />,   desc: '512-token overlap windowing',         color: '#a78bfa', progressTarget: 33 },
  { id: 'EMBEDDING', label: '4. 1536d Embed',      icon: <Cpu className="w-4 h-4 text-blue-400" />,       desc: 'text-embedding-3-small vectors',     color: '#60a5fa', progressTarget: 44 },
  { id: 'NEO4J',     label: '5. Neo4j Graph',      icon: <Network className="w-4 h-4 text-emerald-400" />, desc: 'Extracting entity & relationship triples', color: '#34d399', progressTarget: 55 },
  { id: 'QDRANT',    label: '6. Qdrant HNSW',      icon: <Database className="w-4 h-4 text-pink-400" />,  desc: 'Upserting to HNSW vector collection',color: '#f472b6', progressTarget: 66 },
  { id: 'SEARCH',    label: '7. Hybrid Search',    icon: <Search className="w-4 h-4 text-indigo-400" />,  desc: 'Cosine similarity + 3-hop traversal', color: '#818cf8', progressTarget: 77 },
  { id: 'ANSWER',    label: '8. LLM Synthesis',    icon: <Sparkles className="w-4 h-4 text-yellow-400" />, desc: 'Synthesizing multi-model response', color: '#facc15', progressTarget: 88 },
  { id: 'CITATION',  label: '9. Grounded Citations',icon:<CheckCircle2 className="w-4 h-4 text-teal-400" />,desc:'Precision snippet citation extraction',color: '#2dd4bf', progressTarget: 100 },
];

const INITIAL_NODES: GraphNode[] = [];
const INITIAL_EDGES: GraphEdge[] = [];

export const GraphRAGPage: React.FC = () => {
  // Upload & Pipeline State
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeStepId, setActiveStepId] = useState<PipelineStepId>('UPLOAD');
  
  const [stepStates, setStepStates] = useState<Record<PipelineStepId, PipelineStepState>>(
    Object.fromEntries(PIPELINE_STEPS.map(s => [s.id, { status: 'pending', detail: '' }])) as Record<PipelineStepId, PipelineStepState>
  );

  // Indexed Document & Extracted Entities State
  const [indexedDocs, setIndexedDocs] = useState<IndexedDoc[]>([]);
  const [lastIndexed, setLastIndexed] = useState<IndexedDoc | null>(null);
  const [entities, setEntities] = useState<ExtractedEntities | null>(null);

  // Graph Canvas State
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<'all' | 'people' | 'company' | 'date'>('all');

  // Search & Query State
  const [queryInput, setQueryInput] = useState('Summarize the indexed knowledge base');
  const [isSearching, setIsSearching] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [answerDone, setAnswerDone] = useState(false);
  const [, setActiveTab] = useState<'answer' | 'entities' | 'sources'>('answer');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGraphAndDocs = useCallback(async () => {
    const token = localStorage.getItem('aios_access_token');
    const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    try {
      const gRes = await fetch('/api/v1/rag/graph', { headers });
      if (gRes.ok) {
        const data = await gRes.json();
        if (data && data.nodes) {
          const apiNodes: GraphNode[] = data.nodes.map((n: any, idx: number) => ({
            id: n.id || `node-${idx}`,
            label: n.label || n.id,
            type: (n.type === 'document_chunk' ? 'concept' : n.type) || 'concept',
            connections: (data.edges || []).filter((e: any) => e.source === n.id || e.target === n.id).length || 1,
            x: 80 + (idx % 4) * 160 + (idx * 20) % 50,
            y: 70 + Math.floor(idx / 4) * 140 + (idx * 15) % 40,
          }));
          const apiEdges: GraphEdge[] = (data.edges || []).map((e: any) => ({
            source: e.source,
            target: e.target,
            relation: e.relation || 'MENTIONS',
          }));
          setGraphNodes(apiNodes);
          setGraphEdges(apiEdges);
        }
      }
    } catch {}

    try {
      const dRes = await fetch('/api/v1/rag/documents', { headers });
      if (dRes.ok) {
        const data = await dRes.json();
        if (data && data.documents) {
          const docs: IndexedDoc[] = data.documents.map((d: any) => ({
            filename: d.filename || d.name,
            file_size_kb: d.file_size_kb || 0,
            word_count: d.word_count || 0,
            chunk_count: d.chunk_count || 0,
            neo4j_entities: d.entities_extracted || 0,
            neo4j_relations: d.relations_extracted || 0,
            entities: { people: [], companies: [], dates: [], relationships: [] },
          }));
          setIndexedDocs(docs);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchGraphAndDocs();
  }, [fetchGraphAndDocs]);

  const [githubUrl, setGithubUrl] = useState('https://github.com/langchain-ai/langgraph');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingFile(file);
    setIsUploading(true);
    setProgressPercent(20);
    setActiveStepId('UPLOAD');
    setStepStates(prev => ({
      ...prev,
      UPLOAD: { status: 'running', detail: `Uploading ${file.name}...` }
    }));

    const token = localStorage.getItem('aios_access_token');
    const headers: Record<string, string> = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgressPercent(50);
      setActiveStepId('CHUNK');
      const res = await fetch('/api/v1/rag/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      setProgressPercent(100);
      setActiveStepId('CITATION');
      setStepStates(Object.fromEntries(PIPELINE_STEPS.map(s => [s.id, { status: 'done', detail: `${s.label}: Complete` }])) as Record<PipelineStepId, PipelineStepState>);

      const doc: IndexedDoc = {
        filename: data.filename || file.name,
        chunk_count: data.chunk_count || 1,
        neo4j_entities: data.neo4j_entities || 0,
        neo4j_relations: data.neo4j_relations || 0,
        file_size_kb: data.file_size_kb || Math.round((file.size / 1024) * 10) / 10,
        word_count: data.word_count || 0,
        entities: { people: [], companies: [], dates: [], relationships: [] },
      };
      setLastIndexed(doc);
      await fetchGraphAndDocs();
    } catch (err: any) {
      setStepStates(prev => ({
        ...prev,
        UPLOAD: { status: 'error', detail: err.message || 'Upload failed' }
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGitHubIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;
    setIsUploading(true);
    setProgressPercent(30);
    setActiveStepId('UPLOAD');

    const token = localStorage.getItem('aios_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch('/api/v1/rag/github', {
        method: 'POST',
        headers,
        body: JSON.stringify({ repo_url: githubUrl, branch: 'main' })
      });
      if (!res.ok) throw new Error('GitHub ingest failed');
      const data = await res.json();
      setProgressPercent(100);
      setActiveStepId('CITATION');
      setStepStates(Object.fromEntries(PIPELINE_STEPS.map(s => [s.id, { status: 'done', detail: `${s.label}: Complete` }])) as Record<PipelineStepId, PipelineStepState>);
      await fetchGraphAndDocs();
    } catch (err: any) {
      setStepStates(prev => ({
        ...prev,
        UPLOAD: { status: 'error', detail: err.message || 'Ingestion failed' }
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // Run Hybrid Graph RAG Query
  const runQuery = useCallback(async () => {
    if (!queryInput.trim() || isSearching) return;
    setIsSearching(true);
    setQueryResult(null);
    setStreamingAnswer('');
    setAnswerDone(false);
    setActiveTab('answer');

    const token = localStorage.getItem('aios_access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
      const res = await fetch('/api/v1/rag/query', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: queryInput, top_k: 5 }),
      });

      if (!res.ok) {
        throw new Error(`Query failed with status ${res.status}`);
      }

      const data = await res.json();
      setQueryResult({
        answer: data.answer || 'No response returned.',
        citations: data.citations || [],
        top_nodes: data.top_nodes || [],
        top_relations: data.top_relations || [],
        vector_matches: data.vector_matches || 0,
        graph_entities: data.graph_entities || [],
        latency_ms: data.latency_ms || 0,
      });

      const ans = data.answer || 'No context found.';
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < ans.length) {
          setStreamingAnswer(prev => prev + ans.slice(idx, idx + 8));
          idx += 8;
        } else {
          clearInterval(interval);
          setAnswerDone(true);
        }
      }, 15);
    } catch (err: any) {
      setStreamingAnswer(`Error running query: ${err.message || 'Failed to retrieve results'}`);
      setAnswerDone(true);
    } finally {
      setIsSearching(false);
    }
  }, [queryInput, isSearching]);

  // Generate ASCII Progress Bar: █████████ 92%
  const renderProgressBar = (percent: number) => {
    const totalBlocks = 20;
    const filledBlocks = Math.round((percent / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const asciiBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    return `${asciiBar} ${percent}%`;
  };

  const filteredNodes = graphNodes.filter(n => {
    if (selectedEntityFilter === 'all') return true;
    return n.type === selectedEntityFilter;
  });

  const headerActions = (
    <div className="flex items-center space-x-2">
      <Badge variant="success" dot>Neo4j Connected</Badge>
      <Badge variant="info" dot>Qdrant Active</Badge>
    </div>
  );

  return (
    <PageLayout
      title="Graph RAG"
      description="Hybrid semantic retrieval combining vector similarity search with Neo4j entity graph traversal."
      actions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT: 7-Step Ingestion Pipeline & Progress Bar ────────────────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Upload Drop Zone & GitHub Repo Ingester */}
          <div className="glass-card p-5 rounded-2xl space-y-4 border border-border/60">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-6 px-6 text-center space-y-2 ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
                  : isUploading
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-border/60 bg-white/5 hover:border-blue-500/50 hover:bg-white/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.csv,.md"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isUploading ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-blue-400" />
                )}
              </div>

              <div>
                <div className="font-bold text-sm text-foreground">
                  {isUploading ? `Processing ${uploadingFile?.name || 'Payload'}…` : 'Upload Documents (PDF, DOCX, TXT, MD)'}
                </div>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  OCR, Semantic Chunking, 1536d Vectors, & Neo4j Entities
                </div>
              </div>
            </div>

            {/* GitHub Repository URL Ingestion Form */}
            <form onSubmit={handleGitHubIngest} className="pt-2 border-t border-white/10 space-y-2">
              <div className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>Or Index GitHub Repository:</span>
                <span className="text-blue-400 font-bold">Git Ingester</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-foreground focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono transition-all shadow-md shadow-blue-500/20"
                >
                  Clone & Index
                </button>
              </div>
            </form>
          </div>

          {/* 9-Step Ingestion Pipeline Steps Card */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>9-Stage Indexing Pipeline</span>
              </span>
              {isUploading && (
                <span className="text-xs font-mono text-amber-400 font-bold animate-pulse">Processing...</span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 p-3 rounded-lg bg-surface border border-border">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Indexing Progress:</span>
                <span className="text-accent font-bold">{progressPercent}%</span>
              </div>
              <div className="font-mono text-xs text-accent tracking-widest break-all select-none">
                {renderProgressBar(progressPercent)}
              </div>
              <div className="w-full h-1.5 rounded-full bg-elevated overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Step-by-Step List */}
            <div className="space-y-2">
              {PIPELINE_STEPS.map((step) => {
                const state = stepStates[step.id];
                const isRunning = state.status === 'running';
                const isDone = state.status === 'done';

                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isRunning
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : isDone
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-border/30 bg-muted/10 opacity-70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-lg bg-black/40">
                        {step.icon}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isRunning ? 'text-amber-400' : isDone ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                          {step.label}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground/60">{step.desc}</div>
                      </div>
                    </div>

                    <div>
                      {isRunning && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {state.status === 'pending' && <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extracted Entities Card (People, Companies, Dates, Relationships) */}
          {entities && (
            <div className="glass-card p-5 rounded-2xl space-y-4 animate-fade-in border border-emerald-500/40">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                  <GitCommit className="w-4 h-4" />
                  <span>Extracted Entity Knowledge Graph</span>
                </span>
                <Badge variant="success">Indexing Done ✓</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* People */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                  <div className="font-bold text-blue-400 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>People ({entities.people.length})</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {entities.people.map((p, i) => (
                      <div key={i} className="flex justify-between text-gray-200">
                        <span>{p.name}</span>
                        <span className="text-[9px] text-muted-foreground">{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Companies ({entities.companies.length})</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {entities.companies.map((c, i) => (
                      <div key={i} className="flex justify-between text-gray-200">
                        <span>{c.name}</span>
                        <span className="text-[9px] text-muted-foreground">{c.industry}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Dates ({entities.dates.length})</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {entities.dates.map((d, i) => (
                      <div key={i} className="flex justify-between text-gray-200">
                        <span>{d.date}</span>
                        <span className="text-[9px] text-muted-foreground">{d.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relationships */}
                <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                  <div className="font-bold text-purple-400 flex items-center space-x-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Relationships ({entities.relationships.length})</span>
                  </div>
                  <div className="space-y-1 font-mono text-[10px]">
                    {entities.relationships.map((r, i) => (
                      <div key={i} className="truncate text-gray-300">
                        <span className="text-blue-300">{r.source}</span> → <span className="text-purple-300 font-bold">{r.relation}</span> → <span className="text-emerald-300">{r.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Interactive Knowledge Graph Visualizer & Hybrid RAG ─────── */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Visual Graph View Canvas */}
          <div className="glass-card p-5 rounded-2xl space-y-4 border border-border/60">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Interactive Knowledge Graph Topology</span>
              </div>

              {/* Entity Filter Pills */}
              <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-border/60 text-[10px] font-mono">
                {(['all', 'people', 'company', 'date'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedEntityFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                      selectedEntityFilter === filter ? 'bg-primary text-white font-bold' : 'text-muted-foreground hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual SVG Knowledge Graph Canvas */}
            <div className="relative w-full h-[320px] rounded-xl bg-[#07090e] border border-border/60 overflow-hidden flex items-center justify-center">
              {filteredNodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground z-10">
                  <Network className="w-8 h-8 mb-2 opacity-40 text-primary" />
                  <p className="text-xs font-mono font-medium">No knowledge graph nodes available yet.</p>
                  <p className="text-[11px] font-mono text-muted-foreground/70 mt-1">
                    Upload documents or index a repository to extract entities and topology.
                  </p>
                </div>
              ) : (
                <svg className="w-full h-full absolute inset-0">
                  {/* Draw Graph Edges */}
                  {graphEdges.map((edge, i) => {
                    const srcNode = graphNodes.find(n => n.label === edge.source) || graphNodes[i % graphNodes.length];
                    const tgtNode = graphNodes.find(n => n.label === edge.target) || graphNodes[(i + 1) % graphNodes.length];
                    if (!srcNode || !tgtNode) return null;
                    const sx = srcNode.x || 150;
                    const sy = srcNode.y || 100;
                    const tx = tgtNode.x || 300;
                    const ty = tgtNode.y || 200;
                    const mx = (sx + tx) / 2;
                    const my = (sy + ty) / 2;

                    return (
                      <g key={i}>
                        <line
                          x1={sx}
                          y1={sy}
                          x2={tx}
                          y2={ty}
                          stroke="#6366f1"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                          className="animate-pulse"
                        />
                        <rect x={mx - 32} y={my - 9} width="64" height="18" rx="4" fill="#090d16" stroke="#4f46e5" strokeWidth="0.8" />
                        <text x={mx} y={my + 3} textAnchor="middle" fill="#a5b4fc" fontSize="8" fontFamily="monospace" fontWeight="bold">
                          {edge.relation}
                        </text>
                      </g>
                    );
                  })}

                  {/* Draw Graph Nodes */}
                  {filteredNodes.map((node) => {
                    const nx = node.x || 200;
                    const ny = node.y || 150;
                    const isCompany = node.type === 'company';
                    const isPeople = node.type === 'people';
                    const isDate = node.type === 'date';

                    const fillColor = isCompany ? '#34d399' : isPeople ? '#38bdf8' : isDate ? '#f59e0b' : '#a78bfa';
                    const bgColor = isCompany ? '#0a1f18' : isPeople ? '#061325' : isDate ? '#1e1500' : '#170d2e';

                    return (
                      <g key={node.id} className="cursor-pointer hover:opacity-90 transition-opacity">
                        <title>{`${node.label} (${node.type}) — ${node.connections} connections`}</title>
                        <circle cx={nx} cy={ny} r="26" fill={bgColor} stroke={fillColor} strokeWidth="1.5" />
                        <text x={nx} y={ny - 2} textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="sans-serif" fontWeight="600">
                          {node.label.length > 10 ? node.label.slice(0, 9) + '…' : node.label}
                        </text>
                        <text x={nx} y={ny + 9} textAnchor="middle" fill={fillColor} fontSize="8" fontFamily="monospace">
                          {node.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Clean Legend */}
            <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] font-mono text-muted-foreground">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] inline-block" />
                  <span>Company</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] inline-block" />
                  <span>Person</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block" />
                  <span>Date</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a78bfa] inline-block" />
                  <span>Concept</span>
                </span>
              </div>
              <span>{filteredNodes.length} Nodes · {graphEdges.length} Relations</span>
            </div>
          </div>

          {/* Hybrid Graph RAG Query & Answer Panel */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                <Search className="w-4 h-4 text-primary" />
                <span>Hybrid Graph RAG Search Query</span>
              </span>
              <Badge variant="info">Neo4j + Qdrant Dual Join</Badge>
            </div>

            <textarea
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-md bg-surface border border-border text-xs font-mono focus:outline-none focus:border-accent text-foreground resize-none"
            />

            <Button
              variant="primary"
              onClick={runQuery}
              disabled={isSearching || !queryInput.trim()}
              isLoading={isSearching}
              className="w-full"
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {isSearching ? 'Traversing Graph Knowledge…' : 'Run Hybrid Graph RAG Search'}
            </Button>
          </div>

          {/* Answer Output Window */}
          {streamingAnswer && (
            <div className="glass-card p-5 rounded-2xl space-y-3 animate-fade-in border border-border/60">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Synthesized Knowledge Answer</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{queryResult?.latency_ms !== undefined ? `Latency: ${queryResult.latency_ms}ms` : 'Latency: --'}</span>
              </div>

              <div className="p-4 rounded-xl bg-[#080c14] border border-border/60 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                {streamingAnswer}
                {!answerDone && <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse font-bold">▌</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
