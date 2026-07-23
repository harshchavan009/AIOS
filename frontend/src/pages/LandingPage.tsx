import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Bot,
  Network,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  Layers,
  Database,
  Lock,
  GitBranch,
  Code2,
  FileText,
  Search,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { NeuralCanvas } from '../components/common/NeuralCanvas';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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
          <a href="#features" className="hover:text-blue-400 transition-colors">Modules</a>
          <a href="#architecture" className="hover:text-blue-400 transition-colors">Architecture</a>
          <a href="#graph-rag" className="hover:text-blue-400 transition-colors">Graph RAG</a>
          <a href="#enterprise" className="hover:text-blue-400 transition-colors">Security</a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="gradient" size="sm" onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Launch Platform
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center relative z-20">
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
            onClick={() => navigate('/dashboard')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto shadow-2xl"
          >
            Explore Live Dashboard
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate('/agents')}
            leftIcon={<Bot className="w-5 h-5 text-indigo-400" />}
            className="w-full sm:w-auto"
          >
            Agent Studio Workspace
          </Button>
        </div>

        {/* Live Interactive Node Preview Card */}
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-blue-500/30 via-purple-500/20 to-gray-800/40 shadow-2xl text-left">
          <div className="bg-[#0b0f19]/90 rounded-2xl overflow-hidden border border-white/10 p-6 md:p-8 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-gray-400 ml-2">aios-cluster-node-01 // active-dag: #89201</span>
              </div>
              <Badge variant="success" pulse>
                CLUSTER OPTIMAL (178ms)
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 mb-1">PLANNER AGENT</div>
                <div className="text-sm font-bold text-blue-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span>Decomposing Goal into DAG</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 mb-1">GRAPH RAG ENGINE</div>
                <div className="text-sm font-bold text-purple-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>Traversing Neo4j Entities</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] font-mono text-gray-400 mb-1">REASONING AGENT</div>
                <div className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Synthesizing Context</span>
                </div>
              </div>
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
