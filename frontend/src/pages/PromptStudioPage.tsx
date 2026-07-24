import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Sparkles,
  GitBranch,
  CheckCircle2,
  Copy,
  Plus,
  Search,
  RotateCcw,
  FlaskConical,
  History,
  Send,
  Trash2,
  Save,
  Upload,
  ChevronRight,
  ChevronDown,
  Tag,
  User,
  Clock,
  Layers,
  Pencil,
  Eye,
  ArrowLeft,
  Play,
  Trophy,
  SplitSquareHorizontal,
  BookMarked,
  BadgeCheck,
  AlertCircle,
  FileText,
  Loader2,
  Folder,
  FolderPlus,
  MessageSquare,
  BarChart2,
  Activity,
  Coins,
  Check,
  Zap
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface PromptVersion {
  version: string;
  content: string;
  createdAt: string;
  author: string;
  changeNote: string;
  faithfulness: number;
  groundedness: number;
  relevance: number;
  abScore?: number;
}

interface TeamComment {
  id: string;
  author: string;
  role: string;
  avatar: string;
  timestamp: string;
  content: string;
}

interface ExecutionLog {
  id: string;
  timestamp: string;
  model: string;
  latency_ms: number;
  tokens: number;
  cost: number;
  faithfulness: number;
  groundedness: number;
  relevance: number;
  status: 'success' | 'failed';
}

interface PromptTemplate {
  id: string;
  title: string;
  collection: string;
  folder: string;
  author: string;
  status: 'approved' | 'review' | 'draft';
  variables: string[];
  versions: PromptVersion[];
  publishedVersion: string;
  tags: string[];
  comments: TeamComment[];
  executionHistory: ExecutionLog[];
}

interface ABTest {
  variantA: string;
  variantB: string;
  results: { a: number; b: number } | null;
  running: boolean;
}

// ──────────────────────────────────────────────
// Seed Data
// ──────────────────────────────────────────────
const INITIAL_TEMPLATES: PromptTemplate[] = [
  {
    id: 'p-101',
    title: 'SOC-2 Compliance Analyzer',
    collection: 'Security & Compliance',
    folder: 'Audit Workflows',
    author: 'Senior AI Architect',
    status: 'approved',
    tags: ['compliance', 'security', 'audit'],
    variables: ['company', 'industry', 'country'],
    publishedVersion: 'v3',
    versions: [
      {
        version: 'v1',
        content: `You are a compliance analyst. Review {{company}} in the {{industry}} sector.`,
        createdAt: '2026-07-01T09:00:00Z',
        author: 'ML Engineer',
        changeNote: 'Initial draft',
        faithfulness: 0.82, groundedness: 0.79, relevance: 0.81,
      },
      {
        version: 'v2',
        content: `You are an enterprise compliance agent for {{company}} operating in {{industry}}.\nAnalyze their SOC-2 Type II security controls across {{country}} data residency requirements.\nProvide a structured audit checklist with risk severity ratings.`,
        createdAt: '2026-07-10T14:30:00Z',
        author: 'Senior AI Architect',
        changeNote: 'Added structured checklist format and risk severity',
        faithfulness: 0.91, groundedness: 0.89, relevance: 0.93,
      },
      {
        version: 'v3',
        content: `You are a SOC-2 Type II compliance auditor specialized in {{industry}} operations.\n\nCompany: {{company}}\nJurisdiction: {{country}}\n\nTask:\n1. Identify all applicable SOC-2 trust service criteria\n2. Map existing controls to each criterion with pass/fail status\n3. Flag high-severity gaps with remediation recommendations\n4. Generate an executive summary suitable for board-level review\n\nFormat output as structured JSON with citations from AICPA guidelines.`,
        createdAt: '2026-07-20T11:00:00Z',
        author: 'Senior AI Architect',
        changeNote: 'Full rewrite with JSON output, AICPA citations, board-level summary',
        faithfulness: 0.99, groundedness: 0.98, relevance: 0.97,
      }
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Sarah Chen',
        role: 'Lead Security Auditor',
        avatar: 'SC',
        timestamp: '2026-07-21T10:15:00Z',
        content: 'v3 prompt structure produces compliant AICPA citations. Approved for production deployment.'
      },
      {
        id: 'c-2',
        author: 'Alex Mercer',
        role: 'DevOps Lead',
        avatar: 'AM',
        timestamp: '2026-07-21T14:20:00Z',
        content: 'Added token ceiling caps for large multi-page SOC-2 documents.'
      }
    ],
    executionHistory: [
      { id: 'ex-1', timestamp: '2026-07-24 16:45:10', model: 'gpt-4o', latency_ms: 145, tokens: 420, cost: 0.0042, faithfulness: 0.99, groundedness: 0.98, relevance: 0.97, status: 'success' },
      { id: 'ex-2', timestamp: '2026-07-24 15:20:04', model: 'claude-3-5-sonnet', latency_ms: 162, tokens: 480, cost: 0.0072, faithfulness: 0.98, groundedness: 0.97, relevance: 0.98, status: 'success' },
      { id: 'ex-3', timestamp: '2026-07-24 12:10:33', model: 'gemini-1.5-pro', latency_ms: 128, tokens: 390, cost: 0.0027, faithfulness: 0.96, groundedness: 0.95, relevance: 0.96, status: 'success' }
    ]
  },
  {
    id: 'p-102',
    title: 'Neo4j Cypher Query Synthesizer',
    collection: 'Graph RAG & Data',
    folder: 'Cypher Pipelines',
    author: 'MLOps Lead',
    status: 'approved',
    tags: ['neo4j', 'graphrag', 'cypher'],
    variables: ['entity_type', 'relationship_type', 'max_depth'],
    publishedVersion: 'v2',
    versions: [
      {
        version: 'v1',
        content: `Generate a Cypher query for {{entity_type}} with {{relationship_type}} up to depth {{max_depth}}.`,
        createdAt: '2026-07-05T10:00:00Z',
        author: 'Data Engineer',
        changeNote: 'Initial version',
        faithfulness: 0.85, groundedness: 0.87, relevance: 0.84,
      },
      {
        version: 'v2',
        content: `You are a Neo4j expert. Generate an optimized Cypher query that:\n- Traverses from {{entity_type}} nodes\n- Follows {{relationship_type}} relationships\n- Limits depth to {{max_depth}} hops\n- Returns nodes with relevance scores\n- Uses APOC procedures where beneficial\n\nInclude query complexity analysis and index recommendations.`,
        createdAt: '2026-07-18T09:15:00Z',
        author: 'MLOps Lead',
        changeNote: 'Added APOC procedures, index recommendations, complexity analysis',
        faithfulness: 0.97, groundedness: 0.99, relevance: 0.96,
      }
    ],
    comments: [
      {
        id: 'c-3',
        author: 'David Vance',
        role: 'Database Engineer',
        avatar: 'DV',
        timestamp: '2026-07-19T08:30:00Z',
        content: 'APOC procedure inclusion reduced query execution time from 1.2s to 45ms.'
      }
    ],
    executionHistory: [
      { id: 'ex-4', timestamp: '2026-07-24 14:10:00', model: 'gpt-4o', latency_ms: 110, tokens: 310, cost: 0.0031, faithfulness: 0.97, groundedness: 0.99, relevance: 0.96, status: 'success' }
    ]
  },
  {
    id: 'p-103',
    title: 'Financial Report Summarizer',
    collection: 'Finance & Analytics',
    folder: 'Earnings Reports',
    author: 'Data Scientist',
    status: 'draft',
    tags: ['finance', 'summarization'],
    variables: ['company', 'quarter', 'country'],
    publishedVersion: 'v1',
    versions: [
      {
        version: 'v1',
        content: `Summarize the Q{{quarter}} financial report for {{company}} in {{country}}. Highlight key metrics, risks, and growth indicators.`,
        createdAt: '2026-07-22T16:00:00Z',
        author: 'Data Scientist',
        changeNote: 'Initial draft',
        faithfulness: 0.88, groundedness: 0.85, relevance: 0.90,
      }
    ],
    comments: [],
    executionHistory: []
  }
];

const DEFAULT_VARIABLE_VALUES: Record<string, Record<string, string>> = {
  'p-101': { company: 'Acme Corp', industry: 'Healthcare', country: 'United States' },
  'p-102': { entity_type: 'Customer', relationship_type: 'PURCHASED', max_depth: '3' },
  'p-103': { company: 'Tesla Inc', quarter: '2', country: 'USA' }
};

function interpolate(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    values[key] !== undefined && values[key] !== '' ? values[key] : `{{${key}}}`
  );
}

function detectVariables(content: string): string[] {
  const matches = content.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
}

function statusColor(status: PromptTemplate['status']) {
  return {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    draft: 'bg-muted text-muted-foreground border-border/40',
  }[status];
}

function statusIcon(status: PromptTemplate['status']) {
  if (status === 'approved') return <BadgeCheck className="w-3 h-3" />;
  if (status === 'review') return <AlertCircle className="w-3 h-3" />;
  return <FileText className="w-3 h-3" />;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  const hrs = Math.floor(diff / 3600000);
  return hrs > 0 ? `${hrs}h ago` : 'just now';
}

export const PromptStudioPage: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>('p-101');
  const [activeVersionIdx, setActiveVersionIdx] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'editor' | 'variables' | 'history' | 'ab' | 'review' | 'comments' | 'analytics'>('editor');
  const [variableValues, setVariableValues] = useState<Record<string, string>>(DEFAULT_VARIABLE_VALUES['p-101']);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [newChangeNote, setNewChangeNote] = useState('');
  const [ab, setAb] = useState<ABTest>({ variantA: 'v2', variantB: 'v3', results: null, running: false });
  const [savingVersion, setSavingVersion] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [newPromptModal, setNewPromptModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCollection, setNewCollection] = useState('Security & Compliance');
  const [newComment, setNewComment] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState<string | null>(null);

  const selected = useMemo(() => templates.find(t => t.id === selectedId)!, [templates, selectedId]);
  const activeVersion = useMemo(() => selected?.versions[activeVersionIdx] ?? selected?.versions[selected.versions.length - 1], [selected, activeVersionIdx]);
  const interpolated = useMemo(() => interpolate(activeVersion?.content || '', variableValues), [activeVersion, variableValues]);

  const collectionsList = useMemo(() => {
    return Array.from(new Set(templates.map(t => t.collection)));
  }, [templates]);

  // Switch prompt
  const selectTemplate = useCallback((id: string) => {
    const tmpl = templates.find(t => t.id === id)!;
    setSelectedId(id);
    setActiveVersionIdx(tmpl.versions.length - 1);
    setVariableValues(DEFAULT_VARIABLE_VALUES[id] || {});
    setIsEditing(false);
    setEditingContent('');
    setActiveTab('editor');
    setAb({ variantA: tmpl.versions[Math.max(0, tmpl.versions.length - 2)]?.version || tmpl.versions[0].version, variantB: tmpl.versions[tmpl.versions.length - 1].version, results: null, running: false });
  }, [templates]);

  // Start edit
  const startEdit = () => {
    setEditingContent(activeVersion.content);
    setNewChangeNote('');
    setIsEditing(true);
  };

  // Save new version
  const saveVersion = () => {
    if (!editingContent.trim() || !newChangeNote.trim()) return;
    setSavingVersion(true);
    setTimeout(() => {
      const newVersionId = `v${selected.versions.length + 1}`;
      const detectedVars = detectVariables(editingContent);
      const newVer: PromptVersion = {
        version: newVersionId,
        content: editingContent,
        createdAt: new Date().toISOString(),
        author: 'You',
        changeNote: newChangeNote,
        faithfulness: +(0.92 + (editingContent.length % 7) * 0.01).toFixed(2),
        groundedness: +(0.91 + (editingContent.length % 6) * 0.01).toFixed(2),
        relevance: +(0.94 + (editingContent.length % 5) * 0.01).toFixed(2),
      };
      setTemplates(prev => prev.map(t => t.id === selectedId
        ? { ...t, versions: [...t.versions, newVer], variables: detectedVars }
        : t
      ));
      setActiveVersionIdx(selected.versions.length);
      setIsEditing(false);
      setSavingVersion(false);
    }, 600);
  };

  // Rollback to version
  const rollback = (idx: number) => {
    setActiveVersionIdx(idx);
    setIsEditing(false);
  };

  // Fork / Clone Template
  const cloneTemplate = () => {
    const cloned: PromptTemplate = {
      ...selected,
      id: `p-clone-${Date.now()}`,
      title: `${selected.title} (Clone)`,
      status: 'draft',
      versions: [{ ...activeVersion, version: 'v1', author: 'You', createdAt: new Date().toISOString(), changeNote: `Cloned from ${selected.title} ${activeVersion.version}` }],
      publishedVersion: 'v1',
      comments: [],
      executionHistory: []
    };
    setTemplates(prev => [cloned, ...prev]);
    selectTemplate(cloned.id);
  };

  // Publish
  const publish = () => {
    setTemplates(prev => prev.map(t => t.id === selectedId
      ? { ...t, status: 'approved', publishedVersion: activeVersion.version }
      : t
    ));
  };

  // Submit for review
  const submitForReview = () => {
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, status: 'review' } : t));
  };

  // Add Comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const commentObj: TeamComment = {
      id: `c_${Date.now()}`,
      author: 'You',
      role: 'Enterprise Member',
      avatar: 'YOU',
      timestamp: new Date().toISOString(),
      content: newComment
    };
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, comments: [...t.comments, commentObj] } : t));
    setNewComment('');
  };

  // Run A/B Test
  const runABTest = () => {
    setAb(prev => ({ ...prev, running: true, results: null }));
    setTimeout(() => {
      setAb(prev => ({
        ...prev,
        running: false,
        results: {
          a: +(75.0 + (selected.title.length % 15)).toFixed(1),
          b: +(82.0 + (selected.title.length % 10)).toFixed(1)
        }
      }));
    }, 1500);
  };

  const copyInterpolated = () => {
    navigator.clipboard.writeText(interpolated);
    setCopiedId('interpolated');
    setTimeout(() => setCopiedId(''), 1500);
  };

  // Create new blank prompt
  const createNewPrompt = () => {
    if (!newTitle.trim()) return;
    const blank: PromptTemplate = {
      id: `p-new-${Date.now()}`,
      title: newTitle,
      collection: newCollection,
      folder: 'Custom Prompts',
      author: 'You',
      status: 'draft',
      tags: ['custom'],
      variables: ['company', 'industry', 'country'],
      publishedVersion: 'v1',
      versions: [{
        version: 'v1',
        content: `You are an AI assistant for {{company}} in the {{industry}} sector.\n\nContext: {{country}}\n\nTask: `,
        createdAt: new Date().toISOString(),
        author: 'You',
        changeNote: 'Created from scratch',
        faithfulness: 0.90, groundedness: 0.90, relevance: 0.90,
      }],
      comments: [],
      executionHistory: []
    };
    setTemplates(prev => [blank, ...prev]);
    DEFAULT_VARIABLE_VALUES[blank.id] = { company: '', industry: '', country: '' };
    setNewPromptModal(false);
    setNewTitle('');
    selectTemplate(blank.id);
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCollection = selectedCollection === 'all' || t.collection === selectedCollection;
    return matchesSearch && matchesCollection;
  });

  const tabs = [
    { id: 'editor', label: 'Editor', icon: <Pencil className="w-3.5 h-3.5" /> },
    { id: 'variables', label: 'Variables', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Version History', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'ab', label: 'A/B Test', icon: <SplitSquareHorizontal className="w-3.5 h-3.5" /> },
    { id: 'review', label: 'Approval Workflow', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
    { id: 'comments', label: 'Team Comments', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Execution Logs', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <BookMarked className="w-7 h-7 text-primary" />
            <span>Enterprise Prompt Studio</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Prompt version control, rollbacks, approval workflows, A/B testing, team comments, and execution history.
          </p>
        </div>
        <button
          onClick={() => setNewPromptModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Prompt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ────────────────── LEFT: Collections & Library Sidebar ────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Collection Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 font-mono text-xs">
            <button
              onClick={() => setSelectedCollection('all')}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                selectedCollection === 'all' ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border/60 hover:bg-muted'
              }`}
            >
              All Prompts
            </button>
            {collectionsList.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCollection(c)}
                className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                  selectedCollection === c ? 'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border/60 hover:bg-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by title, tag, or collection..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* Template List */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <Folder className="w-3.5 h-3.5 text-primary" />
                <span>Prompt Collections</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">{filteredTemplates.length}</span>
            </div>

            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => selectTemplate(tmpl.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  selectedId === tmpl.id
                    ? 'bg-primary/10 border-primary/50 shadow-md shadow-primary/10'
                    : 'bg-muted/20 border-border/40 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{tmpl.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{tmpl.collection} / {tmpl.folder}</div>
                  </div>
                  <span className={`flex-shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(tmpl.status)}`}>
                    {statusIcon(tmpl.status)}
                    <span>{tmpl.status.toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {tmpl.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-muted text-[9px] font-mono text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground/60">
                    {tmpl.versions.length} version{tmpl.versions.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ────────────────── RIGHT: Prompt Workspace ────────────────── */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Header Bar */}
          <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div>
                <div className="font-bold text-base truncate">{selected.title}</div>
                <div className="text-[10px] text-muted-foreground font-mono flex items-center space-x-2 mt-0.5">
                  <User className="w-3 h-3" />
                  <span>{selected.author}</span>
                  <span>·</span>
                  <Folder className="w-3 h-3 text-primary" />
                  <span>{selected.collection}</span>
                  <span>·</span>
                  <span className={`flex items-center space-x-1 ${statusColor(selected.status)} px-1.5 py-0.5 rounded-full border`}>
                    {statusIcon(selected.status)}
                    <span>{selected.status}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Version Picker */}
              <div className="flex items-center space-x-1">
                {selected.versions.map((v, i) => (
                  <button
                    key={v.version}
                    onClick={() => { setActiveVersionIdx(i); setIsEditing(false); }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      activeVersionIdx === i
                        ? 'bg-primary text-white border-primary shadow shadow-primary/30'
                        : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/60'
                    }`}
                  >
                    {v.version}
                    {selected.publishedVersion === v.version && (
                      <span className="ml-1 text-emerald-400">●</span>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={cloneTemplate} title="Clone Prompt" className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs font-semibold hover:bg-muted/70 transition-all">
                <GitBranch className="w-3.5 h-3.5 text-primary" />
                <span>Clone</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-muted/30 border border-border/40 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── TAB 1: EDITOR ── */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* Evaluation Scores Bar */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Faithfulness Score', value: activeVersion.faithfulness, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                  { label: 'Groundedness Score', value: activeVersion.groundedness, color: 'text-blue-400', bar: 'bg-blue-500' },
                  { label: 'Relevance Score', value: activeVersion.relevance, color: 'text-indigo-400', bar: 'bg-indigo-500' },
                ].map(m => (
                  <div key={m.label} className="glass-card p-4 rounded-2xl space-y-2 text-center">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                    <div className={`text-xl font-extrabold font-mono ${m.color}`}>{(m.value * 100).toFixed(0)}%</div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full ${m.bar}`} style={{ width: `${m.value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Editor Workspace */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isEditing ? 'Drafting New Version' : `Prompt Content — ${activeVersion.version}`}
                    </span>
                    {!isEditing && (
                      <span className="text-[10px] font-mono text-muted-foreground/60">
                        by {activeVersion.author} · {timeAgo(activeVersion.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isEditing ? (
                      <>
                        <button onClick={startEdit} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs font-semibold hover:bg-muted/70 transition-all">
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button onClick={copyInterpolated} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs font-semibold hover:bg-muted/70 transition-all">
                          {copiedId === 'interpolated' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === 'interpolated' ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditing(false)} className="text-xs text-muted-foreground hover:text-foreground flex items-center space-x-1">
                        <ArrowLeft className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      rows={10}
                      className="w-full p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-gray-200 leading-relaxed focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Commit change note (e.g., added JSON formatting)..."
                        value={newChangeNote}
                        onChange={e => setNewChangeNote(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
                      />
                      <button
                        onClick={saveVersion}
                        disabled={!editingContent.trim() || !newChangeNote.trim() || savingVersion}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-40 transition-all"
                      >
                        {savingVersion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save Version</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-gray-200 leading-relaxed whitespace-pre-wrap min-h-[160px]">
                    {activeVersion.content.split(/(\{\{[\w]+\}\})/g).map((part, i) =>
                      /^\{\{[\w]+\}\}$/.test(part)
                        ? <span key={i} className="bg-amber-500/20 text-amber-300 rounded px-0.5">{part}</span>
                        : <span key={i}>{part}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Interpolated Preview */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Interpolated Output Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Substituted in real-time</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#090d16] to-[#0f1620] border border-emerald-500/20 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap">
                  {interpolated}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: VARIABLES ── */}
          {activeTab === 'variables' && (
            <div className="glass-card p-5 rounded-2xl space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground">Variable Interpolation Fields</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set default values for each <code className="text-primary bg-primary/10 px-1 rounded">{'{{variable}}'}</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selected.variables.map(varName => (
                  <div key={varName} className="space-y-1.5">
                    <label className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-mono">{`{{${varName}}}`}</span>
                    </label>
                    <input
                      type="text"
                      value={variableValues[varName] || ''}
                      onChange={e => setVariableValues(prev => ({ ...prev, [varName]: e.target.value }))}
                      placeholder={`Enter value for ${varName}...`}
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: VERSION HISTORY & ROLLBACK ── */}
          {activeTab === 'history' && (
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <History className="w-4 h-4 text-primary" />
                  <span>Version Commit History & Rollbacks</span>
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">{selected.versions.length} versions</span>
              </div>

              <div className="space-y-3">
                {[...selected.versions].reverse().map((v, ri) => {
                  const idx = selected.versions.length - 1 - ri;
                  const isActive = activeVersionIdx === idx;
                  const isPublished = selected.publishedVersion === v.version;
                  return (
                    <div
                      key={v.version}
                      className={`p-4 rounded-xl border transition-all ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-muted/20'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            {v.version}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-foreground truncate">{v.changeNote}</div>
                            <div className="text-[10px] text-muted-foreground font-mono flex items-center space-x-1.5 mt-0.5">
                              <User className="w-2.5 h-2.5" />
                              <span>{v.author}</span>
                              <span>·</span>
                              <Clock className="w-2.5 h-2.5" />
                              <span>{timeAgo(v.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 flex-shrink-0">
                          {isPublished && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">PUBLISHED</span>
                          )}
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 text-[9px] font-bold">ACTIVE</span>
                          )}
                        </div>
                      </div>

                      {!isActive && (
                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            onClick={() => rollback(idx)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-[10px] font-semibold hover:bg-muted/70 transition-all"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Rollback to {v.version}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 4: A/B TESTING ── */}
          {activeTab === 'ab' && (
            <div className="glass-card p-5 rounded-2xl space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <SplitSquareHorizontal className="w-4 h-4 text-primary" />
                  <span>A/B Version Testing</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Evaluate two versions side-by-side.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(['variantA', 'variantB'] as const).map((key, i) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">
                      Variant {i === 0 ? 'A' : 'B'}
                    </label>
                    <select
                      value={ab[key]}
                      onChange={e => setAb(prev => ({ ...prev, [key]: e.target.value, results: null }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono text-foreground focus:outline-none"
                    >
                      {selected.versions.map(v => (
                        <option key={v.version} value={v.version}>{v.version} — {v.changeNote.slice(0, 30)}...</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={runABTest}
                  disabled={ab.variantA === ab.variantB || ab.running}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 disabled:opacity-40 transition-all"
                >
                  {ab.running ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
                  <span>{ab.running ? 'Running A/B Evaluation...' : 'Run A/B Test'}</span>
                </button>
              </div>

              {ab.results && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border border-purple-500/30 text-center space-y-2">
                  <div className="text-sm font-bold text-purple-400">
                    Winner: {ab.results.a > ab.results.b ? `Variant A (${ab.variantA})` : `Variant B (${ab.variantB})`}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: APPROVAL WORKFLOW ── */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              <div className={`glass-card p-5 rounded-2xl border-2 space-y-4 ${
                selected.status === 'approved' ? 'border-emerald-500/40' :
                selected.status === 'review' ? 'border-amber-500/40' : 'border-border/40'
              }`}>
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="text-sm font-bold flex items-center space-x-2">
                    <BadgeCheck className="w-4 h-4 text-primary" />
                    <span>Approval & Publishing Workflow</span>
                  </h3>
                  <span className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusColor(selected.status)}`}>
                    {statusIcon(selected.status)}
                    <span>{selected.status.toUpperCase()}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {selected.status === 'draft' && (
                  <button
                    onClick={submitForReview}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 font-bold text-xs hover:bg-amber-600/30 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit for Review</span>
                  </button>
                )}
                {selected.status === 'review' && (
                  <button
                    onClick={publish}
                    className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Approve & Publish {activeVersion.version}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 6: TEAM COMMENTS ── */}
          {activeTab === 'comments' && (
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>Team Collaboration Comments</span>
                </h3>
                <span className="text-xs font-mono text-muted-foreground">{selected.comments.length} comments</span>
              </div>

              <div className="space-y-3">
                {selected.comments.map(c => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                          {c.avatar}
                        </div>
                        <span className="text-xs font-bold text-foreground">{c.author}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({c.role})</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{timeAgo(c.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{c.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment Input */}
              <div className="flex items-center space-x-2 pt-2 border-t border-border/40">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a peer review comment..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs disabled:opacity-40 flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 7: EXECUTION LOGS & ANALYTICS ── */}
          {activeTab === 'analytics' && (
            <div className="glass-card p-5 rounded-2xl space-y-4">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <span>Prompt Execution History Logs</span>
                </h3>
                <Badge variant="success">Live Log Stream</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-[10px] uppercase">
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Model</th>
                      <th className="pb-2">Latency</th>
                      <th className="pb-2">Tokens</th>
                      <th className="pb-2">Cost</th>
                      <th className="pb-2">Faithfulness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selected.executionHistory.map(log => (
                      <tr key={log.id} className="hover:bg-muted/20">
                        <td className="py-2.5 text-muted-foreground">{log.timestamp}</td>
                        <td className="py-2.5 font-bold text-foreground">{log.model}</td>
                        <td className="py-2.5 text-pink-400">{log.latency_ms}ms</td>
                        <td className="py-2.5 text-primary">{log.tokens}</td>
                        <td className="py-2.5 text-emerald-400">${log.cost}</td>
                        <td className="py-2.5 text-blue-400">{(log.faithfulness * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Prompt Modal */}
      {newPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-border/60 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold">Create New Prompt</h3>
              <button onClick={() => setNewPromptModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Prompt Title</label>
                <input
                  type="text"
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Customer Audit Pipeline"
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-mono focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Collection</label>
                <input
                  type="text"
                  value={newCollection}
                  onChange={e => setNewCollection(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-mono focus:outline-none text-foreground"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <button onClick={() => setNewPromptModal(false)} className="flex-1 py-2.5 rounded-xl border border-border/60 text-xs font-semibold hover:bg-muted">Cancel</button>
              <button
                onClick={createNewPrompt}
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs disabled:opacity-40"
              >
                Create Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
