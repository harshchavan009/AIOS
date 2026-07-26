import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Brain,
  Database,
  Terminal,
  MessageSquare,
  Network,
  Zap,
  Filter,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useLiveTelemetryStore } from '../../store/useLiveTelemetryStore';

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description?: string;
  category: 'agent' | 'retrieval' | 'graph' | 'llm' | 'system';
  status: 'completed' | 'running' | 'info';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

const INITIAL_EVENTS: TimelineEvent[] = [
  {
    id: 'ev-5',
    time: '10:25',
    title: 'User Uploaded PDF',
    description: 'Enterprise document uploaded & ingested into vector store',
    category: 'system',
    status: 'completed',
    icon: FileText,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    id: 'ev-4',
    time: '10:24',
    title: 'Workflow Complete',
    description: 'LangGraph multi-agent execution pipeline finished successfully',
    category: 'agent',
    status: 'completed',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'ev-3',
    time: '10:23',
    title: 'Neo4j Connected',
    description: 'Knowledge graph entity relationships traversed and linked',
    category: 'graph',
    status: 'completed',
    icon: Network,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10',
  },
  {
    id: 'ev-2',
    time: '10:22',
    title: 'Retriever Searching',
    description: 'Hybrid vector search querying Qdrant collection',
    category: 'retrieval',
    status: 'running',
    icon: Database,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'ev-1',
    time: '10:21',
    title: 'Planner Started',
    description: 'LangGraph DAG decomposition initialized for task execution',
    category: 'agent',
    status: 'completed',
    icon: Brain,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export const ActivityTimelinePanel: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>(INITIAL_EVENTS);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { theme } = useThemeStore();
  const { tickCounter } = useLiveTelemetryStore();

  const isLight = theme === 'light';

  // Periodically append new dynamic live timeline events
  useEffect(() => {
    if (tickCounter > 0 && tickCounter % 4 === 0) {
      const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const DYNAMIC_EVENT_POOL: Omit<TimelineEvent, 'id' | 'time'>[] = [
        {
          title: 'Graph Synced & Index Updated',
          description: 'Inserted 24 entity nodes into Neo4j graph',
          category: 'graph',
          status: 'completed',
          icon: Network,
          color: 'text-teal-400',
          bg: 'bg-teal-500/10',
        },
        {
          title: 'Critic Agent Quality Pass',
          description: 'DeepEval verified 98.4% faithfulness score',
          category: 'agent',
          status: 'completed',
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          title: 'Token Stream Rate Peak',
          description: 'Stream velocity reached 142 tokens/sec',
          category: 'llm',
          status: 'info',
          icon: Zap,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
        },
        {
          title: 'Qdrant Collection Vacuumed',
          description: 'Vector store index optimized for fast retrieval',
          category: 'retrieval',
          status: 'completed',
          icon: Database,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
      ];

      const template = DYNAMIC_EVENT_POOL[Math.floor(Math.random() * DYNAMIC_EVENT_POOL.length)];
      const newEv: TimelineEvent = {
        ...template,
        id: `ev-live-${Date.now()}`,
        time: nowTime,
      };

      setEvents((prev) => [newEv, ...prev.slice(0, 11)]);
    }
  }, [tickCounter]);

  const filteredEvents = events.filter((ev) => {
    if (filterCategory === 'all') return true;
    return ev.category === filterCategory;
  });

  return (
    <div className="glass-card p-6 rounded-2xl space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h3 className="text-base font-extrabold tracking-tight flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-500 animate-pulse" />
            <span>Activity Feed</span>
          </h3>
          <p className="text-xs text-muted-foreground">Real-time audit feed of multi-agent execution, RAG queries, and system events</p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1 hidden sm:inline-block" />
          {['all', 'agent', 'graph', 'retrieval', 'llm'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] capitalize transition-colors ${
                filterCategory === cat
                  ? 'bg-blue-500 text-white font-bold shadow-sm'
                  : 'text-muted-foreground hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-blue-500 before:via-teal-500/50 before:to-gray-700/20">
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No events match the selected category
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const Icon = ev.icon;
            const isFirst = idx === 0;

            return (
              <div key={ev.id} className="relative group transition-all">
                {/* Timeline Connector Dot */}
                <div
                  className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 transition-all shrink-0 flex items-center justify-center ${
                    isFirst
                      ? 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/20 animate-pulse'
                      : isLight
                      ? 'bg-white border-blue-400'
                      : 'bg-[#0E121B] border-blue-500/60'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`p-2 rounded-xl border border-white/10 shrink-0 mt-0.5 ${ev.bg} ${ev.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-foreground group-hover:text-blue-400 transition-colors truncate tracking-tight">
                          {ev.title}
                        </h4>
                        {ev.status === 'completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      {ev.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Timestamp Badge */}
                  <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-center font-mono text-[11px] text-muted-foreground/80 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span className="font-bold">{ev.time}</span>
                  </div>
                </div>

                {/* Dashed Item Divider */}
                {idx < filteredEvents.length - 1 && (
                  <div className="border-b border-dashed border-border/40 mt-4" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-2 border-t border-border/40">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Real-time Event Ingestion</span>
        </span>
        <span>Showing {filteredEvents.length} events</span>
      </div>
    </div>
  );
};
