import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  NodeResizer,
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
  X,
  MemoryStick,
  Undo2,
  Redo2,
  Move,
  ArrowDown,
  Server,
  Activity,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { useLiveTelemetryStore } from '../store/useLiveTelemetryStore';

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

// ─── Custom Agent Node Component with Real NodeResizer ───────────────────────
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
        width: '100%',
        height: '100%',
        minWidth: 200,
        minHeight: 90,
        transition: 'all 0.15s ease',
      }}
      className="px-4 py-3 select-none flex flex-col justify-between relative group"
    >
      <NodeResizer
        color={meta.color}
        isVisible={selected}
        minWidth={190}
        minHeight={85}
        lineStyle={{ strokeWidth: 1.5 }}
        handleStyle={{ width: 8, height: 8, borderRadius: 3, background: meta.color, borderColor: '#080c14' }}
      />

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
  
  // Execution & deployment states
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const nodeIdCounter = useRef(100);

  // 1-Click Deployment Pipeline Modal state
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deployStage, setDeployStage] = useState<number>(0);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState<{ nodes: Node<AgentNodeData>[]; edges: Edge[] }[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const isUndoRedoAction = useRef(false);

  const addNotification = useNotificationStore((state) => state.addNotification);
  const registerDeployedAgent = useLiveTelemetryStore((state) => state.registerDeployedAgent);

  // Save state to History Stack
  const saveStateToHistory = useCallback((currentNodes: Node<AgentNodeData>[], currentEdges: Edge[]) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setHistoryStack(prev => {
      const sliced = prev.slice(0, historyPointer + 1);
      return [...sliced, { nodes: currentNodes, edges: currentEdges }];
    });
    setHistoryPointer(prev => prev + 1);
  }, [historyPointer]);

  useEffect(() => {
    if (historyStack.length === 0) {
      setHistoryStack([{ nodes: INITIAL_NODES, edges: INITIAL_EDGES }]);
      setHistoryPointer(0);
    }
  }, [historyStack.length]);

  const handleUndo = useCallback(() => {
    if (historyPointer > 0) {
      isUndoRedoAction.current = true;
      const prevPointer = historyPointer - 1;
      const targetState = historyStack[prevPointer];
      setNodes(targetState.nodes);
      setEdges(targetState.edges);
      setHistoryPointer(prevPointer);
      addNotification({
        type: 'workflow',
        title: 'Undo Action',
        description: 'Restored previous canvas layout state.',
      });
    }
  }, [historyPointer, historyStack, setNodes, setEdges, addNotification]);

  const handleRedo = useCallback(() => {
    if (historyPointer < historyStack.length - 1) {
      isUndoRedoAction.current = true;
      const nextPointer = historyPointer + 1;
      const targetState = historyStack[nextPointer];
      setNodes(targetState.nodes);
      setEdges(targetState.edges);
      setHistoryPointer(nextPointer);
      addNotification({
        type: 'workflow',
        title: 'Redo Action',
        description: 'Applied redone canvas layout state.',
      });
    }
  }, [historyPointer, historyStack.length, historyStack, setNodes, setEdges, addNotification]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const meta = sourceNode ? NODE_META[(sourceNode.data as AgentNodeData).nodeType] : null;
    const newEdges = addEdge({
      ...params,
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: meta?.color || '#6366f1', strokeWidth: 1.8 },
    }, edges);
    setEdges(newEdges);
    saveStateToHistory(nodes, newEdges);
  }, [nodes, edges, setEdges, saveStateToHistory]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<AgentNodeData>);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setSelectedNode(newNode);
    saveStateToHistory(updatedNodes, edges);
    addNotification({
      type: 'agent',
      title: 'Node Added',
      description: `Added "${label}" node to canvas.`,
    });
  }, [rfInstance, nodes, edges, setNodes, saveStateToHistory, addNotification]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    const updatedNodes = nodes.filter(n => n.id !== selectedNode.id);
    const updatedEdges = edges.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNode(null);
    saveStateToHistory(updatedNodes, updatedEdges);
    addNotification({
      type: 'workflow',
      title: 'Node Deleted',
      description: `Removed "${(selectedNode.data as AgentNodeData).label}" from canvas.`,
    });
  }, [selectedNode, nodes, edges, setNodes, setEdges, saveStateToHistory, addNotification]);

  const updateNodeField = useCallback((field: keyof AgentNodeData, value: string) => {
    if (!selectedNode) return;
    const updated = { ...selectedNode, data: { ...selectedNode.data, [field]: value } };
    setSelectedNode(updated as Node<AgentNodeData>);
    const updatedNodes = nodes.map(n => n.id === selectedNode.id ? updated : n) as Node<AgentNodeData>[];
    setNodes(updatedNodes);
    saveStateToHistory(updatedNodes, edges);
  }, [selectedNode, nodes, edges, setNodes, saveStateToHistory]);

  const simulateExecution = useCallback(() => {
    setSimulating(true);
    setDeployed(false);
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })) as Node<AgentNodeData>[]);

    const orderedIds = nodes.map(n => n.id);
    orderedIds.forEach((id, i) => {
      setTimeout(() => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'running' } } : n) as Node<AgentNodeData>[]);
      }, i * 500);
      setTimeout(() => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'done' } } : n) as Node<AgentNodeData>[]);
        setEdges(eds => eds.map(e => e.source === id ? { ...e, animated: true } : e));
      }, i * 500 + 400);
    });

    setTimeout(() => {
      setSimulating(false);
      addNotification({
        type: 'eval',
        title: 'Simulation Complete',
        description: 'DAG topology executed cleanly across all node paths.',
      });
    }, orderedIds.length * 500 + 500);
  }, [nodes, setNodes, setEdges, addNotification]);

  // ── 1-CLICK DEPLOYMENT PIPELINE (Deploy Workflow → LangGraph → Backend → Running Agent) ──
  const handleOneClickDeploy = useCallback(() => {
    setDeployModalOpen(true);
    setDeployStage(1);

    // Stage 1: Deploy Workflow (Client Validation) -> Stage 2: LangGraph (Compilation)
    setTimeout(() => setDeployStage(2), 700);

    // Stage 2: LangGraph -> Stage 3: Backend (FastAPI Endpoint registration)
    setTimeout(() => setDeployStage(3), 1400);

    // Stage 3: Backend -> Stage 4: Running Agent (Live in Telemetry Swarm)
    setTimeout(() => {
      setDeployStage(4);
      setDeployed(true);
      registerDeployedAgent('Custom LangGraph Swarm Agent', 'Decomposing multi-step workflow DAG across 7 nodes');
      addNotification({
        type: 'workflow',
        title: 'Agent Active in Swarm',
        description: 'Deployed agent registered to live telemetry and Celery queue.',
      });
    }, 2100);
  }, [registerDeployedAgent, addNotification]);

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
      {/* ── Header Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Layers className="w-7 h-7 text-primary" />
            <span>Visual Agent Builder (LangGraph Studio)</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            1-Click Deploy: Deploy Workflow → LangGraph Compilation → FastAPI Backend → Production Running Agent.
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="flex rounded-xl bg-card border border-border/60 p-1 space-x-1">
            <button
              onClick={handleUndo}
              disabled={historyPointer <= 0}
              title="Undo (Ctrl+Z)"
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-white disabled:opacity-30 transition-all"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyPointer >= historyStack.length - 1}
              title="Redo (Ctrl+Y)"
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-white disabled:opacity-30 transition-all"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

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

          {/* 1-CLICK DEPLOY BUTTON */}
          <button
            onClick={handleOneClickDeploy}
            className={`flex items-center space-x-2 px-5 py-2 rounded-xl font-bold text-xs shadow-xl transition-all ${
              deployed
                ? 'bg-emerald-600 text-white shadow-emerald-500/25 hover:bg-emerald-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
            }`}
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>Deploy Workflow</span>
          </button>
        </div>
      </div>

      {/* ── Main Area ─────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Left Drag & Drop Palette ─────────────────────────────────── */}
        <div className="w-48 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 pb-1 border-b border-border/40 flex items-center justify-between">
            <span>Node Palette</span>
            <Move className="w-3 h-3 text-primary" />
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
                className="flex items-center space-x-2 p-2.5 rounded-xl border cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all select-none group"
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
          className="flex-1 rounded-2xl overflow-hidden border border-border/40 relative"
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
            deleteKeyCode={['Delete', 'Backspace']}
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

            <Panel position="top-center">
              <div className="flex items-center space-x-4 px-4 py-2 rounded-xl text-[10px] font-mono shadow-xl"
                style={{ background: '#0f1520cc', border: '1px solid #1e2a3a', backdropFilter: 'blur(8px)' }}>
                <span className="text-muted-foreground">Nodes: <span className="text-primary font-bold">{nodes.length}</span></span>
                <span className="text-muted-foreground">Edges: <span className="text-primary font-bold">{edges.length}</span></span>
                <span className="text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>DAG Valid</span>
                </span>
                <span className="text-muted-foreground opacity-80">⌘Z Undo · ⌘Y Redo · Drag handles to resize</span>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* ── Right Inspector ───────────────────────────────────── */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-3">
          {selectedNode && selData && selMeta ? (
            <>
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
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Node Label</label>
                    <input
                      type="text"
                      value={selData.label}
                      onChange={e => updateNodeField('label', e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-xl text-[11px] font-medium text-white focus:outline-none"
                      style={{ background: '#ffffff10', border: `1px solid ${selMeta.border}40` }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Config Parameter</label>
                    <input
                      type="text"
                      value={selData.config}
                      onChange={e => updateNodeField('config', e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 rounded-xl text-[11px] font-medium focus:outline-none"
                      style={{ background: '#ffffff10', border: `1px solid ${selMeta.border}40`, color: selMeta.color }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground uppercase">Agent Category</label>
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
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected Node</span>
                </button>
              </div>

              <div className="rounded-xl border border-border/40 p-3 text-[10px] font-mono space-y-1" style={{ background: '#0f1520' }}>
                <div className="text-muted-foreground uppercase tracking-wider font-bold mb-1.5">DAG Connections</div>
                <div className="text-muted-foreground">
                  Inbound Edges: <span className="text-primary font-bold">{edges.filter(e => e.target === selectedNode.id).length}</span>
                </div>
                <div className="text-muted-foreground">
                  Outbound Edges: <span className="text-primary font-bold">{edges.filter(e => e.source === selectedNode.id).length}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border/40 p-4 text-center space-y-2" style={{ background: '#0f1520' }}>
              <Settings className="w-6 h-6 text-muted-foreground/40 mx-auto" />
              <div className="text-xs text-muted-foreground font-mono">Click any node to inspect & edit</div>
            </div>
          )}

          <div className="rounded-2xl border border-border/40 p-4 space-y-2 text-[10px] font-mono text-muted-foreground" style={{ background: '#0f1520' }}>
            <div className="font-bold text-white text-[11px] mb-2 uppercase tracking-wider">Deployment Pipeline</div>
            <div className="flex items-center space-x-1 text-primary font-bold"><span>1. Deploy Workflow</span></div>
            <div className="pl-3 text-[9px]">↓</div>
            <div className="flex items-center space-x-1 text-purple-400 font-bold"><span>2. LangGraph Compilation</span></div>
            <div className="pl-3 text-[9px]">↓</div>
            <div className="flex items-center space-x-1 text-blue-400 font-bold"><span>3. FastAPI Backend</span></div>
            <div className="pl-3 text-[9px]">↓</div>
            <div className="flex items-center space-x-1 text-emerald-400 font-bold"><span>4. Running Agent Swarm</span></div>
          </div>
        </div>
      </div>

      {/* ────────────────── 1-CLICK DEPLOYMENT PIPELINE MODAL ────────────────── */}
      {deployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="glass-card p-7 rounded-2xl w-full max-w-lg space-y-6 border border-border/60 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setDeployModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-foreground flex items-center justify-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>1-Click Agent Deployment Pipeline</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Deploying LangGraph DAG to production Celery swarm & active telemetry pool.
              </p>
            </div>

            {/* Visual 4-Step Pipeline Flow: Deploy Workflow → LangGraph → Backend → Running Agent */}
            <div className="space-y-3 relative py-2">
              
              {/* Step 1: Deploy Workflow */}
              <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                deployStage >= 1 ? 'bg-primary/10 border-primary text-white' : 'bg-muted/10 border-border/40 text-muted-foreground'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${deployStage >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">1. Deploy Workflow</div>
                    <div className="text-[10px] font-mono opacity-70">Client DAG validation & topological sort</div>
                  </div>
                </div>
                {deployStage > 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : deployStage === 1 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <span className="text-[10px] font-mono opacity-50">Pending</span>
                )}
              </div>

              <div className="flex justify-center text-muted-foreground">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Step 2: LangGraph */}
              <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                deployStage >= 2 ? 'bg-purple-500/10 border-purple-500 text-white' : 'bg-muted/10 border-border/40 text-muted-foreground'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${deployStage >= 2 ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">2. LangGraph Engine</div>
                    <div className="text-[10px] font-mono opacity-70">Compiling state graph nodes & routing conditions</div>
                  </div>
                </div>
                {deployStage > 2 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : deployStage === 2 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                ) : (
                  <span className="text-[10px] font-mono opacity-50">Pending</span>
                )}
              </div>

              <div className="flex justify-center text-muted-foreground">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Step 3: Backend */}
              <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                deployStage >= 3 ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-muted/10 border-border/40 text-muted-foreground'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${deployStage >= 3 ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">3. FastAPI Backend</div>
                    <div className="text-[10px] font-mono opacity-70">Registering REST & SSE execution endpoints</div>
                  </div>
                </div>
                {deployStage > 3 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : deployStage === 3 ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                ) : (
                  <span className="text-[10px] font-mono opacity-50">Pending</span>
                )}
              </div>

              <div className="flex justify-center text-muted-foreground">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Step 4: Running Agent */}
              <div className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                deployStage >= 4 ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-muted/10 border-border/40 text-muted-foreground'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${deployStage >= 4 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">4. Running Agent Swarm</div>
                    <div className="text-[10px] font-mono opacity-70">Active in live telemetry pool & ready for execution</div>
                  </div>
                </div>
                {deployStage >= 4 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40">LIVE</span>
                ) : (
                  <span className="text-[10px] font-mono opacity-50">Pending</span>
                )}
              </div>
            </div>

            {/* Post-Deployment Actions */}
            {deployStage >= 4 && (
              <div className="space-y-3 pt-2 animate-fade-in border-t border-border/40">
                <div className="p-3 rounded-xl bg-black/40 border border-border/60 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                  <span className="truncate pr-2">POST /api/v1/agents/execute-dag</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('https://aios.enterprise/api/v1/agents/execute-dag');
                      setCopiedEndpoint(true);
                      setTimeout(() => setCopiedEndpoint(false), 1500);
                    }}
                    className="p-1 hover:text-white"
                  >
                    {copiedEndpoint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setDeployModalOpen(false);
                      window.location.href = '/dashboard';
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Activity className="w-4 h-4" />
                    <span>View in Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setDeployModalOpen(false);
                      window.location.href = '/playground';
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Test in Playground</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Exported page (wrapped in ReactFlowProvider) ────────────────────────────
export const AgentBuilderPage: React.FC = () => (
  <ReactFlowProvider>
    <AgentBuilderInner />
  </ReactFlowProvider>
);
