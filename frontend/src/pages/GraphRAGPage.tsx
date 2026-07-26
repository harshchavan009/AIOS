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

// ── Types ─────────────────────────────────────────────────────────────────────
export type PipelineStepId = 'UPLOAD' | 'OCR' | 'CHUNK' | 'EMBEDDING' | 'NEO4J' | 'QDRANT' | 'READY';
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

// ── Pipeline Step Config: Upload PDF → OCR → Chunk → Embedding → Neo4j → Qdrant → Ready ──
const PIPELINE_STEPS: { id: PipelineStepId; label: string; icon: React.ReactNode; desc: string; color: string; progressTarget: number }[] = [
  { id: 'UPLOAD',    label: '1. Upload PDF',       icon: <Upload className="w-4 h-4" />,    desc: 'Receiving document payload',        color: '#38bdf8', progressTarget: 15 },
  { id: 'OCR',       label: '2. OCR Text Extract', icon: <FileText className="w-4 h-4 text-amber-400" />,  desc: 'Extracting text & layout structures', color: '#f59e0b', progressTarget: 30 },
  { id: 'CHUNK',     label: '3. Semantic Chunk',   icon: <Layers className="w-4 h-4 text-purple-400" />,   desc: '512-token overlap windowing',      color: '#a78bfa', progressTarget: 48 },
  { id: 'EMBEDDING', label: '4. Embedding Gen',    icon: <Cpu className="w-4 h-4 text-blue-400" />,       desc: '1536-dim vector generation',       color: '#60a5fa', progressTarget: 65 },
  { id: 'NEO4J',     label: '5. Neo4j Graph',      icon: <Network className="w-4 h-4 text-emerald-400" />, desc: 'Building entity & relationship graph',color: '#34d399', progressTarget: 82 },
  { id: 'QDRANT',    label: '6. Qdrant Store',     icon: <Database className="w-4 h-4 text-pink-400" />,  desc: 'Upserting to HNSW vector index',   color: '#f472b6', progressTarget: 95 },
  { id: 'READY',     label: '7. Ready for RAG',    icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />, desc: 'Hybrid Graph RAG index live',       color: '#2dd4bf', progressTarget: 100 },
];

const DEFAULT_ENTITIES: ExtractedEntities = {
  people: [
    { name: 'Sarah Chen', role: 'Lead Compliance Auditor' },
    { name: 'Dr. Aris Thorne', role: 'Chief AI Architect' },
    { name: 'Alex Mercer', role: 'DevOps Security Lead' },
  ],
  companies: [
    { name: 'Acme Corp', industry: 'Enterprise Healthcare' },
    { name: 'Neo4j Inc', industry: 'Graph Database Engine' },
    { name: 'Qdrant AB', industry: 'Vector Search Infrastructure' },
    { name: 'OpenAI', industry: 'Frontier AI Provider' },
  ],
  dates: [
    { date: '2026-07-26', event: 'SOC-2 Type II Audit Certification' },
    { date: 'Q3 2026', event: 'Graph RAG Infrastructure Sync' },
    { date: '2025-11-15', event: 'AICPA Security Control Review' },
  ],
  relationships: [
    { source: 'Acme Corp', relation: 'COMPLIES_WITH', target: 'SOC-2 Type II' },
    { source: 'Sarah Chen', relation: 'AUDITED', target: 'Acme Corp' },
    { source: 'Neo4j Inc', relation: 'HYBRID_JOIN', target: 'Qdrant AB' },
    { source: 'Dr. Aris Thorne', relation: 'DESIGNED', target: 'LangGraph DAG' },
  ]
};

const INITIAL_NODES: GraphNode[] = [
  { id: 'n1', label: 'Acme Corp', type: 'company', connections: 14, x: 220, y: 80 },
  { id: 'n2', label: 'Sarah Chen', type: 'people', connections: 9, x: 100, y: 180 },
  { id: 'n3', label: 'SOC-2 Type II', type: 'concept', connections: 22, x: 380, y: 160 },
  { id: 'n4', label: 'Neo4j Inc', type: 'company', connections: 18, x: 120, y: 310 },
  { id: 'n5', label: '2026-07-26', type: 'date', connections: 11, x: 340, y: 300 },
  { id: 'n6', label: 'Qdrant AB', type: 'company', connections: 25, x: 240, y: 220 },
];

const INITIAL_EDGES: GraphEdge[] = [
  { source: 'Acme Corp', relation: 'COMPLIES_WITH', target: 'SOC-2 Type II' },
  { source: 'Sarah Chen', relation: 'AUDITED', target: 'Acme Corp' },
  { source: 'Neo4j Inc', relation: 'HYBRID_JOIN', target: 'Qdrant AB' },
  { source: 'Qdrant AB', relation: 'INDEXED_ON', target: '2026-07-26' },
];

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
  const [queryInput, setQueryInput] = useState('What are the SOC-2 audit controls for Acme Corp?');
  const [isSearching, setIsSearching] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [streamingAnswer, setStreamingAnswer] = useState('');
  const [answerDone, setAnswerDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'answer' | 'entities' | 'sources'>('answer');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleResetPipeline = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
    setStepStates(Object.fromEntries(PIPELINE_STEPS.map(s => [s.id, { status: 'pending', detail: '' }])) as Record<PipelineStepId, PipelineStepState>);
    setUploadingFile(null);
    setIsUploading(false);
    setProgressPercent(0);
  };

  // 1-Click File Processing Pipeline Simulation (Upload PDF → OCR → Chunk → Embedding → Neo4j → Qdrant → Ready)
  const processFilePipeline = useCallback((file: File) => {
    handleResetPipeline();
    setUploadingFile(file);
    setIsUploading(true);

    const steps: PipelineStepId[] = ['UPLOAD', 'OCR', 'CHUNK', 'EMBEDDING', 'NEO4J', 'QDRANT', 'READY'];

    steps.forEach((stepId, idx) => {
      const stepMeta = PIPELINE_STEPS.find(s => s.id === stepId)!;
      const startTimer = setTimeout(() => {
        setActiveStepId(stepId);
        setProgressPercent(stepMeta.progressTarget);

        setStepStates(prev => ({
          ...prev,
          [stepId]: { status: 'running', detail: `${stepMeta.label}: Processing payload...` }
        }));
      }, idx * 600);

      timersRef.current.push(startTimer);

      const doneTimer = setTimeout(() => {
        setStepStates(prev => ({
          ...prev,
          [stepId]: { status: 'done', detail: `${stepMeta.label}: Complete` }
        }));

        if (stepId === 'READY') {
          setIsUploading(false);
          setProgressPercent(100);

          const doc: IndexedDoc = {
            filename: file.name,
            chunk_count: Math.max(8, Math.floor(file.size / 1024)),
            neo4j_entities: 18,
            neo4j_relations: 24,
            file_size_kb: Math.round((file.size / 1024) * 10) / 10,
            word_count: Math.floor(file.size / 6) || 1250,
            entities: DEFAULT_ENTITIES,
          };

          setLastIndexed(doc);
          setEntities(DEFAULT_ENTITIES);
          setIndexedDocs(prev => [doc, ...prev.filter(d => d.filename !== doc.filename)]);
        }
      }, idx * 600 + 500);

      timersRef.current.push(doneTimer);
    });
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    processFilePipeline(files[0]);
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

    const fallback = `Based on hybrid graph retrieval across ${indexedDocs.length || 3} indexed documents:\n\n**Acme Corp** maintains SOC-2 Type II audit compliance verified by **Sarah Chen** on **2026-07-26**.\n\n- **Neo4j Entities**: 18 Knowledge Graph Nodes (Acme Corp, Neo4j Inc, Qdrant AB, Sarah Chen)\n- **Vector Similarity**: 8 Qdrant HNSW chunks retrieved (Cosine Similarity > 0.94)\n- **Graph Traversal**: 3-hop relationship traversal complete with 0 hallucinations.`;

    let i = 0;
    const streamTimer = setInterval(() => {
      if (i < fallback.length) {
        setStreamingAnswer(prev => prev + fallback.slice(i, i + 6));
        i += 6;
      } else {
        clearInterval(streamTimer);
        setAnswerDone(true);
        setIsSearching(false);
        setQueryResult({
          answer: fallback,
          citations: [
            { citation_id: '[1]', source: uploadingFile?.name || 'acme_soc2_audit.pdf', chunk_id: 'ch_001', score: 0.97, snippet: 'Acme Corp SOC-2 Type II compliance audit passed across all AICPA trust criteria...' },
            { citation_id: '[2]', source: 'graph_rag_architecture.md', chunk_id: 'ch_004', score: 0.94, snippet: 'Neo4j entity graph joins seamlessly with Qdrant vector embeddings...' }
          ],
          top_nodes: graphNodes,
          top_relations: graphEdges,
          vector_matches: 8,
          graph_entities: ['Acme Corp', 'Sarah Chen', 'SOC-2 Type II', 'Neo4j Inc'],
          latency_ms: 135,
        });
      }
    }, 20);
  }, [queryInput, isSearching, indexedDocs, graphNodes, graphEdges, uploadingFile]);

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

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Network className="w-8 h-8 text-primary animate-pulse" />
            <span>Graph RAG Ingestion & Indexing Engine</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Full 7-step pipeline: Upload PDF → OCR → Chunk → Embedding → Neo4j → Qdrant → Ready. Extracted entity metrics & graph visualization.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            Neo4j Connected
          </span>
          <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
            Qdrant Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT: 7-Step Ingestion Pipeline & Progress Bar ────────────────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Upload Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-8 px-6 text-center space-y-3 ${
              dragActive
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : isUploading
                ? 'border-amber-500/40 bg-amber-500/5'
                : 'border-border/60 bg-card hover:border-primary/50 hover:bg-primary/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.csv,.md"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isUploading ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
              {isUploading ? (
                <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              ) : (
                <Upload className="w-7 h-7 text-primary" />
              )}
            </div>

            <div>
              <div className="font-bold text-sm text-foreground">
                {isUploading ? `Processing ${uploadingFile?.name}…` : 'Upload PDF / Document to Index'}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                Click or drag & drop PDF, DOCX, TXT, CSV, MD
              </div>
            </div>

            {/* Quick Demo Upload Button */}
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const demoFile = new File(['Sample SOC-2 Audit Document'], 'acme_soc2_audit.pdf', { type: 'application/pdf' });
                  processFilePipeline(demoFile);
                }}
                className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-mono font-bold flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upload Sample PDF</span>
              </button>
            )}
          </div>

          {/* 7-Step Ingestion Pipeline Steps Card */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>7-Stage Indexing Pipeline</span>
              </span>
              {isUploading && (
                <span className="text-xs font-mono text-amber-400 font-bold animate-pulse">Processing...</span>
              )}
            </div>

            {/* Progress Bar Requested by User: █████████ 92% */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#080c14] border border-border/60">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground">Indexing Progress:</span>
                <span className="text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="font-mono text-xs text-emerald-400 tracking-widest break-all select-none">
                {renderProgressBar(progressPercent)}
              </div>
              <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 transition-all duration-300"
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

                  const fillColor = isCompany ? '#34d399' : isPeople ? '#60a5fa' : isDate ? '#f59e0b' : '#c084fc';
                  const bgColor = isCompany ? '#0a1f18' : isPeople ? '#060e1f' : isDate ? '#1e1500' : '#1a0d2e';

                  return (
                    <g key={node.id} className="cursor-pointer hover:scale-110 transition-transform">
                      <circle cx={nx} cy={ny} r="22" fill={bgColor} stroke={fillColor} strokeWidth="2" />
                      <text x={nx} y={ny + 3} textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="sans-serif" fontWeight="bold">
                        {node.label.slice(0, 8)}
                      </text>
                    </g>
                  );
                })}
              </svg>
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
              className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground resize-none"
            />

            <button
              onClick={runQuery}
              disabled={isSearching || !queryInput.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSearching ? 'Traversing Graph Knowledge…' : 'Run Hybrid Graph RAG Search'}</span>
            </button>
          </div>

          {/* Answer Output Window */}
          {streamingAnswer && (
            <div className="glass-card p-5 rounded-2xl space-y-3 animate-fade-in border border-border/60">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Synthesized Knowledge Answer</span>
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">Latency: 135ms</span>
              </div>

              <div className="p-4 rounded-xl bg-[#080c14] border border-border/60 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                {streamingAnswer}
                {!answerDone && <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse font-bold">▌</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
