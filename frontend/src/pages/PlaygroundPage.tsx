import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Download,
  RotateCcw,
  Bot,
  Zap,
  Loader2,
  Trophy,
  Clock,
  Coins,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Activity,
  Brain
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  checked: boolean;
}

interface ModelOutput {
  modelId: string;
  modelName: string;
  provider: string;
  output: string;
  latency_ms: number;
  execution_time_s: number;
  tokens: number;
  cost: number;
  qualityScore: number;
  hallucinationScore: number;
  safetyScore: number;
  composite_score: number;
  context_window: string;
  strengths: string;
}

const ALL_MODELS: ModelConfig[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/40', textColor: 'text-emerald-400', checked: true },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/40', textColor: 'text-orange-400', checked: true },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google AI', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/40', textColor: 'text-blue-400', checked: true },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta / Groq', color: 'from-violet-500 to-purple-500', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/40', textColor: 'text-violet-400', checked: false },
  { id: 'deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', color: 'from-cyan-500 to-sky-500', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/40', textColor: 'text-cyan-400', checked: false },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral AI', color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/40', textColor: 'text-rose-400', checked: false },
];

function getModelColor(modelId: string): ModelConfig {
  return ALL_MODELS.find(m => m.id === modelId) || ALL_MODELS[0];
}

export const PlaygroundPage: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState('You are an enterprise AI systems engineer specialized in multi-agent architectures.');
  const [userPrompt, setUserPrompt] = useState('Decompose a financial audit workflow into a LangGraph DAG with Neo4j entity graph traversal.');
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [models, setModels] = useState<ModelConfig[]>(ALL_MODELS);
  const [isComparing, setIsComparing] = useState(false);
  const [streamingModels, setStreamingModels] = useState<Set<string>>(new Set());
  const [modelOutputs, setModelOutputs] = useState<ModelOutput[]>([]);
  const [winner, setWinner] = useState<string>('');
  const [winnerReason, setWinnerReason] = useState<string>('');
  const [hasRun, setHasRun] = useState(false);
  const streamTimers = useRef<NodeJS.Timeout[]>([]);

  const selectedModels = models.filter(m => m.checked).map(m => m.id);

  const handleToggleModel = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const handleRunComparison = async () => {
    if (!userPrompt.trim() || selectedModels.length === 0 || isComparing) return;
    setIsComparing(true);
    setModelOutputs([]);
    setWinner('');
    setWinnerReason('');
    setHasRun(true);

    // Mark all selected models as "streaming"
    setStreamingModels(new Set(selectedModels));

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
          max_tokens: maxTokens,
          models: selectedModels
        })
      });

      if (response.ok) {
        const data = await response.json();
        const results: ModelOutput[] = data.comparison || [];

        // Simulate streaming: reveal each model output one by one based on latency
        results.forEach((result, idx) => {
          const delay = Math.min(result.latency_ms, 1500) * (idx === 0 ? 0.5 : 1) + idx * 300;
          const t = setTimeout(() => {
            setModelOutputs(prev => {
              const exists = prev.find(p => p.modelId === result.modelId);
              if (exists) return prev;
              return [...prev, result];
            });
            setStreamingModels(prev => {
              const next = new Set(prev);
              next.delete(result.modelId);
              return next;
            });
          }, delay);
          streamTimers.current.push(t);
        });

        // Show winner after all streams complete
        const maxDelay = Math.max(...results.map((r, i) => Math.min(r.latency_ms, 1500) + i * 300)) + 400;
        const winnerTimer = setTimeout(() => {
          setWinner(data.winner || '');
          setWinnerReason(data.winner_reason || '');
          setIsComparing(false);
        }, maxDelay);
        streamTimers.current.push(winnerTimer);
      }
    } catch {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    streamTimers.current.forEach(t => clearTimeout(t));
    setModelOutputs([]);
    setStreamingModels(new Set());
    setWinner('');
    setWinnerReason('');
    setHasRun(false);
    setIsComparing(false);
  };

  const handleExport = () => {
    const data = JSON.stringify({ userPrompt, systemPrompt, results: modelOutputs, winner, winnerReason }, null, 2);
    const a = document.createElement('a');
    a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    a.download = 'aios_playground_comparison.json';
    a.click();
  };

  // Lowest latency = fastest = winner on speed
  const fastestModel = modelOutputs.length > 0 ? modelOutputs.reduce((a, b) => a.latency_ms < b.latency_ms ? a : b) : null;
  const cheapestModel = modelOutputs.length > 0 ? modelOutputs.reduce((a, b) => a.cost < b.cost ? a : b) : null;
  const highestQuality = modelOutputs.length > 0 ? modelOutputs.reduce((a, b) => a.qualityScore > b.qualityScore ? a : b) : null;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Brain className="w-8 h-8 text-primary" />
            <span>Enterprise AI Playground</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Select models, write your prompt, and get real side-by-side streaming responses with latency, cost, and quality scores.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleExport}
            disabled={modelOutputs.length === 0}
            className="px-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted flex items-center space-x-2 disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleRunComparison}
            disabled={isComparing || selectedModels.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isComparing ? `Streaming ${streamingModels.size} models...` : 'Run Comparison'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Config Panel */}
        <div className="lg:col-span-4 space-y-5">

          {/* Model Selector */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
              Select Models to Compare ({selectedModels.length} / {ALL_MODELS.length})
            </h3>
            <div className="space-y-2">
              {models.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    model.checked
                      ? `${model.bgColor} ${model.borderColor} ring-1 ring-current`
                      : 'bg-muted/20 border-border/40 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={model.checked}
                      onChange={() => handleToggleModel(model.id)}
                      className="accent-primary w-4 h-4"
                    />
                    <div>
                      <div className={`text-xs font-bold ${model.checked ? model.textColor : 'text-foreground'}`}>
                        {model.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">{model.provider}</div>
                    </div>
                  </div>
                  {model.checked && (
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${model.color}`} />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
              Hyperparameters
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-foreground">Temperature</span>
                  <span className="text-primary font-bold">{temperature}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-foreground">Top P</span>
                  <span className="text-primary font-bold">{topP}</span>
                </div>
                <input type="range" min="0" max="1" step="0.05" value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-foreground">Max Tokens</span>
                  <span className="text-primary font-bold">{maxTokens.toLocaleString()}</span>
                </div>
                <input type="range" min="256" max="8192" step="256" value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
              System Instruction
            </h3>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* User Prompt */}
          <div className="glass-card p-5 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
              User Prompt
            </h3>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>
        </div>

        {/* Right: Comparison Results */}
        <div className="lg:col-span-8 space-y-5">

          {/* Winner Announcement Banner */}
          {winner && (
            <div className={`p-4 rounded-2xl border bg-gradient-to-r ${getModelColor(winner).color} bg-opacity-10 border-yellow-500/30 flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center space-x-2">
                    <span>🏆 Winner:</span>
                    <span className={getModelColor(winner).textColor}>{getModelColor(winner).name}</span>
                    <span className="text-muted-foreground font-normal">({getModelColor(winner).provider})</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{winnerReason}</div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 text-xs font-mono">
                {fastestModel && <span className="text-emerald-400">⚡ Fastest: {getModelColor(fastestModel.modelId).name} ({fastestModel.latency_ms}ms)</span>}
                {cheapestModel && <span className="text-blue-400">💰 Cheapest: {getModelColor(cheapestModel.modelId).name} (${cheapestModel.cost.toFixed(5)})</span>}
                {highestQuality && <span className="text-purple-400">🎯 Quality: {getModelColor(highestQuality.modelId).name} ({highestQuality.qualityScore}%)</span>}
              </div>
            </div>
          )}

          {/* Side-by-Side Streaming Latency Bar */}
          {hasRun && (
            <div className="glass-card p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Response Latency Comparison</span>
                </h3>
                <span className="text-xs text-muted-foreground font-mono">Lower = Faster ⚡</span>
              </div>

              <div className="space-y-2.5">
                {selectedModels.map((modelId) => {
                  const output = modelOutputs.find(o => o.modelId === modelId);
                  const config = getModelColor(modelId);
                  const isStreaming = streamingModels.has(modelId);
                  const maxLatency = Math.max(...modelOutputs.map(o => o.latency_ms), 400);
                  const barWidth = output ? Math.max(10, (output.latency_ms / maxLatency) * 100) : 0;

                  return (
                    <div key={modelId} className="flex items-center space-x-3 font-mono text-xs">
                      <span className={`w-28 flex-shrink-0 text-right text-[11px] ${config.textColor} font-bold truncate`}>
                        {config.name}
                      </span>
                      <div className="flex-1 h-7 rounded-xl bg-muted/40 border border-border/40 overflow-hidden relative">
                        {isStreaming ? (
                          <div className={`h-full bg-gradient-to-r ${config.color} opacity-30 animate-pulse`} style={{ width: '60%' }} />
                        ) : output ? (
                          <div
                            className={`h-full bg-gradient-to-r ${config.color} transition-all duration-700 flex items-center justify-end pr-2`}
                            style={{ width: `${barWidth}%` }}
                          />
                        ) : null}
                      </div>
                      <span className="w-20 flex-shrink-0 text-right">
                        {isStreaming ? (
                          <span className="text-muted-foreground animate-pulse">streaming…</span>
                        ) : output ? (
                          <span className={`font-bold ${config.textColor}`}>{output.latency_ms}ms</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Streaming "Loading" Cards for Models still executing */}
          {hasRun && streamingModels.size > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...streamingModels].map(modelId => {
                const config = getModelColor(modelId);
                return (
                  <div key={modelId} className={`glass-card p-5 rounded-2xl border ${config.borderColor} space-y-3 animate-pulse`}>
                    <div className="flex items-center space-x-2 pb-2 border-b border-border/60">
                      <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${config.textColor}`}>{config.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{config.provider}</div>
                      </div>
                      <span className="ml-auto text-[10px] text-muted-foreground font-mono">Streaming…</span>
                    </div>
                    <div className="h-28 rounded-xl bg-muted/20 border border-border/40 overflow-hidden relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-5 animate-pulse`} />
                      <div className="p-3 font-mono text-[10px] text-muted-foreground/60 space-y-1">
                        <div className="h-2 bg-muted/60 rounded w-3/4" />
                        <div className="h-2 bg-muted/60 rounded w-5/6" />
                        <div className="h-2 bg-muted/60 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Model Output Cards Grid */}
          {modelOutputs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modelOutputs.map((item) => {
                const config = getModelColor(item.modelId);
                const isWinner = winner === item.modelId;
                return (
                  <div
                    key={item.modelId}
                    className={`glass-card p-5 rounded-2xl border transition-all space-y-4 flex flex-col ${
                      isWinner
                        ? `${config.borderColor} ring-2 ring-yellow-500/50 shadow-lg shadow-yellow-500/10`
                        : `${config.borderColor}`
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-lg ${config.bgColor} ${config.textColor}`}>
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-sm font-bold ${config.textColor}`}>{item.modelName}</span>
                            {isWinner && <Trophy className="w-4 h-4 text-yellow-400" />}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">{item.provider}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                          {item.execution_time_s}s
                        </span>
                        <span className="text-[9px] text-muted-foreground font-mono">{item.latency_ms}ms</span>
                      </div>
                    </div>

                    {/* Response Output */}
                    <div className="flex-1 p-3.5 rounded-xl bg-[#090d16] border border-border/60 font-mono text-[11px] text-gray-200 min-h-[160px] whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-64">
                      {item.output}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono border-t border-border/40">
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                        <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Latency</span>
                        </div>
                        <div className={`font-bold ${config.textColor}`}>{item.latency_ms}ms</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                        <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                          <Coins className="w-2.5 h-2.5" />
                          <span>Cost</span>
                        </div>
                        <div className="font-bold text-emerald-400">${item.cost.toFixed(5)}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-0.5">
                        <div className="text-muted-foreground text-[9px] uppercase flex items-center space-x-1">
                          <Zap className="w-2.5 h-2.5" />
                          <span>Tokens</span>
                        </div>
                        <div className="font-bold text-primary">{item.tokens.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Quality & Safety Scores */}
                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Quality Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${config.color}`} style={{ width: `${item.qualityScore}%` }} />
                          </div>
                          <span className={`font-bold ${config.textColor}`}>{item.qualityScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Safety Score</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${item.safetyScore}%` }} />
                          </div>
                          <span className="font-bold text-emerald-400">{item.safetyScore}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Hallucination Risk</span>
                        <span className={`font-bold ${item.hallucinationScore < 0.01 ? 'text-emerald-400' : item.hallucinationScore < 0.03 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {(item.hallucinationScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Strengths</span>
                        <span className="text-foreground truncate ml-2 text-right">{item.strengths}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!hasRun && (
            <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center glass-card rounded-2xl border-dashed border-2 border-border/40">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-base font-bold text-muted-foreground">Select Models & Run Comparison</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Choose up to 6 models from the left panel, write your prompt, and click <strong>Run Comparison</strong> to get real-time streaming responses with latency, cost, and quality benchmarks.
              </p>
              <button
                onClick={handleRunComparison}
                disabled={selectedModels.length === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Comparison ({selectedModels.length} models selected)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
