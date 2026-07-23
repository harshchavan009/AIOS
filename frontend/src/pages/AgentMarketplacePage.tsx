import React, { useState } from 'react';
import {
  Bot,
  Star,
  Download,
  Share2,
  Sparkles,
  Search,
  CheckCircle2,
  Sliders,
  Plus
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface MarketplaceAgent {
  id: string;
  name: string;
  category: string;
  author: string;
  rating: number;
  installs: number;
  description: string;
  tags: string[];
}

const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  { id: 'm-1', name: 'SOC-2 Compliance Auditor', category: 'Security & Audit', author: 'AIOS Security Team', rating: 4.9, installs: 3420, description: 'Decomposes audit requirements into automated verification DAG workflows.', tags: ['SOC-2', 'Compliance', 'Audit'] },
  { id: 'm-2', name: 'Neo4j Knowledge Graph Traverser', category: 'Graph RAG', author: 'Data Engineering Org', rating: 4.8, installs: 2890, description: 'Generates multi-hop Cypher queries for deep entity relationship retrieval.', tags: ['Graph RAG', 'Neo4j', 'Vector'] },
  { id: 'm-3', name: 'DevOps Kubernetes Troubleshooting Agent', category: 'Infrastructure', author: 'Platform Team', rating: 4.95, installs: 5120, description: 'Analyzes cluster logs, deployment manifests, and pod states autonomously.', tags: ['DevOps', 'Kubernetes', 'SRE'] },
  { id: 'm-4', name: 'Financial Model Benchmark Synthesizer', category: 'Finance', author: 'FinTech Group', rating: 4.7, installs: 1980, description: 'Extracts SEC 10-K filings and synthesizes financial metrics with zero hallucination.', tags: ['Finance', 'SEC 10-K', 'RAG'] }
];

export const AgentMarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = MARKETPLACE_AGENTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Enterprise Agent Marketplace</h1>
          <p className="text-muted-foreground text-sm">
            Discover, publish, clone, and deploy verified multi-agent DAG workflows across your organization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Agents..."
              className="pl-9 pr-4 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-none focus:border-primary placeholder:text-muted-foreground w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((agent) => (
          <div key={agent.id} className="glass-card glass-card-hover p-6 rounded-2xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{agent.name}</h3>
                    <div className="text-xs text-muted-foreground font-mono">{agent.author}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{agent.rating}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                {agent.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {agent.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full bg-muted text-[10px] font-mono text-muted-foreground border border-border/40">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{agent.installs.toLocaleString()} Installs</span>
              <button
                onClick={() => alert(`Cloned ${agent.name} into your workspace!`)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Agent</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
