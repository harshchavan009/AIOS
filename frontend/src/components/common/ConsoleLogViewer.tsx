import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Copy,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export type LogLevel = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
}

const DEFAULT_LOGS: LogEntry[] = [
  { id: '1', timestamp: '10:23:01', level: 'INFO', message: 'Planner Agent Started', source: 'langgraph.planner' },
  { id: '2', timestamp: '10:23:04', level: 'INFO', message: 'Neo4j Connected (bolt://localhost:7687)', source: 'graph.neo4j' },
  { id: '3', timestamp: '10:23:08', level: 'WARNING', message: 'Retrying Query: Qdrant vector index warming up...', source: 'rag.vector' },
  { id: '4', timestamp: '10:23:12', level: 'SUCCESS', message: 'Workflow Complete: 4 nodes executed in 1.4s', source: 'aios.orchestrator' },
];

export const ConsoleLogViewer: React.FC<{ initialLogs?: LogEntry[] }> = ({ initialLogs }) => {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs || DEFAULT_LOGS);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const isLight = theme === 'light';

  // Live log simulation engine
  useEffect(() => {
    if (!isLiveStream) return;

    const SAMPLE_LOGS: Omit<LogEntry, 'id' | 'timestamp'>[] = [
      { level: 'INFO', message: 'Planner Started', source: 'langgraph.planner' },
      { level: 'INFO', message: 'Neo4j Connected', source: 'graph.neo4j' },
      { level: 'WARNING', message: 'Retrying Query', source: 'rag.vector' },
      { level: 'SUCCESS', message: 'Workflow Complete', source: 'aios.orchestrator' },
      { level: 'INFO', message: 'FastAPI REST Gateway token refreshed', source: 'auth.jwt' },
      { level: 'SUCCESS', message: 'RAGAS Faithfulness evaluation: 98.4%', source: 'eval.ragas' },
    ];

    const interval = setInterval(() => {
      const randomLog = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)];
      const newEntry: LogEntry = {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...randomLog,
      };

      setLogs((prev) => [...prev.slice(-99), newEntry]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStream]);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((l) => {
    const matchesLevel = filterLevel === 'ALL' || l.level === filterLevel;
    const matchesSearch =
      !searchQuery.trim() ||
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.source && l.source.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'INFO':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 font-mono font-bold text-[10px] border border-blue-500/30 flex items-center space-x-1">
            <Info className="w-3 h-3" />
            <span>INFO</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono font-bold text-[10px] border border-amber-500/30 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3" />
            <span>WARNING</span>
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUCCESS</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 font-mono font-bold text-[10px] border border-rose-500/30 flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>ERROR</span>
          </span>
        );
    }
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    addNotification({
      type: 'document',
      title: 'Console Logs Copied',
      description: 'Log stream copied to system clipboard.',
    });
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col font-sans">
      {/* Console Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-[#06080E] flex flex-wrap items-center justify-between gap-3">
        {/* Left Title & Traffic Light Buttons */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gray-200">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>AIOS Execution Log Console</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Level Filter Dropdown */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 focus:outline-none"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-7 pr-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 w-32 sm:w-40"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2" />
          </div>

          {/* Live Toggle */}
          <button
            type="button"
            onClick={() => setIsLiveStream(!isLiveStream)}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all flex items-center space-x-1.5 ${
              isLiveStream
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            {isLiveStream ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isLiveStream ? 'Streaming' : 'Paused'}</span>
          </button>

          {/* Copy Logs */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 transition-colors"
            title="Copy Logs"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            type="button"
            onClick={() => setLogs([])}
            className="p-1.5 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Log Stream Window */}
      <div className="p-4 bg-[#080C14] max-h-80 overflow-y-auto font-mono text-xs space-y-2 divide-y divide-white/[0.04]">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 leading-relaxed">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-[11px] shrink-0">[{log.timestamp}]</span>
                <div className="shrink-0">{getLevelBadge(log.level)}</div>
                <span className="text-gray-200 font-bold text-xs">{log.message}</span>
              </div>

              {log.source && (
                <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
                  {log.source}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground text-xs font-mono">
            No console log entries match current filter criteria.
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
