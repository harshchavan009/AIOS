import React, { useState } from 'react';
import {
  Sliders,
  Play,
  Download,
  RotateCcw,
  Sparkles,
  Bot,
  Zap,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  Copy,
  Settings,
  Code,
  Loader2
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface ModelOutput {
  modelId: string;
  modelName: string;
  provider: string;
  output: string;
  latency_ms: number;
  tokens: number;
  cost: number;
  qualityScore: number;
  hallucinationScore: number;
  safetyScore: number;
}

export const PlaygroundPage: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState('You are an enterprise AI systems engineer specialized in multi-agent architectures.');
  const [userPrompt, setUserPrompt] = useState('Decompose a financial audit workflow into a LangGraph DAG with Neo4j entity graph traversal.');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [jsonMode, setJsonMode] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const [modelOutputs, setModelOutputs] = useState<ModelOutput[]>([
    {
      modelId: 'gpt-4o',
      modelName: 'OpenAI GPT-4o',
      provider: 'OpenAI',
      output: `{\n  "dag_name": "Financial_Audit_Workflow",\n  "nodes": [\n    {"id": "planner", "type": "planner_agent"},\n    {"id": "retriever", "type": "neo4j_graph_rag"},\n    {"id": "reasoning", "type": "synthesis_agent"}\n  ],\n  "edges": [["planner", "retriever"], ["retriever", "reasoning"]]\n}`,
      latency_ms: 185,
      tokens: 1420,
      cost: 0.0071,
      qualityScore: 98,
      hallucinationScore: 0.01,
      safetyScore: 99.8
    },
    {
      modelId: 'claude-3-5-sonnet',
      modelName: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      output: `1. **Planner Agent Node**: Decomposes audit compliance goals into atomic tasks.\n2. **Graph RAG Node**: Executes Cypher query against Neo4j entity graphs.\n3. **Critic Node**: Validates factuality before response streaming.`,
      latency_ms: 210,
      tokens: 1680,
      cost: 0.0084,
      qualityScore: 99,
      hallucinationScore: 0.005,
      safetyScore: 99.9
    }
  ]);

  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const token = localStorage.getItem('aios_access_token');
      const response = await fetch('/api/v1/studio/playground/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          user_prompt: userPrompt,
          temperature,
          top_p: topP,
          max_tokens: maxTokens
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.comparison && data.comparison.length > 0) {
          setModelOutputs(data.comparison);
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Enterprise AI Playground</h1>
          <p className="text-muted-foreground text-sm">
            Side-by-side multi-LLM prompt testing, streaming responses, hyperparameter tuning, and telemetry metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunComparison}
            disabled={isComparing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{isComparing ? 'Running Comparison...' : 'Run Multi-Model Comparison'}</span>
          </button>
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(modelOutputs, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "aios_playground_comparison.json");
              downloadAnchor.click();
            }}
            className="px-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hyperparameter & Prompt Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-3">
              Hyperparameters
            </h3>

            {/* Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Temperature</span>
                  <span className="text-primary font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Top P</span>
                  <span className="text-primary font-bold">{topP}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Max Tokens</span>
                  <span className="text-primary font-bold">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Structured JSON Mode</span>
                <input
                  type="checkbox"
                  checked={jsonMode}
                  onChange={(e) => setJsonMode(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
              </div>
            </div>
          </div>

          {/* System Prompt Input */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-3">
              System Instruction
            </h3>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* User Prompt Input */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-3">
              User Goal Prompt
            </h3>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right Column: Side-by-Side Model Comparison Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modelOutputs.map((item, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{item.modelName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{item.provider}</div>
                      </div>
                    </div>
                    <Badge variant="success">{item.latency_ms}ms</Badge>
                  </div>

                  {/* Output Display */}
                  <div className="mt-4 p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-gray-200 min-h-[180px] whitespace-pre-wrap overflow-x-auto">
                    {item.output}
                  </div>
                </div>

                {/* Telemetry Metrics Footer */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <div className="text-muted-foreground text-[9px] uppercase">Tokens</div>
                    <div className="font-bold text-primary">{item.tokens}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <div className="text-muted-foreground text-[9px] uppercase">Cost</div>
                    <div className="font-bold text-emerald-400">${item.cost.toFixed(4)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
                    <div className="text-muted-foreground text-[9px] uppercase">Safety</div>
                    <div className="font-bold text-indigo-400">{item.safetyScore}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
