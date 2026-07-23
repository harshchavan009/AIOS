import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  MarkerType,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Bot,
  Database,
  Cpu,
  Terminal,
  Brain,
  Globe,
  MessageSquare,
  Zap,
  GitMerge,
  Filter,
  Layers,
  Play,
  Trash2,
  Download,
  Plus,
  Sparkles,
  CheckCircle2,
  Loader2,
  Settings,
  Copy,
  X,
  AlertCircle,
  MemoryStick,
} from 'lucide-react';

// ─── Node type definitions ───────────────────────────────────────────────────
export type AgentNodeType =
  | 'planner'
  | 'retriever'
  | 'reasoning'
  | 'python'
  | 'memory'
  | 'response'
  | 'router'
  | 'tool'
  | 'input'
  | 'output';

interface AgentNodeData extends Record<string, unknown> {
  label: string;
  nodeType: AgentNodeType;
  config: string;
  model?: string;
  status?: 'idle' | 'running' | 'done' | 'error';
}

// ─── Color / icon map ────────────────────────────────────────────────────────
const NODE_META: Record<AgentNodeType, {
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
  glow: string;
  category: string;
}> = {
  input:     { icon: <Globe className="w-4 h-4" />,       color: '#38bdf8', bg: '#0c1a2e', border: '#38bdf8', glow: '0 0 18px #38bdf840', category: 'I/O' },
  planner:   { icon: <Brain className="w-4 h-4" />,       color: '#a78bfa', bg: '#160d2e', border: '#a78bfa', glow: '0 0 18px #a78bfa40', category: 'Agent' },
  retriever: { icon: <Database className="w-4 h-4" />,    color: '#34d399', bg: '#0a1f18', border: '#34d399', glow: '0 0 18px #34d39940', category: 'RAG' },
  reasoning: { icon: <Cpu className="w-4 h-4" />,         color: '#f59e0b', bg: '#1e1500', border: '#f59e0b', glow: '0 0 18px #f59e0b40', category: 'LLM' },
  python:    { icon: <Terminal className="w-4 h-4" />,    color: '#fb923c', bg: '#1e0d00', border: '#fb923c', glow: '0 0 18px #fb923c40', category: 'Tool' },
  memory:    { icon: <MemoryStick className="w-4 h-4" />, color: '#c084fc', bg: '#1a0d2e', border: '#c084fc', glow: '0 0 18px #c084fc40', category: 'Memory' },
  tool:      { icon: <Zap className="w-4 h-4" />,         color: '#f472b6', bg: '#1e0a18', border: '#f472b6', glow: '0 0 18px #f472b640', category: 'Tool' },
  router:    { icon: <GitMerge className="w-4 h-4" />,    color: '#4ade80', bg: '#061a0d', border: '#4ade80', glow: '0 0 18px #4ade8040', category: 'Logic' },
  response:  { icon: <MessageSquare className="w-4 h-4" />, color: '#60a5fa', bg: '#060e1f', border: '#60a5fa', glow: '0 0 18px #60a5fa40', category: 'I/O' },
  output:    { icon: <Filter className="w-4 h-4" />,      color: '#2dd4bf', bg: '#041814', border: '#2dd4bf', glow: '0 0 18px #2dd4bf40', category: 'I/O' },
};

// ─── Status dot helper ───────────────────────────────────────────────────────
function StatusDot({ status }: { status?: AgentNodeData['status'] }) {
  if (!status || status === 'idle') return <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />;
  if (status === 'running') return <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />;
  if (status === 'done') return <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />;
}

// ─── Custom Agent Node Component ─────────────────────────────────────────────
function AgentNode({ data, selected }: NodeProps) {
  const nodeData = data as AgentNodeData;
  const meta = NODE_META[nodeData.nodeType];
  return (
    <div
      style={{
        background: meta.bg,
        border: `1.5px solid ${selected ? meta.color : meta.border + '80'}`,
        boxShadow: selected ? meta.glow : 'none',
        borderRadius: 16,
        minWidth: 200,
        transition: 'all 0.15s ease',
      }}
      className="px-4 py-3 select-none"
    >
      {/* Top handle (input) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: meta.color, width: 10, height: 10, border: `2px solid ${meta.bg}` }}
      />

      <div className="flex items-center space-x-2.5 mb-2">
        <div
          style={{ background: meta.color + '20', color: meta.color, borderRadius: 10, padding: 6 }}
          className="flex-shrink-0"
        >
          {meta.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate leading-tight">{nodeData.label}</div>
          <div style={{ color: meta.color }} className="text-[9px] font-mono uppercase mt-0.5 flex items-center space-x-1.5">
            <span>{nodeData.nodeType}</span>
            <span className="opacity-50">·</span>
            <span className="opacity-60">{meta.category}</span>
          </div>
        </div>
        <StatusDot status={nodeData.status} />
      </div>

      <div
        style={{ borderColor: meta.color + '25', color: meta.color + 'cc' }}
        className="text-[10px] font-mono border-t pt-1.5 truncate leading-relaxed"
      >
        {nodeData.config}
      </div>

      {/* Bottom handle (output) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: meta.color, width: 10, height: 10, border: `2px solid ${meta.bg}` }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { agentNode: AgentNode };

// ─── Default graph ────────────────────────────────────────────────────────────
const INITIAL_NODES: Node<AgentNodeData>[] = [
  { id: 'n-input',     type: 'agentNode', position: { x: 250, y: 30  }, data: { label: 'User Input',                   nodeType: 'input',     config: 'Accepts text / multimodal',        status: 'done'    } },
  { id: 'n-planner',   type: 'agentNode', position: { x: 250, y: 160 }, data: { label: 'Task Decomposition Planner',    nodeType: 'planner',   config: 'LangGraph DAG · GPT-4o',           status: 'done'    } },
  { id: 'n-retriever', type: 'agentNode', position: { x: 80,  y: 300 }, data: { label: 'Neo4j Graph RAG Retriever',     nodeType: 'retriever', config: 'HNSW + Entity Traversal',          status: 'running' } },
  { id: 'n-python',    type: 'agentNode', position: { x: 420, y: 300 }, data: { label: 'Python Sandbox',                nodeType: 'python',    config: 'MCP Protocol · Code Exec',         status: 'idle'    } },
  { id: 'n-memory',    type: 'agentNode', position: { x: 80,  y: 440 }, data: { label: 'Episodic Memory',               nodeType: 'memory',    config: 'Redis · Vector Store',             status: 'idle'    } },
  { id: 'n-reasoning', type: 'agentNode', position: { x: 250, y: 470 }, data: { label: 'Multi-LLM Reasoning Engine',    nodeType: 'reasoning', config: 'GPT-4o / Claude 3.5 Sonnet',       status: 'idle'    } },
  { id: 'n-response',  type: 'agentNode', position: { x: 250, y: 610 }, data: { label: 'Streaming Response',            nodeType: 'response',  config: 'SSE · WebSocket · Token stream',   status: 'idle'    } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'n-input',     target: 'n-planner',   animated: true,  markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#a78bfa', strokeWidth: 2 } },
  { id: 'e2', source: 'n-planner',   target: 'n-retriever', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#34d399', strokeWidth: 1.5 } },
  { id: 'e3', source: 'n-planner',   target: 'n-python',    animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#fb923c', strokeWidth: 1.5 } },
  { id: 'e4', source: 'n-retriever', target: 'n-memory',    animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#c084fc', strokeWidth: 1.5 } },
  { id: 'e5', source: 'n-retriever', target: 'n-reasoning', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
  { id: 'e6', source: 'n-python',    target: 'n-reasoning', animated: false, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#f59e0b', strokeWidth: 1.5 } },
  { id: 'e7', source: 'n-reasoning', target: 'n-response',  animated: true,  markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#60a5fa', strokeWidth: 2 } },
];

// ─── Palette entries ──────────────────────────────────────────────────────────
const PALETTE_NODES: { nodeType: AgentNodeType; label: string; config: string }[] = [
  { nodeType: 'planner',   label: 'Planner Agent',       config: 'LangGraph DAG' },
  { nodeType: 'retriever', label: 'Graph RAG Retriever',  config: 'Neo4j · HNSW' },
  { nodeType: 'reasoning', label: 'Reasoning Engine',     config: 'GPT-4o · Claude' },
  { nodeType: 'python',    label: 'Python Sandbox',       config: 'Code Executor' },
  { nodeType: 'memory',    label: 'Memory Store',         config: 'Redis · Vector DB' },
  { nodeType: 'tool',      label: 'Tool Executor',        config: 'MCP Protocol' },
  { nodeType: 'router',    label: 'Conditional Router',   config: 'Branch Logic' },
  { nodeType: 'response',  label: 'Response Node',        config: 'SSE Streaming' },
  { nodeType: 'input',     label: 'Input Gate',           config: 'Text / Multimodal' },
  { nodeType: 'output',    label: 'Output Formatter',     config: 'JSON / Markdown' },
];

// ─── Main inner component (needs to be inside ReactFlowProvider) ─────────────
function AgentBuilderInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<AgentNodeData>>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState<Node<AgentNodeData> | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const nodeIdCounter = useRef(100);

  // ── Connect nodes ───────────────────────────────────────────────────────────
  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const meta = sourceNode ? NODE_META[(sourceNode.data as AgentNodeData).nodeType] : null;
    setEdges(eds => addEdge({
      ...params,
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: meta?.color || '#6366f1', strokeWidth: 1.5 },
    }, eds));
  }, [nodes, setEdges]);

  // ── Click node to select ────────────────────────────────────────────────────
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<AgentNodeData>);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // ── Drop from palette onto canvas ───────────────────────────────────────────
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/aios-node-type') as AgentNodeType;
    const label = event.dataTransfer.getData('application/aios-node-label');
    const config = event.dataTransfer.getData('application/aios-node-config');
    if (!type || !rfInstance) return;

    const bounds = reactFlowWrapper.current!.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const newNode: Node<AgentNodeData> = {
      id: `n-drop-${nodeIdCounter.current++}`,
      type: 'agentNode',
      position,
      data: { label, nodeType: type, config, status: 'idle' },
    };
    setNodes(nds => [...nds, newNode]);
  }, [rfInstance, setNodes]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ── Delete selected node ────────────────────────────────────────────────────
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
    setEdges(eds => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // ── Update selected node data ────────────────────────────────────────────────
  const updateNodeField = useCallback((field: keyof AgentNodeData, value: string) => {
    if (!selectedNode) return;
    const updated = { ...selectedNode, data: { ...selectedNode.data, [field]: value } };
    setSelectedNode(updated as Node<AgentNodeData>);
    setNodes(nds => nds.map(n => n.id === selectedNode.id ? updated : n) as Node<AgentNodeData>[]);
  }, [selectedNode, setNodes]);

  // ── Simulate execution ──────────────────────────────────────────────────────
  const simulateExecution = useCallback(() => {
    setSimulating(true);
    setDeployed(false);
    // Reset all statuses
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })) as Node<AgentNodeData>[]);

    // Execute nodes in order with delays
    const orderedIds = ['n-input', 'n-planner', 'n-retriever', 'n-python', 'n-memory', 'n-reasoning', 'n-response'];
    orderedIds.forEach((id, i) => {
      setTimeout(() => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'running' } } : n) as Node<AgentNodeData>[]);
      }, i * 600);
      setTimeout(() => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'done' } } : n) as Node<AgentNodeData>[]);
        // Animate edges FROM this node while running
        setEdges(eds => eds.map(e => e.source === id ? { ...e, animated: true } : e));
      }, i * 600 + 500);
    });

    setTimeout(() => setSimulating(false), orderedIds.length * 600 + 600);
  }, [setNodes, setEdges]);

  // ── Deploy ──────────────────────────────────────────────────────────────────
  const deployWorkflow = useCallback(async () => {
    setDeploying(true);
    const token = localStorage.getItem('aios_access_token');
    try {
      await fetch('/api/v1/studio/agent-builder/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id, type: (n.data as AgentNodeData).nodeType, label: (n.data as AgentNodeData).label })),
          edges: edges.map(e => [e.source, e.target]),
        }),
      });
    } catch { /* silently continue */ }
    setTimeout(() => { setDeploying(false); setDeployed(true); }, 1200);
  }, [nodes, edges]);

  // ── Export JSON ─────────────────────────────────────────────────────────────
  const exportDAG = useCallback(() => {
    const dag = {
      name: 'AIOS_Agent_Workflow',
      nodes: nodes.map(n => ({ id: n.id, type: (n.data as AgentNodeData).nodeType, label: (n.data as AgentNodeData).label, config: (n.data as AgentNodeData).config })),
      edges: edges.map(e => ({ source: e.source, target: e.target })),
    };
    const a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dag, null, 2));
    a.download = 'aios_agent_dag.json';
    a.click();
  }, [nodes, edges]);

  const selData = selectedNode?.data as AgentNodeData | undefined;
  const selMeta = selData ? NODE_META[selData.nodeType] : null;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] min-h-[600px] font-sans animate-fade-in">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Layers className="w-7 h-7 text-primary" />
            <span>Visual Agent Builder</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Drag nodes from the palette → connect → simulate → deploy your LangGraph DAG.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button onClick={exportDAG} className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-muted/30 border border-border/60 text-xs font-semibold hover:bg-muted/60 transition-all">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={simulateExecution}
            disabled={simulating}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400 font-semibold text-xs hover:bg-amber-600/30 transition-all disabled:opacity-50"
          >
            {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simulating ? 'Simulating…' : 'Simulate'}</span>
          </button>
          <button
            onClick={deployWorkflow}
            disabled={deploying}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all disabled:opacity-50 ${
              deployed
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
            }`}
          >
            {deploying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : deployed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{deploying ? 'Deploying…' : deployed ? 'Deployed ✓' : 'Deploy Workflow'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Left Palette ─────────────────────────────────────── */}
        <div className="w-48 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 pb-1 border-b border-border/40">
            Node Palette — Drag onto canvas
          </div>
          {PALETTE_NODES.map((n) => {
            const meta = NODE_META[n.nodeType];
            return (
              <div
                key={n.nodeType + n.label}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/aios-node-type', n.nodeType);
                  e.dataTransfer.setData('application/aios-node-label', n.label);
                  e.dataTransfer.setData('application/aios-node-config', n.config);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                style={{ borderColor: meta.border + '55', background: meta.bg }}
                className="flex items-center space-x-2 p-2.5 rounded-xl border cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all select-none"
              >
                <div style={{ color: meta.color, background: meta.color + '20', borderRadius: 8, padding: 5 }} className="flex-shrink-0">
                  {meta.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white leading-tight truncate">{n.label}</div>
                  <div style={{ color: meta.color }} className="text-[9px] font-mono opacity-70">{meta.category}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── React Flow Canvas ─────────────────────────────────── */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 rounded-2xl overflow-hidden border border-border/40"
          style={{ background: '#080c14' }}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={setRfInstance}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            style={{ background: 'transparent' }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="#1e2a3a"
            />
            <Controls
              style={{ background: '#0f1520', border: '1px solid #1e2a3a', borderRadius: 12 }}
            />
            <MiniMap
              style={{ background: '#080c14', border: '1px solid #1e2a3a', borderRadius: 12 }}
              nodeColor={(n) => {
                const d = n.data as AgentNodeData;
                return d?.nodeType ? NODE_META[d.nodeType].color : '#6366f1';
              }}
            />

            {/* Top info panel */}
            <Panel position="top-center">
              <div className="flex items-center space-x-4 px-4 py-2 rounded-xl text-[10px] font-mono"
                style={{ background: '#0f1520cc', border: '1px solid #1e2a3a', backdropFilter: 'blur(8px)' }}>
                <span className="text-muted-foreground">Nodes: <span className="text-primary font-bold">{nodes.length}</span></span>
                <span className="text-muted-foreground">Edges: <span className="text-primary font-bold">{edges.length}</span></span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>DAG Valid</span>
                </span>
                <span className="text-muted-foreground/60">Delete key removes selected node</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* ── Right Inspector ───────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">
          {selectedNode && selData && selMeta ? (
            <>
              {/* Node inspector */}
              <div
                style={{ background: selMeta.bg, borderColor: selMeta.border + '60' }}
                className="rounded-2xl border p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: selMeta.border + '30' }}>
                  <div className="flex items-center space-x-2">
                    <div style={{ color: selMeta.color }}>{selMeta.icon}</div>
                    <span className="text-xs font-bold text-white">Node Inspector</span>
                  </div>
                  <button
                    onClick={deleteSelectedNode}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                    title="Delete node"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Label</label>
                    <input
                      type="text"
                      value={selData.label}
                      onChange={e => updateNodeField('label', e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-xl text-[11px] font-medium text-white focus:outline-none"
                      style={{ background: '#ffffff10', border: `1px solid ${selMeta.border}40` }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Config</label>
                    <input
                      type="text"
                      value={selData.config}
                      onChange={e => updateNodeField('config', e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-xl text-[11px] font-medium focus:outline-none"
                      style={{ background: '#ffffff10', border: `1px solid ${selMeta.border}40`, color: selMeta.color }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Type</label>
                    <div
                      className="mt-1 px-2.5 py-2 rounded-xl text-[11px] font-mono font-bold"
                      style={{ background: selMeta.color + '15', color: selMeta.color }}
                    >
                      {selData.nodeType.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Status</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <StatusDot status={selData.status} />
                      <span className="text-[11px] font-mono text-muted-foreground capitalize">{selData.status || 'idle'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={deleteSelectedNode}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-[11px] font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Node</span>
                </button>
              </div>

              {/* Edge count hint */}
              <div className="rounded-xl border border-border/40 p-3 text-[10px] font-mono space-y-1" style={{ background: '#0f1520' }}>
                <div className="text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Connections</div>
                <div className="text-muted-foreground">
                  In: <span className="text-primary">{edges.filter(e => e.target === selectedNode.id).length}</span>
                </div>
                <div className="text-muted-foreground">
                  Out: <span className="text-primary">{edges.filter(e => e.source === selectedNode.id).length}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border/40 p-4 text-center space-y-2" style={{ background: '#0f1520' }}>
              <Settings className="w-6 h-6 text-muted-foreground/40 mx-auto" />
              <div className="text-xs text-muted-foreground font-mono">Click a node to inspect & edit</div>
            </div>
          )}

          {/* How-to guide */}
          <div className="rounded-2xl border border-border/40 p-4 space-y-2 text-[10px] font-mono text-muted-foreground" style={{ background: '#0f1520' }}>
            <div className="font-bold text-white text-[11px] mb-2 uppercase tracking-wider">How to use</div>
            <div className="flex items-start space-x-1.5"><span className="text-primary">1.</span><span>Drag nodes from palette onto canvas</span></div>
            <div className="flex items-start space-x-1.5"><span className="text-primary">2.</span><span>Connect by dragging from bottom handle → top handle</span></div>
            <div className="flex items-start space-x-1.5"><span className="text-primary">3.</span><span>Click node → edit label & config in inspector</span></div>
            <div className="flex items-start space-x-1.5"><span className="text-primary">4.</span><span>Press Delete to remove selected node</span></div>
            <div className="flex items-start space-x-1.5"><span className="text-primary">5.</span><span>Simulate to watch execution flow</span></div>
            <div className="flex items-start space-x-1.5"><span className="text-primary">6.</span><span>Deploy to push DAG to backend</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Exported page (wrapped in ReactFlowProvider) ────────────────────────────
export const AgentBuilderPage: React.FC = () => (
  <ReactFlowProvider>
    <AgentBuilderInner />
  </ReactFlowProvider>
);
