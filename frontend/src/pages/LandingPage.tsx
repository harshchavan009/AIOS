import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Network,
  Cpu,
  Shield,
  Server,
  KeyRound,
  FileCode2,
  Check,
  ChevronRight,
  Sun,
  Moon,
  ExternalLink,
  Lock,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/useThemeStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeCapability, setActiveCapability] = useState<'orchestration' | 'graph_rag' | 'gateway'>('orchestration');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Sticky Minimal Navigation */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a href="/" className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-semibold text-xs">
                AI
              </div>
              <span className="font-semibold text-sm tracking-tight text-foreground">AIOS</span>
            </a>

            <nav className="hidden md:flex items-center space-x-5 text-xs text-muted-foreground">
              <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
              <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
              <a href="#security" className="hover:text-foreground transition-colors">Deployment</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <button
                type="button"
                onClick={() => navigate('/api-explorer')}
                className="hover:text-foreground transition-colors"
              >
                Docs
              </button>
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-1.5 rounded border border-border bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'graphite' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Hero Section */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 border-b border-border/60">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border bg-secondary/60 text-xs font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>AIOS Enterprise Runtime v1.0 Released</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground leading-[1.12]">
            The production runtime for multi-agent AI systems.
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Orchestrate stateful LangGraph agent swarms, query knowledge with hybrid Graph RAG, and monitor LLM execution with deterministic observability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/register')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Free Trial
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Live Demo Workspace
            </Button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* Real Product UI Showcase Preview */}
        {/* ─────────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16 rounded-lg border border-border bg-card shadow-md overflow-hidden">
          {/* Mock Window Header */}
          <div className="h-9 px-4 border-b border-border bg-secondary/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="ml-3 font-mono text-xs text-foreground/80">aios.enterprise / execution-run-8492</span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                State: Completed
              </span>
              <span className="font-mono text-muted-foreground">340ms • 1,280 tok • $0.0031</span>
            </div>
          </div>

          {/* Product UI Body */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card">
            {/* Left: Execution DAG */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                <span className="font-semibold text-foreground">LangGraph DAG Topology</span>
                <span className="text-muted-foreground font-mono">5 nodes • 4 transitions</span>
              </div>

              {/* Node Sequence Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded border border-border bg-secondary/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">1. Planner</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Done</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Goal decomposition into subtasks</p>
                  <p className="text-[10px] font-mono text-muted-foreground/80 pt-1">Claude 3.5 Sonnet • 420 tok</p>
                </div>

                <div className="p-3 rounded border border-primary/40 bg-primary/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">2. Graph RAG</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Done</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Hybrid Qdrant + Neo4j entity search</p>
                  <p className="text-[10px] font-mono text-muted-foreground/80 pt-1">12 chunks • 4 hops • 42ms</p>
                </div>

                <div className="p-3 rounded border border-border bg-secondary/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">3. Response</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">Done</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Synthesis with grounded citations</p>
                  <p className="text-[10px] font-mono text-muted-foreground/80 pt-1">GPT-4o • 860 tok</p>
                </div>
              </div>

              {/* Execution Trace Table */}
              <div className="rounded border border-border overflow-hidden">
                <div className="bg-secondary/60 px-3 py-1.5 border-b border-border text-[11px] font-medium text-muted-foreground flex justify-between">
                  <span>Step Timeline</span>
                  <span>Latency Breakdown</span>
                </div>
                <div className="divide-y divide-border/60 text-xs">
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-mono text-foreground">dag:planner.decompose</span>
                    <span className="font-mono text-muted-foreground">112ms</span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between bg-secondary/20">
                    <span className="font-mono text-foreground">rag:retriever.hybrid_search</span>
                    <span className="font-mono text-muted-foreground">44ms</span>
                  </div>
                  <div className="px-3 py-2 flex items-center justify-between">
                    <span className="font-mono text-foreground">model:gpt-4o.generate_citations</span>
                    <span className="font-mono text-muted-foreground">184ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: State & Attributes Inspector */}
            <div className="lg:col-span-4 space-y-3 p-3 rounded border border-border bg-secondary/20 text-xs">
              <div className="font-semibold text-foreground pb-1 border-b border-border">
                Run State Variables
              </div>
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-[11px]">Active Workspace</div>
                <div className="font-mono text-foreground text-xs">Acme / Production</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-[11px]">Retrieved Citations</div>
                <div className="font-mono text-foreground text-xs">sec_filing_q3_report.pdf (p.14)</div>
              </div>
              <div className="space-y-1.5">
                <div className="text-muted-foreground text-[11px]">Groundedness Score</div>
                <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs">0.96 / 1.0 (RAGAS Verified)</div>
              </div>
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="xs"
                  className="w-full text-xs"
                  onClick={() => navigate('/dashboard')}
                >
                  Open Full Inspector
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Tech Stack / Standards Proof */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="py-8 border-b border-border/60 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Built on production open-source foundations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-foreground/80">
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-primary" strokeWidth={1.5} />
              LangGraph Multi-Agent
            </span>
            <span className="flex items-center gap-1.5">
              <Network className="w-4 h-4 text-primary" strokeWidth={1.5} />
              Neo4j Graph Database
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-primary" strokeWidth={1.5} />
              Qdrant Vector Engine
            </span>
            <span className="flex items-center gap-1.5">
              <Server className="w-4 h-4 text-primary" strokeWidth={1.5} />
              FastAPI Async Server
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" strokeWidth={1.5} />
              OpenTelemetry Tracing
            </span>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Three Focused Capability Sections with Real UI Imagery */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Core platform capabilities.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Everything required to take autonomous LLM workflows from development into enterprise production.
            </p>
          </div>

          {/* Capability Tabs */}
          <div className="flex justify-center border-b border-border">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveCapability('orchestration')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeCapability === 'orchestration'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                1. Multi-Agent Orchestration
              </button>
              <button
                type="button"
                onClick={() => setActiveCapability('graph_rag')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeCapability === 'graph_rag'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                2. Hybrid Graph RAG
              </button>
              <button
                type="button"
                onClick={() => setActiveCapability('gateway')}
                className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeCapability === 'gateway'
                    ? 'border-primary text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                3. Model Gateway & Router
              </button>
            </div>
          </div>

          {/* Tab Content 1: Multi-Agent Orchestration */}
          {activeCapability === 'orchestration' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Stateful agent DAGs with human-in-the-loop controls.
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Define agent behaviors as deterministic state transitions. AIOS coordinates tasks between Planner, Retriever, Tool Execution, and Critic agents with checkpointed rollback and resume capability.
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Checkpoint-based workflow persistence
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Sandboxed Python and tool execution
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Interactive human approval gates for critical actions
                  </li>
                </ul>
              </div>

              <div className="md:col-span-7 rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                  <span className="font-mono text-muted-foreground">workflow:financial_research_swarm</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground font-medium">3 Agents</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-secondary/50 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">Planner Agent</div>
                      <div className="text-[11px] text-muted-foreground">Input decomposed into 4 execution branches</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">140 tok</span>
                  </div>
                  <div className="p-2.5 rounded bg-secondary/50 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">Financial Analyst Agent</div>
                      <div className="text-[11px] text-muted-foreground">Running EBITDA variance modeling in sandbox</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">620 tok</span>
                  </div>
                  <div className="p-2.5 rounded bg-secondary/50 border border-border/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">Critic & Compliance Agent</div>
                      <div className="text-[11px] text-muted-foreground">Verifying numbers against 10-K SEC filings</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">380 tok</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Hybrid Graph RAG */}
          {activeCapability === 'graph_rag' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Vector search unified with entity graph traversal.
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Traditional vector search retrieves fragments. AIOS executes hybrid queries combining Qdrant dense vector embeddings with Neo4j entity graphs to eliminate hallucinations and retain hierarchical context.
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Multi-hop knowledge graph entity traversals
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Reciprocal Rank Fusion (RRF) reranking
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Verifiable paragraph citations with source spans
                  </li>
                </ul>
              </div>

              <div className="md:col-span-7 rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                  <span className="font-mono text-muted-foreground">rag:hybrid_query_score</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary text-foreground font-medium">Top 3 Chunks</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded bg-secondary/40 border border-border">
                    <div className="flex justify-between items-center text-[11px] text-muted-foreground pb-1">
                      <span>Annual_Report_2024.pdf • Page 28</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Score: 0.94</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      "Operating margins increased by 340 bps driven by cloud infrastructure optimizations and reduced datacenter unit costs..."
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] text-muted-foreground">Entity: Datacenter</span>
                      <span className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] text-muted-foreground">Rel: IMPACTED_BY</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Model Gateway */}
          {activeCapability === 'gateway' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Universal router across OpenAI, Anthropic, and Google.
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Route prompts to Claude 3.5 Sonnet, GPT-4o, or Gemini 1.5 Pro based on latency, context window, and pricing. Transparent per-token cost accounting and automated fallbacks keep applications resilient.
                </p>
                <ul className="space-y-2 text-xs text-foreground/90">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Unified OpenAI-compatible completion API
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Automated provider circuit breaker and failover
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    Detailed token analytics and spend caps
                  </li>
                </ul>
              </div>

              <div className="md:col-span-7 rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                  <span className="font-mono text-muted-foreground">gateway:provider_health</span>
                  <span className="text-xs text-muted-foreground">4 Providers Configured</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-secondary/40 border border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">Claude 3.5 Sonnet (Anthropic)</span>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs">280ms p50 • $0.003/1k</span>
                  </div>
                  <div className="p-2.5 rounded bg-secondary/40 border border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">GPT-4o (OpenAI)</span>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs">310ms p50 • $0.0025/1k</span>
                  </div>
                  <div className="p-2.5 rounded bg-secondary/40 border border-border flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium text-foreground">Gemini 1.5 Pro (Google)</span>
                    </div>
                    <span className="font-mono text-muted-foreground text-xs">340ms p50 • $0.00125/1k</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. Clean Monochrome Vector Architecture Diagram */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="architecture" className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border/60 bg-secondary/20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Layered platform architecture.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Decoupled, modular execution flow from client applications to models and databases.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-lg border border-border bg-card">
            <svg
              viewBox="0 0 900 320"
              className="w-full h-auto text-foreground"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Layer 1: Client Ingress */}
              <rect x="20" y="20" width="240" height="280" rx="6" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.02" />
              <text x="35" y="48" className="fill-foreground font-sans font-semibold text-[13px]">Client & Ingress Layer</text>
              <rect x="35" y="70" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="45" y="94" className="fill-foreground font-sans text-[11px] font-medium">React SPA Frontend</text>
              <text x="45" y="108" className="fill-muted-foreground font-mono text-[9px]">Vite • Single-Link Bundle</text>

              <rect x="35" y="130" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="45" y="154" className="fill-foreground font-sans text-[11px] font-medium">REST API & SSE Client</text>
              <text x="45" y="168" className="fill-muted-foreground font-mono text-[9px]">FastAPI Gateway • OpenAPI</text>

              <rect x="35" y="190" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="45" y="214" className="fill-foreground font-sans text-[11px] font-medium">Python & TS SDKs</text>
              <text x="45" y="228" className="fill-muted-foreground font-mono text-[9px]">Programmatic Orchestration</text>

              {/* Connecting Arrows 1 -> 2 */}
              <path d="M 260 154 L 330 154" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="330,154 324,150 324,158" fill="currentColor" fillOpacity="0.5" />

              {/* Layer 2: Core Runtime */}
              <rect x="330" y="20" width="240" height="280" rx="6" className="stroke-primary" strokeWidth="1.5" fill="currentColor" fillOpacity="0.02" />
              <text x="345" y="48" className="fill-foreground font-sans font-semibold text-[13px]">AIOS Runtime Core</text>
              <rect x="345" y="70" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="355" y="94" className="fill-foreground font-sans text-[11px] font-medium">LangGraph State Machine</text>
              <text x="355" y="108" className="fill-muted-foreground font-mono text-[9px]">Checkpointed Node Transitions</text>

              <rect x="345" y="130" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="355" y="154" className="fill-foreground font-sans text-[11px] font-medium">Celery Task Queue & Redis</text>
              <text x="355" y="168" className="fill-muted-foreground font-mono text-[9px]">Distributed Worker Pool</text>

              <rect x="345" y="190" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="355" y="214" className="fill-foreground font-sans text-[11px] font-medium">Sandbox Execution Engine</text>
              <text x="355" y="228" className="fill-muted-foreground font-mono text-[9px]">Isolated Python Tool Sandbox</text>

              {/* Connecting Arrows 2 -> 3 */}
              <path d="M 570 154 L 640 154" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="640,154 634,150 634,158" fill="currentColor" fillOpacity="0.5" />

              {/* Layer 3: Persistence & Providers */}
              <rect x="640" y="20" width="240" height="280" rx="6" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.02" />
              <text x="655" y="48" className="fill-foreground font-sans font-semibold text-[13px]">Storage & Model Providers</text>
              <rect x="655" y="70" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="665" y="94" className="fill-foreground font-sans text-[11px] font-medium">Neo4j + Qdrant DBs</text>
              <text x="665" y="108" className="fill-muted-foreground font-mono text-[9px]">Graph Entities & Vector Embeddings</text>

              <rect x="655" y="130" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="665" y="154" className="fill-foreground font-sans text-[11px] font-medium">PostgreSQL 16 Storage</text>
              <text x="665" y="168" className="fill-muted-foreground font-mono text-[9px]">Asyncpg • Workspaces • Telemetry</text>

              <rect x="655" y="190" width="210" height="48" rx="4" className="stroke-border" strokeWidth="1" fill="currentColor" fillOpacity="0.04" />
              <text x="665" y="214" className="fill-foreground font-sans text-[11px] font-medium">Universal Model Gateway</text>
              <text x="665" y="228" className="fill-muted-foreground font-mono text-[9px]">OpenAI • Anthropic • Gemini</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. Enterprise Security & Deployment */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="security" className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border/60">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Enterprise deployment options.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Run AIOS in our cloud or deploy in your private cloud with complete data sovereignty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <Server className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-foreground">Self-Hosted Kubernetes</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Deploy onto your own AWS EKS, GCP GKE, or bare-metal cluster with provided Helm charts and Docker compose manifests.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <Lock className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-foreground">VPC Peering & Air-Gap</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Isolate network communications inside your private subnet. Zero telemetry egress with air-gapped configuration.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <KeyRound className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-foreground">Role-Based Access Control</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Enforce granular workspace permissions, API key scoping, audit logs, and SSO integration (SAML, Okta, Azure AD).
              </p>
            </div>

            <div className="p-4 rounded-lg border border-border bg-card space-y-2">
              <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-foreground">Encryption Standards</h3>
              <p className="text-xs text-muted-foreground leading-normal">
                All data encrypted in transit with TLS 1.3 and at rest with AES-256. Bring Your Own Key (BYOK) support available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. Transparent B2B SaaS Pricing */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 border-b border-border/60 bg-secondary/10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
              Predictable, usage-aligned pricing.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Start building locally on single-node setups and scale to enterprise clusters.
            </p>

            <div className="inline-flex items-center p-0.5 rounded border border-border bg-secondary text-xs">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  billingCycle === 'monthly' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Monthly billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  billingCycle === 'annual' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
                }`}
              >
                Annual (20% off)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Developer Tier */}
            <div className="p-6 rounded-lg border border-border bg-card space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Developer</h3>
                <p className="text-xs text-muted-foreground">For individual developers and local experimentation.</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-semibold text-foreground">$0</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </Button>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> 1 workspace seat</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> 10,000 workflow steps / mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> Local SQLite & Docker support</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> Community GitHub support</li>
              </ul>
            </div>

            {/* Team Tier (Recommended) */}
            <div className="p-6 rounded-lg border border-primary bg-card space-y-5 shadow-xs relative">
              <div className="absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                Popular
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Team</h3>
                <p className="text-xs text-muted-foreground">For engineering teams building multi-agent apps.</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-semibold text-foreground">
                  {billingCycle === 'monthly' ? '$99' : '$79'}
                </span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/register')}
              >
                Start 14-Day Trial
              </Button>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 5 workspace seats</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 250,000 workflow steps / mo</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Full Neo4j & Qdrant Graph RAG</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Celery + Redis background workers</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> 14-day execution trace retention</li>
              </ul>
            </div>

            {/* Enterprise Tier */}
            <div className="p-6 rounded-lg border border-border bg-card space-y-5">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Enterprise</h3>
                <p className="text-xs text-muted-foreground">For enterprise organizations needing private VPC deployment.</p>
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-semibold text-foreground">Custom</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/register')}
              >
                Contact Sales
              </Button>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> Unlimited seats</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> Dedicated VPC or on-prem deployment</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> Custom LLM gateway routing & BYOK</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> 99.99% uptime SLA</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-foreground shrink-0" /> Dedicated engineering channel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. Production Footer */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 sm:px-6 bg-card border-t border-border text-xs text-muted-foreground">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div className="space-y-2.5">
            <div className="font-semibold text-foreground">Platform</div>
            <ul className="space-y-1.5">
              <li><a href="#capabilities" className="hover:text-foreground">Agent Orchestration</a></li>
              <li><a href="#capabilities" className="hover:text-foreground">Hybrid Graph RAG</a></li>
              <li><a href="#capabilities" className="hover:text-foreground">Universal Gateway</a></li>
              <li><button type="button" onClick={() => navigate('/agent-builder')} className="hover:text-foreground">Visual Builder</button></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-semibold text-foreground">Resources</div>
            <ul className="space-y-1.5">
              <li><button type="button" onClick={() => navigate('/api-explorer')} className="hover:text-foreground">OpenAPI Explorer</button></li>
              <li><a href="#architecture" className="hover:text-foreground">Architecture Specs</a></li>
              <li><button type="button" onClick={() => navigate('/dashboard')} className="hover:text-foreground">Live Workspace</button></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">GitHub Repository</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-semibold text-foreground">Security</div>
            <ul className="space-y-1.5">
              <li><a href="#security" className="hover:text-foreground">Private VPC Peering</a></li>
              <li><a href="#security" className="hover:text-foreground">Self-Hosted Kubernetes</a></li>
              <li><a href="#security" className="hover:text-foreground">Data Privacy Policy</a></li>
              <li><a href="#security" className="hover:text-foreground">Zero Retention Guarantee</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <div className="font-semibold text-foreground">Company</div>
            <ul className="space-y-1.5">
              <li><a href="mailto:contact@aios.dev" className="hover:text-foreground">Contact Sales</a></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground">Open Source</a></li>
              <li><a href="/login" className="hover:text-foreground">Customer Sign In</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center text-white font-semibold text-[10px]">
              AI
            </div>
            <span className="font-medium text-foreground">AIOS Platform</span>
            <span>• © {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-foreground">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
