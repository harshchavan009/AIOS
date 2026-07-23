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
  Loader2
} from 'lucide-react';

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

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  author: string;
  status: 'approved' | 'review' | 'draft';
  variables: string[];
  versions: PromptVersion[];
  publishedVersion: string;
  tags: string[];
}

interface ABTest {
  variantA: string; // version string
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
    category: 'Security & Audit',
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
        content: `You are a SOC-2 Type II compliance auditor specialized in {{industry}} operations.\n\nCompany: {{company}}\nJurisdiction: {{country}}\n\nTask:\n1. Identify all applicable SOC-2 trust service criteria\n2. Map existing controls to each criterion with pass/fail status\n3. Flag high-severity gaps with remediation recommendations\n4. Generate an executive summary suitable for board-level review\n\nFormat output as structured JSON with citations from AICPA 2017 guidelines.`,
        createdAt: '2026-07-20T11:00:00Z',
        author: 'Senior AI Architect',
        changeNote: 'Full rewrite with JSON output, AICPA citations, board-level summary',
        faithfulness: 0.99, groundedness: 0.98, relevance: 0.97,
      }
    ]
  },
  {
    id: 'p-102',
    title: 'Neo4j Cypher Query Synthesizer',
    category: 'Graph RAG',
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
    ]
  },
  {
    id: 'p-103',
    title: 'Financial Report Summarizer',
    category: 'Finance',
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
    ]
  }
];

const DEFAULT_VARIABLE_VALUES: Record<string, Record<string, string>> = {
  'p-101': { company: 'Acme Corp', industry: 'Healthcare', country: 'United States' },
  'p-102': { entity_type: 'Customer', relationship_type: 'PURCHASED', max_depth: '3' },
  'p-103': { company: 'Tesla Inc', quarter: '2', country: 'USA' }
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
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

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────
export const PromptStudioPage: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>(INITIAL_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>('p-101');
  const [activeVersionIdx, setActiveVersionIdx] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'ab' | 'variables' | 'review'>('editor');
  const [variableValues, setVariableValues] = useState<Record<string, string>>(DEFAULT_VARIABLE_VALUES['p-101']);
  const [editingContent, setEditingContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [newChangeNote, setNewChangeNote] = useState('');
  const [ab, setAb] = useState<ABTest>({ variantA: 'v2', variantB: 'v3', results: null, running: false });
  const [savingVersion, setSavingVersion] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  const [newPromptModal, setNewPromptModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState<string | null>(null);

  const selected = useMemo(() => templates.find(t => t.id === selectedId)!, [templates, selectedId]);
  const activeVersion = useMemo(() => selected?.versions[activeVersionIdx] ?? selected?.versions[selected.versions.length - 1], [selected, activeVersionIdx]);
  const interpolated = useMemo(() => interpolate(activeVersion?.content || '', variableValues), [activeVersion, variableValues]);

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
        faithfulness: +(0.85 + Math.random() * 0.14).toFixed(2),
        groundedness: +(0.85 + Math.random() * 0.14).toFixed(2),
        relevance: +(0.85 + Math.random() * 0.14).toFixed(2),
      };
      setTemplates(prev => prev.map(t => t.id === selectedId
        ? { ...t, versions: [...t.versions, newVer], variables: detectedVars }
        : t
      ));
      setActiveVersionIdx(selected.versions.length);
      setIsEditing(false);
      setSavingVersion(false);
    }, 800);
  };

  // Rollback to version
  const rollback = (idx: number) => {
    setActiveVersionIdx(idx);
    setIsEditing(false);
  };

  // Fork template
  const forkTemplate = () => {
    const forked: PromptTemplate = {
      ...selected,
      id: `p-fork-${Date.now()}`,
      title: `${selected.title} (Fork)`,
      status: 'draft',
      versions: [{ ...activeVersion, version: 'v1', author: 'You', createdAt: new Date().toISOString(), changeNote: `Forked from ${activeVersion.version}` }],
      publishedVersion: 'v1'
    };
    setTemplates(prev => [forked, ...prev]);
    selectTemplate(forked.id);
  };

  // Duplicate version as new prompt
  const duplicateAsNew = () => {
    const duped: PromptTemplate = {
      ...selected,
      id: `p-dup-${Date.now()}`,
      title: `${selected.title} (Copy)`,
      status: 'draft',
      versions: [{ ...activeVersion, version: 'v1', author: 'You', createdAt: new Date().toISOString(), changeNote: 'Duplicated' }],
      publishedVersion: 'v1'
    };
    setTemplates(prev => [duped, ...prev]);
    selectTemplate(duped.id);
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

  // Run A/B Test
  const runABTest = () => {
    setAb(prev => ({ ...prev, running: true, results: null }));
    setTimeout(() => {
      setAb(prev => ({
        ...prev,
        running: false,
        results: {
          a: +(60 + Math.random() * 30).toFixed(1),
          b: +(60 + Math.random() * 30).toFixed(1)
        }
      }));
    }, 1800);
  };

  // Copy interpolated
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
      category: 'Custom',
      author: 'You',
      status: 'draft',
      tags: [],
      variables: ['company', 'industry', 'country'],
      publishedVersion: 'v1',
      versions: [{
        version: 'v1',
        content: `You are an AI assistant for {{company}} in the {{industry}} sector.\n\nContext: {{country}}\n\nTask: `,
        createdAt: new Date().toISOString(),
        author: 'You',
        changeNote: 'Created from scratch',
        faithfulness: 0.00, groundedness: 0.00, relevance: 0.00,
      }]
    };
    setTemplates(prev => [blank, ...prev]);
    DEFAULT_VARIABLE_VALUES[blank.id] = { company: '', industry: '', country: '' };
    setNewPromptModal(false);
    setNewTitle('');
    selectTemplate(blank.id);
  };

  const filteredTemplates = templates.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'editor', label: 'Editor', icon: <Pencil className="w-3.5 h-3.5" /> },
    { id: 'variables', label: 'Variables', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'History', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'ab', label: 'A/B Test', icon: <SplitSquareHorizontal className="w-3.5 h-3.5" /> },
    { id: 'review', label: 'Approval', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <BookMarked className="w-7 h-7 text-primary" />
            <span>Prompt Studio</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Version-controlled prompt engineering with A/B testing, live variable interpolation, approval workflows, and publishing.
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
        {/* ────────────────── LEFT: Library ────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          {/* Template List */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prompt Library</span>
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
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{tmpl.category}</div>
                  </div>
                  <span className={`flex-shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(tmpl.status)}`}>
                    {statusIcon(tmpl.status)}
                    <span>{tmpl.status.toUpperCase()}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {tmpl.tags.slice(0, 2).map(tag => (
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

        {/* ────────────────── RIGHT: Editor ────────────────── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Title + Actions Bar */}
          <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div>
                <div className="font-bold text-base truncate">{selected.title}</div>
                <div className="text-[10px] text-muted-foreground font-mono flex items-center space-x-2 mt-0.5">
                  <User className="w-3 h-3" />
                  <span>{selected.author}</span>
                  <span>·</span>
                  <GitBranch className="w-3 h-3" />
                  <span>{selected.versions.length} versions</span>
                  <span>·</span>
                  <span className={`flex items-center space-x-1 ${statusColor(selected.status)} px-1.5 py-0.5 rounded-full border`}>
                    {statusIcon(selected.status)}
                    <span>{selected.status}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Version selector */}
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

              {/* Action buttons */}
              <button onClick={forkTemplate} title="Fork" className="p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 transition-all">
                <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={duplicateAsNew} title="Duplicate" className="p-2 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/60 transition-all">
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-muted/30 border border-border/40 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
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

          {/* ── Tab: EDITOR ── */}
          {activeTab === 'editor' && (
            <div className="space-y-4">
              {/* Eval Scores */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Faithfulness', value: activeVersion.faithfulness, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                  { label: 'Groundedness', value: activeVersion.groundedness, color: 'text-blue-400', bar: 'bg-blue-500' },
                  { label: 'Relevance', value: activeVersion.relevance, color: 'text-indigo-400', bar: 'bg-indigo-500' },
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

              {/* Prompt Editor / Preview */}
              <div className="glass-card p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {isEditing ? 'Editing Draft' : `Prompt — ${activeVersion.version}`}
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
                        placeholder="Describe what changed in this version..."
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
                    {/* Live variables detected in editing content */}
                    {detectVariables(editingContent).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono mr-1">Variables detected:</span>
                        {detectVariables(editingContent).map(v => (
                          <span key={v} className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 text-[10px] font-mono">{`{{${v}}}`}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-gray-200 leading-relaxed whitespace-pre-wrap min-h-[160px]">
                    {/* Highlight variable placeholders */}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Live Interpolated Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Variables substituted in real-time</span>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#090d16] to-[#0f1620] border border-emerald-500/20 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap min-h-[80px]">
                  {interpolated}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: VARIABLES ── */}
          {activeTab === 'variables' && (
            <div className="glass-card p-5 rounded-2xl space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground">Variable Interpolation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set values for each <code className="text-primary bg-primary/10 px-1 rounded">{'{{variable}}'}</code> token. The preview updates live.
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
                      className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60"
                    />
                    {!variableValues[varName] && (
                      <div className="text-[10px] text-amber-400 font-mono flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Empty — will render as {`{{${varName}}}`} in output</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Live preview with variables */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rendered Output</span>
                  <button onClick={copyInterpolated} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/50 text-xs font-semibold hover:bg-muted/70 transition-all">
                    {copiedId === 'interpolated' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'interpolated' ? 'Copied!' : 'Copy Rendered'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#090d16] to-[#0f1620] border border-emerald-500/20 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap">
                  {interpolated}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: HISTORY ── */}
          {activeTab === 'history' && (
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="border-b border-border/60 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <History className="w-4 h-4 text-primary" />
                  <span>Version History</span>
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

                      {/* Scores row */}
                      <div className="flex items-center space-x-4 mt-3 text-[10px] font-mono">
                        <span className="text-muted-foreground">Faithfulness: <span className="text-emerald-400 font-bold">{(v.faithfulness * 100).toFixed(0)}%</span></span>
                        <span className="text-muted-foreground">Groundedness: <span className="text-blue-400 font-bold">{(v.groundedness * 100).toFixed(0)}%</span></span>
                        <span className="text-muted-foreground">Relevance: <span className="text-indigo-400 font-bold">{(v.relevance * 100).toFixed(0)}%</span></span>
                      </div>

                      {/* Expandable content */}
                      <button
                        onClick={() => setHistoryExpanded(historyExpanded === v.version ? null : v.version)}
                        className="mt-3 text-[10px] text-muted-foreground flex items-center space-x-1 hover:text-foreground"
                      >
                        {historyExpanded === v.version ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>{historyExpanded === v.version ? 'Hide' : 'Show'} prompt content</span>
                      </button>
                      {historyExpanded === v.version && (
                        <div className="mt-2 p-3 rounded-xl bg-[#090d16] border border-border/60 font-mono text-[10px] text-gray-300 whitespace-pre-wrap leading-relaxed">
                          {v.content}
                        </div>
                      )}

                      {/* Actions */}
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

          {/* ── Tab: A/B TEST ── */}
          {activeTab === 'ab' && (
            <div className="glass-card p-5 rounded-2xl space-y-5">
              <div className="border-b border-border/60 pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <SplitSquareHorizontal className="w-4 h-4 text-primary" />
                  <span>A/B Version Testing</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Compare two prompt versions head-to-head and get quality scores.</p>
              </div>

              {/* Variant selectors */}
              <div className="grid grid-cols-2 gap-4">
                {(['variantA', 'variantB'] as const).map((key, i) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Variant {i === 0 ? 'A' : 'B'}
                    </label>
                    <select
                      value={ab[key]}
                      onChange={e => setAb(prev => ({ ...prev, [key]: e.target.value, results: null }))}
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                    >
                      {selected.versions.map(v => (
                        <option key={v.version} value={v.version}>{v.version} — {v.changeNote.slice(0, 30)}...</option>
                      ))}
                    </select>
                    {/* Preview */}
                    <div className={`p-3 rounded-xl border font-mono text-[10px] text-gray-300 leading-relaxed whitespace-pre-wrap max-h-28 overflow-y-auto ${i === 0 ? 'border-blue-500/30 bg-blue-500/5' : 'border-purple-500/30 bg-purple-500/5'}`}>
                      {selected.versions.find(v => v.version === ab[key])?.content.slice(0, 200)}...
                    </div>
                  </div>
                ))}
              </div>

              {/* Run button */}
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

              {/* Results */}
              {ab.results && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: `Variant A (${ab.variantA})`, score: ab.results.a, color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-400', border: 'border-blue-500/30' },
                      { label: `Variant B (${ab.variantB})`, score: ab.results.b, color: 'from-purple-500 to-violet-500', textColor: 'text-purple-400', border: 'border-purple-500/30' },
                    ].map((r, i) => (
                      <div key={i} className={`p-4 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 border ${r.border} text-center space-y-2`}>
                        <div className="text-[10px] text-muted-foreground font-mono uppercase">{r.label}</div>
                        <div className={`text-3xl font-extrabold font-mono ${r.textColor}`}>{r.score.toFixed(1)}</div>
                        <div className="text-[10px] text-muted-foreground">Quality Score</div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${r.color} transition-all duration-1000`} style={{ width: `${r.score}%` }} />
                        </div>
                        {((i === 0 && ab.results!.a > ab.results!.b) || (i === 1 && ab.results!.b > ab.results!.a)) && (
                          <div className="flex items-center justify-center space-x-1 text-yellow-400 text-[10px] font-bold">
                            <Trophy className="w-3 h-3" />
                            <span>WINNER</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/40 text-xs text-muted-foreground text-center font-mono">
                    {ab.results.a > ab.results.b
                      ? `✅ Variant A (${ab.variantA}) outperforms B by ${(ab.results.a - ab.results.b).toFixed(1)} quality points. Consider promoting ${ab.variantA} to published.`
                      : ab.results.b > ab.results.a
                      ? `✅ Variant B (${ab.variantB}) outperforms A by ${(ab.results.b - ab.results.a).toFixed(1)} quality points. Consider promoting ${ab.variantB} to published.`
                      : '🤝 Both variants perform equally. Review manually.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: APPROVAL / REVIEW / PUBLISHING ── */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              {/* Status Card */}
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

                {/* Workflow steps */}
                <div className="space-y-3">
                  {[
                    { step: 1, label: 'Draft Created', desc: 'Prompt authored and saved', done: true },
                    { step: 2, label: 'Evaluation Run', desc: 'RAGAS / DeepEval scores computed', done: activeVersion.faithfulness > 0 },
                    { step: 3, label: 'Submitted for Review', desc: 'Peer review requested', done: selected.status === 'review' || selected.status === 'approved' },
                    { step: 4, label: 'Approved & Published', desc: 'Live in production', done: selected.status === 'approved' },
                  ].map((s) => (
                    <div key={s.step} className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        s.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground border border-border/60'
                      }`}>
                        {s.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.step}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${s.done ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</div>
                        <div className="text-[10px] text-muted-foreground">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Published version info */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">Current Published State</h4>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Published Version</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">{selected.publishedVersion}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Active Editor Version</span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">{activeVersion.version}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`flex items-center space-x-1 px-2 py-0.5 rounded border font-bold ${statusColor(selected.status)}`}>
                    {statusIcon(selected.status)}
                    <span>{selected.status}</span>
                  </span>
                </div>
              </div>

              {/* Action buttons */}
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
                {selected.status === 'approved' && (
                  <div className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Published & Live ✓</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Prompt Modal ── */}
      {newPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 rounded-2xl w-full max-w-md space-y-4 border border-border/60 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-bold">Create New Prompt</h3>
              <button onClick={() => setNewPromptModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prompt Title</label>
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createNewPrompt()}
                placeholder="e.g. Customer Support Response Generator"
                className="w-full px-3 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-sm font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">Will start with a blank v1 template with <code className="text-amber-400">{'{{company}}'}</code>, <code className="text-amber-400">{'{{industry}}'}</code>, and <code className="text-amber-400">{'{{country}}'}</code> variables.</p>
            </div>
            <div className="flex items-center space-x-3 pt-1">
              <button onClick={() => setNewPromptModal(false)} className="flex-1 py-2.5 rounded-xl border border-border/60 text-xs font-semibold hover:bg-muted transition-all">Cancel</button>
              <button
                onClick={createNewPrompt}
                disabled={!newTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-all"
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
