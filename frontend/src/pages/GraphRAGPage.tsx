import React, { useState } from 'react';
import {
  Network,
  Database,
  Search,
  Layers,
  Sparkles,
  GitCommit,
  Share2,
  FileText,
  CheckCircle2
} from 'lucide-react';

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'entity' | 'document' | 'concept';
  connections: number;
}

const SAMPLE_NODES: KnowledgeNode[] = [
  { id: '1', label: 'SOC-2 Compliance Framework', type: 'document', connections: 14 },
  { id: '2', label: 'FastAPI Async Pipeline', type: 'concept', connections: 8 },
  { id: '3', label: 'Neo4j Graph Database Engine', type: 'entity', connections: 22 },
  { id: '4', label: 'LangGraph State Machine', type: 'concept', connections: 19 },
  { id: '5', label: 'Qdrant Hybrid Vector Store', type: 'entity', connections: 31 },
];

export const GraphRAGPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = SAMPLE_NODES.filter(n =>
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Graph RAG & Knowledge Graph Engine</h1>
        <p className="text-muted-foreground text-sm">
          Hybrid entity-relation traversal combining Neo4j graph structures with Qdrant vector embeddings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Entity & Node Search */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter Knowledge Graph Nodes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className="p-3.5 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/60 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Network className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">{node.label}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-mono">{node.type}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
                  {node.connections} edges
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Knowledge Graph Interactive Canvas Placeholder */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[450px] relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold">Neo4j Entity Traversal Canvas</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
              14,820 Nodes Connected
            </span>
          </div>

          {/* Node Graph Mock Visualization */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-2xl shadow-purple-500/30 animate-pulse mb-6">
              <Network className="w-12 h-12" />
            </div>

            <h4 className="text-lg font-bold mb-2">Graph RAG Hybrid Traversal Active</h4>
            <p className="text-xs text-muted-foreground max-w-md mb-6">
              Vector semantic embeddings and Knowledge Graph edge relations are dynamically cross-referenced during agent retrieval calls.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono text-muted-foreground">
                Neo4j Bolt: Connected
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono text-muted-foreground">
                Qdrant Collection: active-nodes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
