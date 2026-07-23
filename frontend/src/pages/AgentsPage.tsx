import React, { useState } from 'react';
import {
  Bot,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAgentStore } from '../store/useAgentStore';

export const AgentsPage: React.FC = () => {
  const { agents, selectedAgent, selectAgent } = useAgentStore();
  const [taskPrompt, setTaskPrompt] = useState('');
  const [logs, setLogs] = useState<string[]>([
    '[00:00:01] System: Multi-Agent Cluster initialized.',
    '[00:00:02] Planner Agent: Graph execution DAG generated.',
    '[00:00:03] Graph RAG Retriever: Searching vector space & entity graph...',
  ]);

  const handleRunTask = () => {
    if (!taskPrompt.trim()) return;
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] User Prompt: "${taskPrompt}"`,
      `[${new Date().toLocaleTimeString()}] Planner Agent: Constructing task breakdown DAG...`,
      `[${new Date().toLocaleTimeString()}] Reasoning Agent: Invoking model GPT-4o with context...`,
    ]);
    setTaskPrompt('');
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Multi-Agent Engine Studio</h1>
        <p className="text-muted-foreground text-sm">
          Orchestrate and monitor specialized LLM agents across task execution DAGs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agent Selection List */}
        <div className="glass-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cluster Agents</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              {agents?.length ?? 6} Active
            </span>
          </div>

          <div className="space-y-3">
            {(agents || []).map((agent) => (
              <div
                key={agent.id}
                onClick={() => selectAgent(agent)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedAgent?.id === agent.id
                    ? 'bg-primary/10 border-primary shadow-md'
                    : 'bg-muted/30 border-border/40 hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{agent.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{agent.model}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    agent.status === 'executing' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/30">
                  <span>Latency: {agent.latency_ms}ms</span>
                  <span>Tokens: {(agent.tokens_used ?? 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive Agent Sandbox & Execution Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Inspector */}
          {selectedAgent && (
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedAgent.name} Inspector</h3>
                  <p className="text-xs text-muted-foreground">Role: {selectedAgent.role?.toUpperCase()} • Model: {selectedAgent.model}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs flex items-center space-x-1">
                    <Play className="w-3.5 h-3.5" />
                    <span>Trigger</span>
                  </button>
                  <button className="p-2 rounded-xl bg-muted border border-border/60 text-xs flex items-center space-x-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Capabilities</div>
                <div className="flex flex-wrap gap-2">
                  {(selectedAgent.capabilities || []).map((cap, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-muted text-xs font-medium border border-border/50 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <span>{cap}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Agent Execution Prompt */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold">Dispatch Multi-Agent Workflow Goal</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunTask()}
                placeholder="Enter enterprise goal (e.g. 'Analyze Q3 compliance and cross-reference Graph RAG documents')"
                className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 text-sm focus:outline-none focus:border-primary placeholder:text-muted-foreground"
              />
              <button
                onClick={handleRunTask}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Execute</span>
              </button>
            </div>

            {/* Terminal Execution Log Feed */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-gray-300 space-y-2 max-h-60 overflow-y-auto">
              <div className="text-gray-500">// AIOS Multi-Agent Execution Stream</div>
              {logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
