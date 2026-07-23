import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  CheckCircle2,
  Sliders,
  Copy,
  Layers,
  Activity,
  Plus,
  Search,
  Filter,
  BarChart2
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  version: string;
  author: string;
  status: 'approved' | 'review' | 'draft';
  variables: string[];
  faithfulness: number;
  groundedness: number;
  relevance: number;
  content: string;
}

const TEMPLATES: PromptTemplate[] = [
  {
    id: 'p-101',
    title: 'SOC-2 Compliance DAG Decomposition',
    category: 'Security & Audit',
    version: 'v2.4.0',
    author: 'Senior AI Architect',
    status: 'approved',
    variables: ['company_name', 'audit_scope', 'framework_version'],
    faithfulness: 0.99,
    groundedness: 0.98,
    relevance: 0.97,
    content: `You are a compliance agent for {{company_name}}. Analyze the security controls for {{audit_scope}} under {{framework_version}}.`
  },
  {
    id: 'p-102',
    title: 'Neo4j Graph RAG Cypher Query Synthesizer',
    category: 'Graph RAG',
    version: 'v1.8.2',
    author: 'MLOps Lead',
    status: 'approved',
    variables: ['entity_type', 'relationship_type', 'max_depth'],
    faithfulness: 0.97,
    groundedness: 0.99,
    relevance: 0.96,
    content: `Generate an optimized Cypher query matching entities of type {{entity_type}} linked via {{relationship_type}} up to depth {{max_depth}}.`
  }
];

export const PromptStudioPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate>(TEMPLATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    company_name: 'Acme Corp',
    audit_scope: 'Cloud Infrastructure',
    framework_version: '2026-v2'
  });

  const interpolatedPrompt = selectedTemplate.content.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => variableValues[key] || `{{${key}}}`
  );

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Prompt Studio & Engineering Suite</h1>
          <p className="text-muted-foreground text-sm">
            Enterprise prompt versioning, variable interpolation, DeepEval / RAGAS scoring, and A/B regression benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success">DeepEval Engine Active</Badge>
          <Badge variant="info">LangSmith Synced</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Library */}
        <div className="lg:col-span-4 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Prompt Library</h3>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">
              {TEMPLATES.length} Templates
            </span>
          </div>

          <div className="space-y-3">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  setSelectedTemplate(tmpl);
                  const initialVars: Record<string, string> = {};
                  tmpl.variables.forEach(v => initialVars[v] = 'SampleValue');
                  setVariableValues(initialVars);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTemplate.id === tmpl.id
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'bg-muted/30 border-border/40 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-foreground">{tmpl.title}</div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                    {tmpl.version}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">{tmpl.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Prompt Editor & Evaluation Scores */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold">{selectedTemplate.title}</h3>
                <p className="text-xs text-muted-foreground">Author: {selectedTemplate.author} • Version: {selectedTemplate.version}</p>
              </div>
              <Badge variant="success">APPROVED</Badge>
            </div>

            {/* RAGAS & DeepEval Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                <div className="text-[10px] text-muted-foreground uppercase">Faithfulness</div>
                <div className="text-emerald-400 font-bold text-lg mt-0.5">{(selectedTemplate.faithfulness * 100).toFixed(0)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                <div className="text-[10px] text-muted-foreground uppercase">Groundedness</div>
                <div className="text-blue-400 font-bold text-lg mt-0.5">{(selectedTemplate.groundedness * 100).toFixed(0)}%</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                <div className="text-[10px] text-muted-foreground uppercase">Relevance</div>
                <div className="text-indigo-400 font-bold text-lg mt-0.5">{(selectedTemplate.relevance * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Prompt Variables Configurator */}
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Prompt Variables</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedTemplate.variables.map((varName) => (
                  <div key={varName} className="space-y-1">
                    <label className="text-[11px] font-mono text-muted-foreground">{`{{${varName}}}`}</label>
                    <input
                      type="text"
                      value={variableValues[varName] || ''}
                      onChange={(e) => setVariableValues({ ...variableValues, [varName]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interpolated Preview */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interpolated Prompt Output</div>
              <div className="p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-emerald-300 leading-relaxed">
                {interpolatedPrompt}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
