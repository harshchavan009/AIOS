import React, { useState } from 'react';
import {
  Code2,
  GitBranch,
  FileCode,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AutoDevPage: React.FC = () => {
  const [activeFile, setActiveFile] = useState('backend/app/api/v1/auth.py');
  const [analyzing, setAnalyzing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  const REPO_TREE = [
    { path: 'backend/app/main.py', type: 'file', lang: 'Python' },
    { path: 'backend/app/api/v1/auth.py', type: 'file', lang: 'Python' },
    { path: 'backend/app/agents/orchestrator.py', type: 'file', lang: 'Python' },
    { path: 'frontend/src/App.tsx', type: 'file', lang: 'TypeScript' },
    { path: 'frontend/src/store/useAgentStore.ts', type: 'file', lang: 'TypeScript' },
  ];

  const handleAudit = async () => {
    setAnalyzing(true);
    setAuditResult(null);
    try {
      const token = localStorage.getItem('aios_access_token');
      const res = await fetch('/api/v1/apps/autodev/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ repository_url: 'https://github.com/harshchavan009/AIOS', branch: 'main' })
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
      }
    } catch {
      // fallback
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">AutoDev & Repository Intelligence</h1>
          <p className="text-muted-foreground text-sm">
            Autonomous codebase parsing, refactoring, and AI-driven pull request generation.
          </p>
        </div>
        <Badge variant="info" pulse>
          AutoDev Agent Cluster Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Repository File Tree */}
        <Card variant="glass" className="lg:col-span-4 p-5 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-border/60">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Repository Explorer</span>
          </div>

          <div className="space-y-2">
            {REPO_TREE.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveFile(item.path)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  activeFile === item.path
                    ? 'bg-primary/10 border-primary text-primary font-semibold'
                    : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <FileCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.path}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-mono">{item.lang}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Code Inspection & AI Agent Reviewer */}
        <Card variant="glass" className="lg:col-span-8 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center space-x-2">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold font-mono">{activeFile}</span>
            </div>
            <Button
              onClick={handleAudit}
              disabled={analyzing}
              variant="gradient"
              size="sm"
              leftIcon={analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            >
              {analyzing ? 'Analyzing AST...' : 'Run AI Code Audit'}
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-[#090d16] border border-border/60 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto">
            <pre className="text-emerald-400"># AutoDev Repository Analysis Context</pre>
            <pre className="text-gray-400">class PlannerAgent(BaseAgent):</pre>
            <pre className="text-gray-400">    async def decompose_goal(self, goal: str) -&gt; DAGGraph:</pre>
            <pre className="text-blue-400">        """Decomposes enterprise goals into executable LangGraph state nodes."""</pre>
            <pre className="text-gray-400">        nodes = await self.llm.generate_plan(goal)</pre>
            <pre className="text-purple-400">        return self.graph_builder.compile(nodes)</pre>
          </div>

          {auditResult ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>AST Parse Status: {auditResult.ast_parse_status.toUpperCase()}</span>
              </div>
              {auditResult.suggested_fix_pr && (
                <div className="font-mono text-[11px] bg-black/40 p-3 rounded-lg text-gray-200">
                  <div className="font-bold text-primary mb-1">Suggested PR: {auditResult.suggested_fix_pr.pr_title}</div>
                  <pre className="text-amber-300">{auditResult.suggested_fix_pr.diff}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <div className="font-bold">AI Quality Score: Verified</div>
                <div className="text-[11px] opacity-90">Clean Architecture compliant. Click 'Run AI Code Audit' to run live AST analysis.</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
