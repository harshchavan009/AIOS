import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  Cpu,
  Database,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Zap,
  Network,
  Terminal,
  Shield,
  Layers,
  Check,
  Rocket
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [agentName, setAgentName] = useState('Enterprise Compliance Auditor');
  const [agentRole, setAgentRole] = useState('Task Decomposition & Knowledge Audit');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.2);
  const [enableGraphRAG, setEnableGraphRAG] = useState(true);
  const [enablePythonTool, setEnablePythonTool] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [deployLogs, setDeployLogs] = useState<string[]>([]);

  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const isLight = theme === 'light';

  useEffect(() => {
    if (step === 4 && !isDeploying && deployProgress === 0) {
      setIsDeploying(true);
      setDeployLogs(['[1/4] Initializing LangGraph DAG Orchestrator...']);

      const t1 = setTimeout(() => {
        setDeployProgress(35);
        setDeployLogs((prev) => [...prev, '[2/4] Binding LLM router & provider API keys...']);
      }, 700);

      const t2 = setTimeout(() => {
        setDeployProgress(70);
        setDeployLogs((prev) => [...prev, '[3/4] Connecting Neo4j Knowledge Graph & Qdrant Vector Store...']);
      }, 1400);

      const t3 = setTimeout(() => {
        setDeployProgress(100);
        setIsDeploying(false);
        setDeployLogs((prev) => [...prev, '[4/4] ✓ Agent deployed successfully! Active workers: 4/6']);
        
        addNotification({
          type: 'agent',
          title: 'Agent Deployed',
          description: `${agentName} successfully initialized and online in LangGraph cluster.`,
        });
      }, 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [step, isDeploying, deployProgress, agentName, addNotification]);

  if (!isOpen) return null;

  const handleFinish = (path: string) => {
    localStorage.setItem('aios_onboarding_completed', 'true');
    onClose();
    navigate(path);
  };

  const MODELS = [
    { id: 'gpt-4o', name: 'OpenAI GPT-4o', desc: 'Flagship multi-modal model with fast function calling', badge: 'Recommended' },
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Superior reasoning, coding, and structured analysis', badge: 'High Precision' },
    { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', desc: '2 Million token context window & multi-modal RAG', badge: 'Large Context' },
    { id: 'llama-3-70b', name: 'Llama 3 70B (Groq)', desc: 'Ultra-low latency inference on Groq LPU cluster', badge: 'Fastest' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl border rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          isLight
            ? 'bg-white border-gray-200 text-gray-900 shadow-blue-500/10'
            : 'bg-[#0E121B] border-white/10 text-white shadow-black/90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step Progress Header */}
        <div className={`p-6 border-b ${isLight ? 'bg-gray-50/70 border-gray-200' : 'bg-[#080B10] border-white/10'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500 text-white shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">AIOS Agent Onboarding Wizard</h2>
                <p className="text-xs text-muted-foreground">Build, configure, and deploy your first AI Agent in 4 guided steps</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-muted-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, label: 'Welcome' },
              { num: 2, label: 'Configure LLM' },
              { num: 3, label: 'Knowledge RAG' },
              { num: 4, label: 'Deploy' },
            ].map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex flex-col space-y-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-400'
                        : isActive
                        ? 'bg-blue-500 shadow-sm shadow-blue-500/50'
                        : 'bg-white/10'
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={isActive ? 'text-blue-500 font-bold' : isDone ? 'text-emerald-400 font-bold' : 'text-muted-foreground'}>
                      {s.num}. {s.label}
                    </span>
                    {isDone && <Check className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Area */}
        <div className="p-6 md:p-8 space-y-6">
          {/* STEP 1: Welcome & Agent Identity */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-mono font-bold border border-blue-500/20">
                  <span>👋 Welcome to AIOS</span>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">Let's build your first AI Agent</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AIOS orchestrates multi-agent worker nodes powered by LangGraph, Graph RAG, and multi-model LLM routers. Specify a name and role for your initial agent worker.
                </p>
              </div>

              <div className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agent Name</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Code Architect Agent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agent Task & Role</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isLight ? 'bg-gray-50 border-gray-300 text-gray-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                    value={agentRole}
                    onChange={(e) => setAgentRole(e.target.value)}
                    placeholder="e.g. LangGraph Task Decomposition & Knowledge Graph Audit"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Configure LLM */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight">Configure LLM Provider & Parameters</h3>
                <p className="text-xs text-muted-foreground">Select the primary model engine and fine-tune reasoning parameters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODELS.map((m) => {
                  const isSel = selectedModel === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSel
                          ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-foreground">{m.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-mono font-bold">
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{m.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Temperature Slider */}
              <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Temperature (Creativity vs Determinism)</span>
                  <span className="font-mono text-blue-400 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>0.0 (Exact & Deterministic)</span>
                  <span>1.0 (Creative Stream)</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Connect Knowledge (RAG & Tools) */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight">Connect Knowledge Base & Tool Bindings</h3>
                <p className="text-xs text-muted-foreground">Attach Neo4j Knowledge Graph, Qdrant vector retrieval, and code sandbox execution</p>
              </div>

              <div className="space-y-3 font-sans">
                <div
                  onClick={() => setEnableGraphRAG(!enableGraphRAG)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    enableGraphRAG
                      ? 'bg-teal-500/10 border-teal-500/50'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400">
                      <Network className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-foreground">Neo4j Graph RAG & Qdrant Vector Store</div>
                      <div className="text-[11px] text-muted-foreground">Query 1,420 entity nodes and semantic vector chunk embeddings</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableGraphRAG}
                    onChange={() => {}}
                    className="w-4 h-4 accent-teal-500 cursor-pointer"
                  />
                </div>

                <div
                  onClick={() => setEnablePythonTool(!enablePythonTool)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    enablePythonTool
                      ? 'bg-amber-500/10 border-amber-500/50'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-foreground">Python Code Execution Sandbox (MCP)</div>
                      <div className="text-[11px] text-muted-foreground">Run calculations, code scripts, and API tool calls securely</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enablePythonTool}
                    onChange={() => {}}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Deployment & Success */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 py-2">
                {isDeploying ? (
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-500 animate-bounce">
                    <Rocket className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                )}

                <h3 className="text-2xl font-extrabold tracking-tight">
                  {isDeploying ? 'Deploying Agent Worker Node...' : '🚀 Agent Successfully Deployed!'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {isDeploying
                    ? 'Orchestrating LangGraph DAG nodes, binding multi-model router, and syncing vectors.'
                    : `${agentName} is now active and ready in your AIOS workspace.`}
                </p>
              </div>

              {/* Progress Bar & Deployment Terminal Logs */}
              <div className="space-y-3">
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${deployProgress}%` }}
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#07090F] border border-white/10 font-mono text-xs space-y-1.5 max-h-36 overflow-y-auto">
                  {deployLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('✓') ? 'text-emerald-400 font-bold' : 'text-gray-300'}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className={`p-5 border-t flex items-center justify-between ${isLight ? 'bg-gray-50/70 border-gray-200' : 'bg-[#080B10] border-white/10'}`}>
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold flex items-center space-x-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/25 ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/25 ml-auto animate-pulse"
            >
              <span>Deploy Agent</span>
              <Rocket className="w-4 h-4" />
            </button>
          )}

          {step === 4 && !isDeploying && (
            <div className="flex items-center space-x-3 ml-auto">
              <button
                type="button"
                onClick={() => handleFinish('/dashboard')}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-gray-300 transition-all"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={() => handleFinish('/agents')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-blue-500/25"
              >
                <span>Open Agent Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
