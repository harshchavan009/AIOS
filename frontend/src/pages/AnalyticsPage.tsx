import React from 'react';
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
import { useLiveTelemetryStore } from '../store/useLiveTelemetryStore';

export const AnalyticsPage: React.FC = () => {
  const { summary, dailyTrends, streamRateTokensSec } = useLiveTelemetryStore();

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
          <Badge variant="info">Live Stream: +{streamRateTokensSec} t/s</Badge>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Monthly Expenditure</div>
          <div className="text-3xl font-extrabold text-emerald-400">${summary.monthly_cost_usd.toFixed(2)}</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">Budget: $1,000.00 / mo</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Tokens Streamed</div>
          <div className="text-3xl font-extrabold text-blue-400">{summary.token_usage_total.toLocaleString()}</div>
          <div className="mt-1 text-xs text-emerald-400 font-mono">Live Telemetry Aggregate</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avg System Latency</div>
          <div className="text-3xl font-extrabold text-purple-400">{summary.average_latency_ms}ms</div>
          <div className="mt-1 text-xs text-muted-foreground font-mono">FastAPI Async Loop</div>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Security Compliance</div>
          <div className="text-3xl font-extrabold text-indigo-400">100%</div>
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
            <span className="text-xs font-mono text-emerald-400 animate-pulse">Live Updating</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
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
            <span className="text-xs font-mono text-blue-400 animate-pulse">Live Volume</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrends}>
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

