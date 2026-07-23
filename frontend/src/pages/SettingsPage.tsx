import React from 'react';
import { SlidersHorizontal, Key, Database, Shield, Server, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">System & Cluster Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure AI model provider API keys, database connection pools, and RBAC permissions.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Model Provider API Keys */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-border/60">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold">LLM Model Provider Keys</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">OpenAI API Key</label>
              <input
                type="password"
                value="sk-proj-aios-enterprise-openai-mock-key"
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Anthropic Claude API Key</label>
              <input
                type="password"
                value="sk-ant-aios-enterprise-claude-mock-key"
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Google Gemini API Key</label>
              <input
                type="password"
                value="AIzaSyAiosEnterpriseGeminiMockKey"
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-muted/40 border border-border/60 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Database & Infrastructure Configs */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-border/60">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">Infrastructure Endpoints</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="text-muted-foreground text-[10px] uppercase">PostgreSQL Database</div>
              <div className="font-bold text-foreground mt-1">postgresql+asyncpg://aios_db:5432</div>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="text-muted-foreground text-[10px] uppercase">Redis Cache & Celery</div>
              <div className="font-bold text-foreground mt-1">redis://localhost:6379/0</div>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="text-muted-foreground text-[10px] uppercase">Qdrant Vector DB</div>
              <div className="font-bold text-foreground mt-1">qdrant://localhost:6333</div>
            </div>
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="text-muted-foreground text-[10px] uppercase">Neo4j Knowledge Graph</div>
              <div className="font-bold text-foreground mt-1">bolt://localhost:7687</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
