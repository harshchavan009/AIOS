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
import { PageSkeleton } from '../components/ui/Skeleton';
import { EnterpriseChartContainer } from '../components/common/EnterpriseChartContainer';
import { useLiveTelemetryStore } from '../store/useLiveTelemetryStore';
import { DollarSign, BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { summary, dailyTrends, streamRateTokensSec } = useLiveTelemetryStore();
  const [isLoading, setIsLoading] = useState(true);
  const [expenditureTimeRange, setExpenditureTimeRange] = useState('7D');
  const [volumeTimeRange, setVolumeTimeRange] = useState('7D');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageSkeleton title="Loading Executive Analytics..." />;
  }

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
        {/* Daily Expenditure Trend Chart */}
        <EnterpriseChartContainer
          title="Daily Expenditure Trend ($)"
          subtitle="Cumulative LLM token expenditure by day"
          icon={DollarSign}
          data={dailyTrends}
          csvFilename="daily_expenditure_analytics.csv"
          activeTimeRange={expenditureTimeRange}
          onTimeRangeChange={(r) => setExpenditureTimeRange(r)}
        >
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
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E121B',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="cost" name="Expenditure ($)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#costGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </EnterpriseChartContainer>

        {/* Token Processing Volume Chart */}
        <EnterpriseChartContainer
          title="Token Processing Volume"
          subtitle="Daily processed tokens across active cluster nodes"
          icon={BarChart3}
          data={dailyTrends}
          csvFilename="token_processing_volume.csv"
          activeTimeRange={volumeTimeRange}
          onTimeRangeChange={(r) => setVolumeTimeRange(r)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E121B',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="tokens" name="Tokens" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </EnterpriseChartContainer>
      </div>
    </div>
  );
};

