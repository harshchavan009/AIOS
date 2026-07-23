import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const EVALUATION_BENCHMARKS = [
  { model: 'GPT-4o', faithfulness: 98, groundedness: 97, relevance: 99, hallucination: 1.2 },
  { model: 'Claude 3.5 Sonnet', modelShort: 'Claude 3.5', faithfulness: 99, groundedness: 99, relevance: 98, hallucination: 0.5 },
  { model: 'Gemini 1.5 Pro', modelShort: 'Gemini 1.5', faithfulness: 95, groundedness: 96, relevance: 96, hallucination: 2.1 },
  { model: 'Llama 3 70B', modelShort: 'Llama 3', faithfulness: 92, groundedness: 93, relevance: 94, hallucination: 3.4 }
];

export const EvaluationStudioPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AI Evaluation & Benchmarking Studio</h1>
          <p className="text-muted-foreground text-sm">
            Automated LLM quality, hallucination, faithfulness, and groundedness evaluation using RAGAS, DeepEval, and Promptfoo.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success">DeepEval 2.0 Synced</Badge>
          <Badge variant="info">Promptfoo Benchmarks</Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avg Faithfulness</div>
          <div className="text-3xl font-extrabold text-emerald-400">98.2%</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">DeepEval Metric</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Groundedness Score</div>
          <div className="text-3xl font-extrabold text-blue-400">97.8%</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">RAGAS Framework</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hallucination Rate</div>
          <div className="text-3xl font-extrabold text-rose-400">1.8%</div>
          <div className="mt-1 text-xs text-emerald-400 font-mono">-0.4% lower week-over-week</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Passed Tests</div>
          <div className="text-3xl font-extrabold text-purple-400">1,420 / 1,450</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">97.9% Success Rate</div>
        </div>
      </div>

      {/* Benchmark Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold">Multi-Model Evaluation Benchmark Scores</h3>
            <p className="text-xs text-muted-foreground">Comparative scoring across Faithfulness, Groundedness, and Relevance metrics</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono">RAGAS Matrix</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EVALUATION_BENCHMARKS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="model" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} domain={[80, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="faithfulness" fill="#3b82f6" name="Faithfulness (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="groundedness" fill="#10b981" name="Groundedness (%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="relevance" fill="#8b5cf6" name="Relevance (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
