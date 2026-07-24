import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Badge } from '../components/ui/Badge';

interface AnalyticsData {
  monthly_expenditure: number;
  total_tokens_streamed: number;
  avg_system_latency_ms: number;
  security_compliance: string;
  daily_trends: Array<{ day: string; cost: number; tokens: number }>;
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    monthly_expenditure: 0,
    total_tokens_streamed: 0,
    avg_system_latency_ms: 0,
    security_compliance: '100%',
    daily_trends: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('aios_access_token');
        const res = await fetch('/api/v1/studio/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // preserve state
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Executive Analytics & Governance</h1>
          <p className="text-muted-foreground text-sm">
            Real-time monitoring of AI token usage, cumulative cost, latency distributions, model performance, and security audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success">Audit Trail Enforced</Badge>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Monthly Expenditure</div>
          <div className="text-3xl font-extrabold text-emerald-400">${data.monthly_expenditure.toFixed(2)}</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">Budget: $1,000.00 / mo</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Tokens Streamed</div>
          <div className="text-3xl font-extrabold text-blue-400">{data.total_tokens_streamed.toLocaleString()}</div>
          <div className="mt-1 text-xs text-emerald-400 font-mono">Live Telemetry Aggregate</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avg System Latency</div>
          <div className="text-3xl font-extrabold text-purple-400">{data.avg_system_latency_ms}ms</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">FastAPI Async Loop</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security Compliance</div>
          <div className="text-3xl font-extrabold text-indigo-400">{data.security_compliance}</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">SOC-2 Type II Verified</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold">Daily Expenditure Trend ($)</h3>
              <p className="text-xs text-muted-foreground">Cumulative LLM token expenditure by day</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily_trends}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#costGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold">Token Processing Volume</h3>
              <p className="text-xs text-muted-foreground">Daily processed tokens across active cluster nodes</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="tokens" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
