import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Bot,
  Cpu,
  Database,
  Rocket,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNotificationStore } from '../../store/useNotificationStore';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { num: 1, title: 'Agent Profile', icon: Bot },
  { num: 2, title: 'Model Gateway', icon: Cpu },
  { num: 3, title: 'Knowledge & RAG', icon: Database },
  { num: 4, title: 'Deploy', icon: Rocket },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Restore saved step & config from localStorage
  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem('aios_onboarding_step');
    return saved ? Math.min(Math.max(parseInt(saved, 10), 1), 4) : 1;
  });

  const [agentName, setAgentName] = useState(() => localStorage.getItem('aios_onboard_name') || '');
  const [agentRole, setAgentRole] = useState(() => localStorage.getItem('aios_onboard_role') || '');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('aios_onboard_model') || 'claude-3-5-sonnet');
  const [enableGraphRAG, setEnableGraphRAG] = useState(true);
  const [enableSandbox, setEnableSandbox] = useState(true);

  // Persist progress to localStorage
  useEffect(() => {
    localStorage.setItem('aios_onboarding_step', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('aios_onboard_name', agentName);
  }, [agentName]);

  useEffect(() => {
    localStorage.setItem('aios_onboard_role', agentRole);
  }, [agentRole]);

  useEffect(() => {
    localStorage.setItem('aios_onboard_model', selectedModel);
  }, [selectedModel]);

  if (!isOpen) return null;

  const handleSkip = () => {
    localStorage.setItem('aios_onboarding_completed', 'true');
    onClose();
  };

  const handleFinish = (path: string = '/dashboard') => {
    localStorage.setItem('aios_onboarding_completed', 'true');
    addNotification({
      type: 'agent',
      title: 'Agent Initialized',
      description: `${agentName || 'Default Agent'} successfully configured and ready in workspace.`,
    });
    onClose();
    navigate(path);
  };

  const MODELS = [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', note: 'Recommended for code & multi-step tool reasoning' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', note: 'Low-latency multimodal model with fast function calling' },
    { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', note: 'High context window for long-document indexing' },
    { id: 'llama-3-3-70b', name: 'Llama 3.3 70B', provider: 'Groq / Self-hosted', note: 'Open-weights model for air-gapped environments' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-100"
      onClick={handleSkip}
    >
      <div
        className="w-full max-w-xl border border-border rounded-lg shadow-lg overflow-hidden bg-card text-card-foreground transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Step Progress */}
        <div className="p-5 border-b border-border bg-card">
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                Set up your AIOS workspace
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Step {step} of 4 • {STEPS[step - 1].title}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSkip}
              aria-label="Skip onboarding"
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clean hairline progress bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {STEPS.map((s) => {
              const isCompleted = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="space-y-1">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      isCompleted || isCurrent ? 'bg-accent' : 'bg-muted/20'
                    }`}
                  />
                  <span className={`block text-[10px] font-medium truncate ${
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-4 min-h-[260px]">
          {/* Step 1: Agent Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Define your first agent</h3>
                <p className="text-xs text-muted-foreground">
                  Give your primary agent worker an identity and assign its core operational responsibility.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <Input
                  id="onboard-agent-name"
                  label="Agent name"
                  placeholder="e.g. Research Analyst or Code Auditor"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  autoFocus
                />

                <Input
                  id="onboard-agent-role"
                  label="Role description"
                  placeholder="e.g. Retrieve relevant documentation and generate verified answers"
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Model Gateway */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Select primary LLM</h3>
                <p className="text-xs text-muted-foreground">
                  Choose the default foundation model for this agent. You can configure fallback rules anytime.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {MODELS.map((m) => {
                  const isSelected = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedModel(m.id)}
                      className={`w-full p-3 rounded border text-left flex items-start justify-between transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent/10 text-foreground shadow-xs'
                          : 'border-border bg-background hover:bg-secondary text-muted-foreground'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-foreground">{m.name}</span>
                          <span className="text-[10px] text-muted-foreground">({m.provider})</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{m.note}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Knowledge & RAG */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Enable tools and memory</h3>
                <p className="text-xs text-muted-foreground">
                  Connect retrieval pipelines and execution sandboxes for autonomous capability.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-start gap-3 p-3 rounded border border-border bg-background hover:bg-secondary transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableGraphRAG}
                    onChange={(e) => setEnableGraphRAG(e.target.checked)}
                    className="mt-0.5 rounded border-border text-accent focus:ring-accent w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Hybrid Graph RAG</span>
                    <span className="text-xs text-muted-foreground block">
                      Connect Qdrant dense vector search with Neo4j entity relationships for grounded answers.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded border border-border bg-background hover:bg-secondary transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSandbox}
                    onChange={(e) => setEnableSandbox(e.target.checked)}
                    className="mt-0.5 rounded border-border text-accent focus:ring-accent w-4 h-4"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground block">Python Tool Sandbox</span>
                    <span className="text-xs text-muted-foreground block">
                      Permit agent to write and execute sandboxed code for data analysis and math computation.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Ready to Deploy */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Configuration summary</h3>
                <p className="text-xs text-muted-foreground">
                  Your agent is configured and ready to be loaded into your workspace.
                </p>
              </div>

              <div className="p-3.5 rounded border border-border bg-secondary/30 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Agent Name</span>
                  <span className="font-medium text-foreground">{agentName || 'Default Assistant'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium text-foreground">{agentRole || 'General Assistant'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Foundation Model</span>
                  <span className="font-medium text-foreground">{selectedModel}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Capabilities</span>
                  <span className="font-medium text-foreground">
                    {[enableGraphRAG && 'Graph RAG', enableSandbox && 'Python Sandbox'].filter(Boolean).join(', ') || 'Standard LLM'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Actions */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip setup
          </Button>

          <div className="flex items-center space-x-2">
            {step > 1 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep((prev) => prev - 1)}
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Back
              </Button>
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setStep((prev) => prev + 1)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleFinish('/dashboard')}
                rightIcon={<Check className="w-3.5 h-3.5" />}
              >
                Launch Workspace
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
