import React, { useState } from 'react';
import {
  Cpu,
  Activity,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  Layers,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface ModelRegistryEntry {
  id: string;
  name: string;
  provider: string;
  type: 'LLM' | 'Embedding' | 'Reasoning' | 'Vision';
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  contextWindow: string;
  inputPricing: string;
  outputPricing: string;
  fallbackTarget: string;
}

const MODEL_ENTRIES: ModelRegistryEntry[] = [
  { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'OpenAI', type: 'Reasoning', status: 'healthy', latency: 185, contextWindow: '128k tokens', inputPricing: '$2.50 / 1M', outputPricing: '$10.00 / 1M', fallbackTarget: 'claude-3-5-sonnet' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', type: 'Reasoning', status: 'healthy', latency: 210, contextWindow: '200k tokens', inputPricing: '$3.00 / 1M', outputPricing: '$15.00 / 1M', fallbackTarget: 'gemini-1.5-pro' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google AI', type: 'Reasoning', status: 'healthy', latency: 240, contextWindow: '2M tokens', inputPricing: '$1.25 / 1M', outputPricing: '$5.00 / 1M', fallbackTarget: 'llama-3-70b' },
  { id: 'llama-3-70b', name: 'Llama 3 70B (Local / Groq)', provider: 'Meta / Local', type: 'LLM', status: 'healthy', latency: 95, contextWindow: '8k tokens', inputPricing: '$0.50 / 1M', outputPricing: '$0.75 / 1M', fallbackTarget: 'gpt-4o-mini' },
  { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', provider: 'OpenAI', type: 'Embedding', status: 'healthy', latency: 45, contextWindow: '8k tokens', inputPricing: '$0.13 / 1M', outputPricing: 'N/A', fallbackTarget: 'bge-large-en' }
];

export const ModelManagementPage: React.FC = () => {
  const [selectedEntry, setSelectedEntry] = useState<ModelRegistryEntry>(MODEL_ENTRIES[0]);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Centralized Model Registry & Router</h1>
          <p className="text-muted-foreground text-sm">
            Monitor model provider health, token pricing, context limits, automatic load balancing, and failover hierarchy.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success">Universal Gateway Active</Badge>
          <button className="px-4 py-2.5 rounded-xl bg-card border border-border/60 text-xs font-semibold hover:bg-muted flex items-center space-x-2">
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>Refresh Providers</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Model List Table */}
        <div className="lg:col-span-8 glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Registered Models</h3>
            <span className="text-xs font-mono text-muted-foreground">Total: {MODEL_ENTRIES.length}</span>
          </div>

          <div className="space-y-3">
            {MODEL_ENTRIES.map((entry) => (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedEntry.id === entry.id
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'bg-muted/30 border-border/40 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{entry.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{entry.provider} • {entry.type}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 font-mono text-xs">
                  <div className="text-right hidden sm:block">
                    <div className="text-muted-foreground text-[10px]">Context</div>
                    <div className="font-bold">{entry.contextWindow}</div>
                  </div>
                  <Badge variant="success">{entry.latency}ms</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Model Details & Routing Config */}
        <div className="lg:col-span-4 space-y-6">
          {selectedEntry && (
            <Card variant="glass" className="p-6 space-y-4">
              <div className="pb-3 border-b border-border/60">
                <h3 className="text-base font-bold">{selectedEntry.name} Specs</h3>
                <p className="text-xs text-muted-foreground font-mono">Provider: {selectedEntry.provider}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase">Input Cost</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{selectedEntry.inputPricing}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
                  <div className="text-[10px] text-muted-foreground uppercase">Output Cost</div>
                  <div className="text-emerald-400 font-bold mt-0.5">{selectedEntry.outputPricing}</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                <div className="text-muted-foreground font-mono uppercase">Failover Target</div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/40 font-mono text-primary font-bold">
                  ➔ {selectedEntry.fallbackTarget}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
