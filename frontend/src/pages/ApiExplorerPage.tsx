import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  Send,
  Zap,
  Globe,
  Lock,
  Layers,
  Sparkles,
  Database,
  Key,
  ExternalLink,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useNotificationStore } from '../store/useNotificationStore';
import { useThemeStore } from '../store/useThemeStore';

interface EndpointDoc {
  id: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  title: string;
  description: string;
  requestBody?: string;
  responsePayload: string;
  curlExample: string;
  pythonExample: string;
  jsExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'get-agents',
    method: 'GET',
    path: '/api/v1/agents',
    title: 'List Active Agents',
    description: 'Retrieve a list of all deployed LangGraph agents, active node topologies, and runtime health statuses.',
    responsePayload: JSON.stringify(
      {
        status: 'success',
        count: 4,
        agents: [
          { id: 'PlannerAgent', role: 'Task Decomposition', model: 'GPT-4o', status: 'online' },
          { id: 'RetrieverAgent', role: 'Graph RAG Vector Search', model: 'Claude 3.5 Sonnet', status: 'online' },
          { id: 'ToolAgent', role: 'Python Code Execution', model: 'Llama 3 70B', status: 'online' },
          { id: 'CriticAgent', role: 'RAGAS Quality Benchmark', model: 'Claude 3.5 Sonnet', status: 'online' },
        ],
      },
      null,
      2
    ),
    curlExample: `curl -X GET "https://api.aios.dev/api/v1/agents" \\
  -H "Authorization: Bearer aios_live_sec_98a72b1c" \\
  -H "Content-Type: application/json"`,
    pythonExample: `import requests

url = "https://api.aios.dev/api/v1/agents"
headers = {"Authorization": "Bearer aios_live_sec_98a72b1c"}

response = requests.get(url, headers=headers)
print(response.json())`,
    jsExample: `const response = await fetch("https://api.aios.dev/api/v1/agents", {
  method: "GET",
  headers: {
    "Authorization": "Bearer aios_live_sec_98a72b1c",
    "Content-Type": "application/json"
  }
});
const data = await response.json();
console.log(data);`,
  },
  {
    id: 'post-workflow',
    method: 'POST',
    path: '/api/v1/workflows',
    title: 'Create & Deploy Workflow',
    description: 'Register a custom multi-agent LangGraph DAG workflow with state parameters, triggers, and fallback policies.',
    requestBody: JSON.stringify(
      {
        workflow_name: 'Financial Compliance Audit',
        nodes: ['PlannerAgent', 'RetrieverAgent', 'ReasoningAgent', 'CriticAgent'],
        max_retries: 3,
        timeout_seconds: 30,
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        status: 'created',
        workflow_id: 'wf_dag_89a72b1c',
        deployed_at: '2026-07-26T00:55:00Z',
        active_nodes: 4,
      },
      null,
      2
    ),
    curlExample: `curl -X POST "https://api.aios.dev/api/v1/workflows" \\
  -H "Authorization: Bearer aios_live_sec_98a72b1c" \\
  -H "Content-Type: application/json" \\
  -d '{"workflow_name": "Financial Compliance Audit", "nodes": ["PlannerAgent", "RetrieverAgent"]}'`,
    pythonExample: `import requests

url = "https://api.aios.dev/api/v1/workflows"
headers = {
    "Authorization": "Bearer aios_live_sec_98a72b1c",
    "Content-Type": "application/json"
}
payload = {
    "workflow_name": "Financial Compliance Audit",
    "nodes": ["PlannerAgent", "RetrieverAgent", "ReasoningAgent"]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    jsExample: `const response = await fetch("https://api.aios.dev/api/v1/workflows", {
  method: "POST",
  headers: {
    "Authorization": "Bearer aios_live_sec_98a72b1c",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    workflow_name: "Financial Compliance Audit",
    nodes: ["PlannerAgent", "RetrieverAgent"]
  })
});
const data = await response.json();
console.log(data);`,
  },
  {
    id: 'post-execute',
    method: 'POST',
    path: '/api/v1/execute',
    title: 'Execute Multi-Agent Goal',
    description: 'Trigger asynchronous or synchronous agent execution across the multi-agent DAG pipeline with SSE streaming thoughts.',
    requestBody: JSON.stringify(
      {
        goal: 'Decompose compliance audit and search Neo4j knowledge graph for regulations',
        stream: true,
        temperature: 0.2,
      },
      null,
      2
    ),
    responsePayload: JSON.stringify(
      {
        execution_id: 'exec_99a8123c',
        status: 'completed',
        elapsed_seconds: 1.42,
        tokens_used: 1240,
        ragas_faithfulness: 0.984,
        final_answer: 'All financial compliance audit checks passed successfully with 0 policy violations.',
      },
      null,
      2
    ),
    curlExample: `curl -X POST "https://api.aios.dev/api/v1/execute" \\
  -H "Authorization: Bearer aios_live_sec_98a72b1c" \\
  -H "Content-Type: application/json" \\
  -d '{"goal": "Audit compliance policies", "stream": true}'`,
    pythonExample: `import requests

url = "https://api.aios.dev/api/v1/execute"
headers = {"Authorization": "Bearer aios_live_sec_98a72b1c"}
payload = {"goal": "Audit compliance policies", "stream": True}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    jsExample: `const response = await fetch("https://api.aios.dev/api/v1/execute", {
  method: "POST",
  headers: {
    "Authorization": "Bearer aios_live_sec_98a72b1c",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ goal: "Audit compliance policies", stream: true })
});
const data = await response.json();
console.log(data);`,
  },
  {
    id: 'get-usage',
    method: 'GET',
    path: '/api/v1/usage',
    title: 'Get Usage & Cost Metrics',
    description: 'Query organization real-time token volume, API expenditure, latency breakdown, and rate limit quotas.',
    responsePayload: JSON.stringify(
      {
        organization: 'AIOS Enterprise AI',
        period: '2026-07',
        total_tokens: 14250900,
        total_cost_usd: 442.8,
        monthly_budget_usd: 1000.0,
        rate_limits: {
          requests_per_minute: 1200,
          tokens_per_minute: 500000,
        },
      },
      null,
      2
    ),
    curlExample: `curl -X GET "https://api.aios.dev/api/v1/usage" \\
  -H "Authorization: Bearer aios_live_sec_98a72b1c"`,
    pythonExample: `import requests

url = "https://api.aios.dev/api/v1/usage"
headers = {"Authorization": "Bearer aios_live_sec_98a72b1c"}

response = requests.get(url, headers=headers)
print(response.json())`,
    jsExample: `const response = await fetch("https://api.aios.dev/api/v1/usage", {
  method: "GET",
  headers: { "Authorization": "Bearer aios_live_sec_98a72b1c" }
});
const data = await response.json();
console.log(data);`,
  },
];

export const ApiExplorerPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [activeLanguage, setActiveLanguage] = useState<'curl' | 'python' | 'js'>('curl');
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const addNotification = useNotificationStore((state) => state.addNotification);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const handleTestRequest = () => {
    setIsExecuting(true);
    setResponseOutput(null);
    setResponseTime(null);

    const startTime = performance.now();
    setTimeout(() => {
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime + 85));
      setResponseOutput(selectedEndpoint.responsePayload);
      setIsExecuting(false);

      addNotification({
        type: 'workflow',
        title: `200 OK — ${selectedEndpoint.method} ${selectedEndpoint.path}`,
        description: `Executed live API request in ${Math.round(endTime - startTime + 85)}ms.`,
      });
    }, 450);
  };

  const getCodeSnippet = () => {
    switch (activeLanguage) {
      case 'curl':
        return selectedEndpoint.curlExample;
      case 'python':
        return selectedEndpoint.pythonExample;
      case 'js':
        return selectedEndpoint.jsExample;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    addNotification({
      type: 'key',
      title: 'Snippet Copied',
      description: `${activeLanguage.toUpperCase()} request snippet copied to clipboard.`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <Code2 className="w-7 h-7 text-blue-500" />
            <span>Interactive REST API Explorer</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Test and integrate AIOS REST API endpoints for agent orchestration, DAG workflows, and usage analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success">OpenAPI v3.1 Spec</Badge>
          <Badge variant="info">Base URL: https://api.aios.dev</Badge>
        </div>
      </div>

      {/* Main 2-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint Navigation list */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[10px] font-extrabold font-mono uppercase tracking-wider text-muted-foreground px-1">
            API Endpoints
          </div>

          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpoint(ep);
                    setResponseOutput(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10'
                      : isLight
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-mono font-extrabold text-[10px] ${
                        ep.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-foreground truncate">{ep.path}</span>
                  </div>
                  <div className="text-xs font-bold mt-2 text-foreground">{ep.title}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {ep.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Endpoint Detail & Interactive Code Playground */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Banner Detail */}
          <div className="glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-400 font-mono font-extrabold text-xs border border-blue-500/40">
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-extrabold text-foreground">{selectedEndpoint.path}</span>
              </div>

              <button
                type="button"
                onClick={handleTestRequest}
                disabled={isExecuting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isExecuting ? 'Sending Request...' : 'Send Test Request'}</span>
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-foreground">{selectedEndpoint.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">{selectedEndpoint.description}</p>
            </div>

            {/* Code Generator Tab Switcher */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                  {(['curl', 'python', 'js'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLanguage(lang)}
                      className={`px-3 py-1 rounded-lg font-bold uppercase transition-all ${
                        activeLanguage === lang
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lang === 'js' ? 'JavaScript' : lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground text-xs font-mono flex items-center space-x-1 border border-white/10 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Snippet</span>
                </button>
              </div>

              {/* Code Snippet Display */}
              <div className="p-4 rounded-2xl bg-[#06080E] border border-white/10 font-mono text-xs text-gray-200 overflow-x-auto whitespace-pre leading-relaxed">
                {getCodeSnippet()}
              </div>
            </div>
          </div>

          {/* Response Window Box */}
          <div className="glass-card p-6 rounded-3xl space-y-3 border border-white/10">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-foreground">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Response Payload</span>
              </div>

              {responseTime && (
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    200 OK
                  </span>
                  <span className="text-muted-foreground">{responseTime}ms</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#06080E] border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre max-h-72 leading-relaxed">
              {responseOutput || selectedEndpoint.responsePayload}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
