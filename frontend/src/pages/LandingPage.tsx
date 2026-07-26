import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Bot,
  Network,
  Database,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Terminal,
  Activity,
  ArrowDown,
  CheckCircle2,
  Cpu,
  Play,
  RotateCcw,
  Layers,
  Zap,
  Check,
  Code2,
} from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { NeuralCanvas } from '../components/common/NeuralCanvas';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Live Ping Latency & Real Metric Counters
  const [livePingMs, setLivePingMs] = useState<number>(0);
  const [neo4jNodesCount, setNeo4jNodesCount] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Interactive Demo State
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState<boolean>(false);

  // 1. Live Agent Execution Pipeline Sequence for Hero
  const workflowSteps = [
    {
      id: 'planner',
      name: 'Planner Agent',
      icon: BrainCircuit,
      role: 'Task Decomposition',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/50',
      shadowColor: 'shadow-blue-500/20',
      detail: 'Decomposing Enterprise Goal into LangGraph DAG'
    },
    {
      id: 'retriever',
      name: 'Retriever Agent',
      icon: Network,
      role: 'Graph RAG Search',
      color: 'from-purple-500 to-indigo-500',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/50',
      shadowColor: 'shadow-purple-500/20',
      detail: 'Traversing Neo4j Graph Entities & Qdrant Vectors'
    },
    {
      id: 'python_tool',
      name: 'Python Tool',
      icon: Terminal,
      role: 'Sandbox Execution',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      shadowColor: 'shadow-emerald-500/20',
      detail: 'Executing Python Sandbox Code & REST Tools'
    },
    {
      id: 'reasoning',
      name: 'Reasoning Agent',
      icon: Cpu,
      role: 'Factuality Analysis',
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      shadowColor: 'shadow-amber-500/20',
      detail: 'Performing Factuality Verification & Reflection'
    },
    {
      id: 'critic',
      name: 'Critic Agent',
      icon: ShieldCheck,
      role: 'Benchmark Scoring',
      color: 'from-pink-500 to-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/50',
      shadowColor: 'shadow-rose-500/20',
      detail: 'Scoring Output Quality via RAGAS & DeepEval'
    },
    {
      id: 'response',
      name: 'Response Agent',
      icon: Bot,
      role: 'Synthesis & Citations',
      color: 'from-indigo-500 to-blue-600',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/50',
      shadowColor: 'shadow-indigo-500/20',
      detail: 'Synthesizing Response with Exact Citations [1]'
    }
  ];

  // 2. Interactive Sample Workflow Sequence requested by User
  const sampleDemoSteps = [
    {
      name: 'Planner',
      icon: BrainCircuit,
      detail: 'DAG Topological Decomposition',
      thought: 'Analyzing user prompt semantics... Breaking subgoals into atomic DAG execution nodes.'
    },
    {
      name: 'Retriever',
      icon: Network,
      detail: 'Vector Dense Embedding Search',
      thought: 'Generating query embeddings... Executing HNSW vector similarity search in Qdrant.'
    },
    {
      name: 'Neo4j',
      icon: Database,
      detail: 'Knowledge Graph Traversal',
      thought: 'Traversing 3-hop entity relationship graph... Matching 14,820 nodes with Cypher.'
    },
    {
      name: 'Python',
      icon: Terminal,
      detail: 'Isolated MCP Sandbox Exec',
      thought: 'Spawning sandboxed Python container... Running compliance auditing & numerical computations.'
    },
    {
      name: 'GPT',
      icon: Sparkles,
      detail: 'Multi-Modal Reasoning Chain',
      thought: 'Synthesizing multi-hop reasoning chain across retrieved context... Factual confidence: 99.4%.'
    },
    {
      name: 'Response',
      icon: Bot,
      detail: 'Markdown & IEEE Citations',
      thought: 'Composing structured executive summary... Appending IEEE source citations [1] [2].'
    }
  ];

  // Live Ping Latency & Real Metrics Polling
  useEffect(() => {
    const fetchLivePingAndStats = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/healthz');
        const end = performance.now();
        if (res.ok) {
          setLivePingMs(Math.max(1, Math.round(end - start)));
        }
      } catch {
        setLivePingMs(0);
      }

      try {
        const token = localStorage.getItem('aios_access_token');
        const metricsRes = await fetch('/api/v1/observability/system-telemetry', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          if (metricsData.infrastructure?.neo4j_nodes_count !== undefined) {
            setNeo4jNodesCount(metricsData.infrastructure.neo4j_nodes_count);
          }
        }
      } catch {
        // Fallback
      }
    };

    fetchLivePingAndStats();
    const pingInterval = setInterval(fetchLivePingAndStats, 3000);
    return () => clearInterval(pingInterval);
  }, []);

  // Hero Animated Agent Flow Timeline Cycle
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % workflowSteps.length);
    }, 1500);
    return () => clearInterval(stepInterval);
  }, [workflowSteps.length]);

  // Interactive Demo Step Advancement
  useEffect(() => {
    if (!isWorkflowRunning) return;

    const interval = setInterval(() => {
      setDemoStepIndex((prev) => {
        if (prev >= sampleDemoSteps.length - 1) {
          setIsWorkflowRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isWorkflowRunning, sampleDemoSteps.length]);

  const handleExecuteSampleWorkflow = () => {
    setDemoStepIndex(0);
    setIsWorkflowRunning(true);
  };

  return (
    <AuroraBackground className="min-h-screen font-sans selection:bg-primary/30 relative">
      <NeuralCanvas />

      {/* Top Header Navbar */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-wider gradient-text">
            AIOS
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-300">
          <a href="#trusted" className="hover:text-blue-400 transition-colors">Stack</a>
          <a href="#architecture" className="hover:text-blue-400 transition-colors">Architecture</a>
          <a href="#demo" className="hover:text-blue-400 transition-colors">Live Demo</a>
          <a href="#features" className="hover:text-blue-400 transition-colors">Modules</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="gradient" size="sm" onClick={() => navigate('/register')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-16 text-center relative z-20">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-lg shadow-blue-500/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Next-Gen Enterprise Multi-Agent AI Operating System</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Orchestrate Autonomous <br />
          <span className="gradient-text">AI Agent Networks</span> at Scale.
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-10">
          AIOS bridges Graph RAG, Semantic Memory, Tool Abstraction, and Multi-LLM Orchestration into a unified operating system built for enterprise AI systems engineers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            variant="gradient"
            size="lg"
            onClick={() => navigate('/register')}
            rightIcon={<UserPlus className="w-5 h-5" />}
            className="w-full sm:w-auto shadow-2xl"
          >
            Create Enterprise Account
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate('/login')}
            leftIcon={<ShieldCheck className="w-5 h-5 text-indigo-400" />}
            className="w-full sm:w-auto"
          >
            Sign In to Workspace
          </Button>
        </div>

        {/* Live Interactive Workflow & Real-Time Metrics Container */}
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 via-purple-500/20 to-gray-800/40 shadow-2xl text-left">
          <div className="bg-[#0b0f19]/95 rounded-2xl overflow-hidden border border-white/10 p-6 md:p-8 backdrop-blur-xl space-y-6">
            
            {/* Live Metrics Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-gray-400 ml-2">aios-cluster-node-01 // active-dag: #89201</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span>Connected Neo4j Nodes: {neo4jNodesCount.toLocaleString()}</span>
                </div>

                <Badge variant="success" pulse>
                  ⚡ SYSTEM OPTIMAL ({livePingMs}ms live ping)
                </Badge>
              </div>
            </div>

            {/* Real-Time Animated Multi-Agent Workflow Sequence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider pb-1">
                <span>Live Multi-Agent Workflow Execution Pipeline</span>
                <span className="text-blue-400 font-bold">Step {activeStepIndex + 1} of 6 Active</span>
              </div>

              {/* Animated Agent Pipeline Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {workflowSteps.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  const isPassed = idx < activeStepIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center space-y-2 relative">
                      <div
                        className={`w-full p-4 rounded-xl border transition-all duration-500 space-y-2 relative overflow-hidden ${
                          isActive
                            ? `bg-white/10 ${step.borderColor} ring-2 ring-[inherit] ${step.shadowColor} shadow-xl scale-105 z-10`
                            : isPassed
                            ? 'bg-white/5 border-emerald-500/30 text-gray-300'
                            : 'bg-white/5 border-white/10 text-gray-500 opacity-60'
                        }`}
                      >
                        {isActive && (
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} animate-pulse`} />
                        )}

                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-tr ${step.color} text-white` : 'bg-white/10 text-gray-400'}`}>
                            <StepIcon className="w-4 h-4" />
                          </div>
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : isActive ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                          ) : null}
                        </div>

                        <div>
                          <div className={`text-xs font-bold ${isActive ? step.textColor : 'text-gray-200'}`}>
                            {step.name}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">{step.role}</div>
                        </div>
                      </div>

                      {idx < workflowSteps.length - 1 && (
                        <div className="hidden lg:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                          <ArrowRight className={`w-4 h-4 ${idx <= activeStepIndex ? 'text-blue-400 animate-pulse' : 'text-gray-700'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Step Details Bar */}
              <div className="p-3.5 rounded-xl bg-[#070a11] border border-white/10 flex items-center justify-between font-mono text-xs text-gray-300 shadow-inner">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span className="text-blue-400 font-bold">{workflowSteps[activeStepIndex].name}:</span>
                  <span>{workflowSteps[activeStepIndex].detail}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Auto-cycling • 1.5s step interval
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 1. Trusted By / Technology Stack Section ──────────────────────────────── */}
      <section id="trusted" className="max-w-6xl mx-auto px-6 py-12 text-center relative z-20 border-t border-b border-white/10 my-8">
        <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">
          POWERED BY ENTERPRISE-GRADE TECH STACK
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 items-center justify-center">
          {[
            { name: 'OpenAI', role: 'GPT-4o Gateway', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
            { name: 'LangGraph', role: 'State Orchestration', color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30' },
            { name: 'Neo4j', role: 'Knowledge Graph', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30' },
            { name: 'Qdrant', role: 'Vector Store', color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30' },
            { name: 'FastAPI', role: 'Async REST Server', color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30' },
            { name: 'Docker', role: 'Container Swarm', color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30' },
            { name: 'React', role: 'Frontend SPA', color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30' },
          ].map((tech) => (
            <div
              key={tech.name}
              className={`p-4 rounded-2xl bg-gradient-to-br ${tech.color} border backdrop-blur-md flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-all duration-300 shadow-lg`}
            >
              <span className="font-extrabold text-sm tracking-tight text-white">{tech.name}</span>
              <span className="text-[10px] font-mono opacity-80">{tech.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Platform Architecture Diagram Section ──────────────────────────────── */}
      <section id="architecture" className="max-w-6xl mx-auto px-6 py-20 relative z-20 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Clean Architecture & Domain Driven Design</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          AIOS Platform <span className="gradient-text">Layered Architecture</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm mb-12">
          End-to-end request flow from browser clients through agents and knowledge graphs to LLMs.
        </p>

        {/* Vertical Stack Architecture Diagram */}
        <div className="max-w-3xl mx-auto space-y-3 font-mono">
          {[
            { step: 'Browser', label: 'Browser Client / Single-Port SPA UI', detail: 'React 18 + Vite + Tailwind CSS + SSE Stream Listener', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
            { step: 'AIOS', label: 'AIOS Core Platform & REST/SSE Gateway', detail: 'FastAPI Async Server + Middleware + OpenTelemetry Tracing', color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' },
            { step: 'Agents', label: 'Multi-Agent LangGraph Swarm Engine', detail: 'Planner, Retriever, Tool, Reasoning, Critic & Response Nodes', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
            { step: 'Graph RAG', label: 'Graph RAG & Entity Fusion Layer', detail: 'Reciprocal Rank Fusion (RRF) + Hybrid Sub-graph Traversal', color: 'border-pink-500/40 bg-pink-500/10 text-pink-300' },
            { step: 'Knowledge Graph', label: 'Knowledge Graph & Vector Persistence', detail: 'Neo4j 14.8K Nodes + Qdrant 3.8K HNSW Vectors + Postgres 16', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
            { step: 'LLMs', label: 'Multi-Provider Universal Model Gateway', detail: 'OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro / Llama 3 70B', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
          ].map((archNode, idx, arr) => (
            <React.Fragment key={archNode.step}>
              <div className={`p-4.5 rounded-2xl border ${archNode.color} backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.02]`}>
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-white shrink-0">
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <span className="font-extrabold text-base text-white">{archNode.step}</span>
                    <span className="hidden md:inline-block text-xs opacity-75 ml-2">• {archNode.label}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-300 font-sans text-left md:text-right">{archNode.detail}</span>
              </div>

              {idx < arr.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="p-1 rounded-full bg-white/5 border border-white/10 text-blue-400 animate-bounce">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── 3. Interactive Workflow Demo Section ──────────────────────────────── */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-20 relative z-20 text-center border-t border-white/10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Execution Sandbox</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Interactive Sample <span className="gradient-text">Workflow Execution</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm mb-8">
          Click below to run an animated execution of a sample multi-agent workflow step-by-step.
        </p>

        {/* Execution Control Button */}
        <div className="flex justify-center mb-10">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleExecuteSampleWorkflow}
            leftIcon={isWorkflowRunning ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 text-white" />}
            className="shadow-2xl px-8"
          >
            {isWorkflowRunning ? 'Restart Sample Workflow' : 'Execute Sample Workflow'}
          </Button>
        </div>

        {/* Interactive Execution Terminal */}
        <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-3xl bg-[#090d16]/90 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <span className={`w-3 h-3 rounded-full ${isWorkflowRunning ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
              <span className="font-mono text-sm font-bold text-white">
                Workflow Status: {demoStepIndex === sampleDemoSteps.length - 1 && !isWorkflowRunning ? 'Completed' : `Running Step ${demoStepIndex + 1} / ${sampleDemoSteps.length}`}
              </span>
            </div>
            <Badge variant={demoStepIndex === sampleDemoSteps.length - 1 && !isWorkflowRunning ? 'success' : 'info'}>
              {sampleDemoSteps[demoStepIndex].name}
            </Badge>
          </div>

          {/* 6 Step Horizontal Pipeline: Planner -> Retriever -> Neo4j -> Python -> GPT -> Response */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {sampleDemoSteps.map((step, idx) => {
              const isActive = idx === demoStepIndex;
              const isCompleted = idx < demoStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.name} className="flex flex-col items-center space-y-2 relative">
                  <div
                    className={`w-full p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-2 relative overflow-hidden ${
                      isActive
                        ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/50 shadow-lg scale-105 z-10'
                        : isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-500 opacity-60'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-gray-400'}`}>
                        <StepIcon className="w-4 h-4" />
                      </div>
                      {isCompleted ? (
                        <Check className="w-4 h-4 text-emerald-400 font-bold" />
                      ) : isActive ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
                      ) : null}
                    </div>

                    <div>
                      <div className={`text-xs font-bold ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-300' : 'text-gray-300'}`}>
                        {step.name}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 truncate">{step.detail}</div>
                    </div>
                  </div>

                  {idx < sampleDemoSteps.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                      <ArrowRight className={`w-4 h-4 ${idx <= demoStepIndex ? 'text-blue-400 animate-pulse' : 'text-gray-700'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live Thought Stream Box */}
          <div className="p-4 rounded-xl bg-[#04060b] border border-white/10 font-mono text-xs text-gray-300 space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-[10px]">
              <span>LIVE LOG STREAM</span>
              <span>Node: {sampleDemoSteps[demoStepIndex].name}</span>
            </div>
            <div className="text-emerald-400 font-bold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{sampleDemoSteps[demoStepIndex].thought}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Specs */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-20 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Enterprise Module Architecture
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            Modular components designed according to Domain-Driven Design (DDD) & Clean Architecture principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card variant="glass" className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Multi-Agent Engine</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Specialized Planner, Retriever, Reasoning, Critic, Tool, and Response agents interacting through LangGraph state graphs.
            </p>
          </Card>

          <Card variant="glass" className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Graph RAG & Memory</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Hybrid vector search combined with Neo4j entity graph relationships for zero-hallucination context retrieval.
            </p>
          </Card>

          <Card variant="glass" className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Universal Model Gateway</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Multi-provider LLM abstraction layer supporting OpenAI GPT-4o, Anthropic Claude 3.5, Google Gemini 1.5, and Llama 3.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 relative z-20">
        <div>© 2026 AIOS Platform. The Enterprise Multi-Agent AI Platform.</div>
        <div className="flex space-x-6 mt-4 md:mt-0 font-mono">
          <span>React 18</span>
          <span>FastAPI</span>
          <span>Neo4j</span>
          <span>Qdrant</span>
          <span>LangGraph</span>
        </div>
      </footer>
    </AuroraBackground>
  );
};
