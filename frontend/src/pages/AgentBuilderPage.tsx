import React, { useState } from 'react';
import {
  Bot,
  Play,
  Share2,
  Sliders,
  Sparkles,
  Plus,
  ArrowRight,
  Database,
  Network,
  Cpu,
  Layers,
  CheckCircle2,
  Terminal,
  Code2,
  Globe,
  FileText
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface VisualNode {
  id: string;
  name: string;
  type: 'planner' | 'retriever' | 'reasoning' | 'tool' | 'memory';
  status: 'idle' | 'executing' | 'completed';
  config: string;
}

export const AgentBuilderPage: React.FC = () => {
  const [nodes, setNodes] = useState<VisualNode[]>([
    { id: 'node-1', name: 'Task Decomposition Planner', type: 'planner', status: 'completed', config: 'LangGraph DAG Generator' },
    { id: 'node-2', name: 'Neo4j Graph RAG Retriever', type: 'retriever', status: 'executing', config: 'HNSW Vector + Entity Traversal' },
    { id: 'node-3', name: 'Multi-LLM Reasoning Engine', type: 'reasoning', status: 'idle', config: 'GPT-4o / Claude 3.5 Sonnet' },
    { id: 'node-4', name: 'Python Sandbox Tool Executor', type: 'tool', status: 'idle', config: 'MCP Protocol REST / Code' }
  ]);

  const [selectedNode, setSelectedNode] = useState<VisualNode>(nodes[0]);
  const [isBuilding, setIsBuilding] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Visual No-Code Agent Builder</h1>
          <p className="text-muted-foreground text-sm">
            Construct, configure, and publish multi-agent workflow graphs with conditional routing and tool bindings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setIsBuilding(true);
              setTimeout(() => setIsBuilding(false), 1000);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBuilding ? 'Validating Graph...' : 'Deploy Agent Workflow'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Canvas & Node Map */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-6 relative min-h-[450px]">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold">LangGraph Execution DAG Canvas</h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
              DAG Validated: 0 Cycles
            </span>
          </div>

          {/* Node Flow Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {nodes.map((node, index) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                  selectedNode.id === node.id
                    ? 'bg-primary/10 border-primary shadow-xl ring-1 ring-primary'
                    : 'bg-muted/30 border-border/40 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{node.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">{node.type}</div>
                    </div>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    node.status === 'completed' ? 'bg-emerald-400' : node.status === 'executing' ? 'bg-amber-400 animate-ping' : 'bg-gray-600'
                  }`} />
                </div>

                <div className="text-xs text-muted-foreground font-mono pt-2 border-t border-border/30">
                  Config: {node.config}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Node Inspector & Tool Palette */}
        <div className="lg:col-span-4 space-y-6">
          {selectedNode && (
            <Card variant="glass" className="p-6 space-y-4">
              <div className="pb-3 border-b border-border/60">
                <h3 className="text-base font-bold">{selectedNode.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">Type: {selectedNode.type.toUpperCase()}</p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground font-mono">Node Label</label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      const updated = { ...selectedNode, name: e.target.value };
                      setSelectedNode(updated);
                      setNodes(nodes.map(n => n.id === updated.id ? updated : n));
                    }}
                    className="w-full mt-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium focus:outline-none focus:border-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground font-mono">Execution Engine</label>
                  <input
                    type="text"
                    value={selectedNode.config}
                    onChange={(e) => {
                      const updated = { ...selectedNode, config: e.target.value };
                      setSelectedNode(updated);
                      setNodes(nodes.map(n => n.id === updated.id ? updated : n));
                    }}
                    className="w-full mt-1 p-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-medium focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Node Palette */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
              Available Node Palette
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center hover:bg-primary/10 cursor-pointer">
                + Python Sandbox
              </div>
              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center hover:bg-primary/10 cursor-pointer">
                + Neo4j RAG
              </div>
              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center hover:bg-primary/10 cursor-pointer">
                + REST API Call
              </div>
              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center hover:bg-primary/10 cursor-pointer">
                + MCP Tools
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
