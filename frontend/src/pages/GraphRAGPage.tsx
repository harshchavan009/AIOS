import React, { useState } from 'react';
import {
  Network,
  Search,
  Layers,
  Sparkles,
  GitCommit,
  Share2,
  FileText,
  CheckCircle2,
  Database,
  Cpu,
  Info,
  ChevronRight
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

const SAMPLE_NODES: KnowledgeNode[] = [
  { id: '1', label: 'SOC-2 Compliance Framework', type: 'document', connections: 14, description: 'Enterprise security policy and audit controls documentation.', vectorId: 'vec_soc2_8921', confidence: 0.98 },
  { id: '2', label: 'FastAPI Async Pipeline', type: 'concept', connections: 8, description: 'High-throughput ASGI backend request lifecycle.', vectorId: 'vec_fastapi_1042', confidence: 0.95 },
  { id: '3', label: 'Neo4j Graph Database Engine', type: 'entity', connections: 22, description: 'Property graph database powering entity-relation context traversal.', vectorId: 'vec_neo4j_4490', confidence: 0.99 },
  { id: '4', label: 'LangGraph State Machine', type: 'concept', connections: 19, description: 'Cyclic state graph for multi-agent DAG task decomposition.', vectorId: 'vec_langgraph_7711', confidence: 0.97 },
  { id: '5', label: 'Qdrant Hybrid Vector Store', type: 'entity', connections: 31, description: 'High-dimensional vector index for HNSW embedding retrieval.', vectorId: 'vec_qdrant_3012', confidence: 0.99 },
  { id: '6', label: 'LLM Gateway Model Router', type: 'concept', connections: 12, description: 'Provider abstraction engine with automatic fallback hierarchy.', vectorId: 'vec_llm_gateway_0019', confidence: 0.96 }
];

export const GraphRAGPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode>(SAMPLE_NODES[0]);

  const filteredNodes = SAMPLE_NODES.filter((n) => {
    const matchesQuery = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || n.type === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Graph RAG & Knowledge Graph Engine</h1>
          <p className="text-muted-foreground text-sm">
            Hybrid entity-relation traversal combining Neo4j graph structures with Qdrant vector embeddings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="info">Neo4j Bolt: Connected</Badge>
          <Badge variant="success">Qdrant Vector DB: Synced</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Entity & Node Search + Filter Tabs */}
        <div className="lg:col-span-4 glass-card p-5 rounded-2xl space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Graph Nodes & Entities..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs focus:outline-none focus:border-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Type Filter Buttons */}
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

          {/* Node List */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
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
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
                    {node.connections} edges
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Node Details Inspector & Canvas Visualizer */}
        <div className="lg:col-span-8 space-y-6">
          {/* Selected Node Details Card */}
          {selectedNode && (
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/20">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{selectedNode.label}</h3>
                    <span className="text-[11px] text-muted-foreground font-mono uppercase">Node Type: {selectedNode.type}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                  Confidence: {(selectedNode.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedNode.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase">Vector Chunk ID</div>
                  <div className="text-foreground font-bold mt-0.5">{selectedNode.vectorId}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase">Graph Degree</div>
                  <div className="text-primary font-bold mt-0.5">{selectedNode.connections} Relationships</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase">Index Status</div>
                  <div className="text-emerald-400 font-bold mt-0.5">Neo4j Synced</div>
                </div>
              </div>
            </Card>
          )}

          {/* Neo4j Interactive Traversal Canvas */}
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Neo4j Entity Traversal Mesh</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono">
                14,820 Total Entities
              </span>
            </div>

            {/* Interactive Graph Node Representation */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-2xl shadow-purple-500/30 animate-pulse mb-4">
                <Network className="w-10 h-10" />
              </div>

              <h4 className="text-base font-bold mb-1">Entity Relational Graph Active</h4>
              <p className="text-xs text-muted-foreground max-w-md mb-4">
                Selected Node "{selectedNode.label}" is linked to {selectedNode.connections} Graph RAG context entities across Neo4j database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
