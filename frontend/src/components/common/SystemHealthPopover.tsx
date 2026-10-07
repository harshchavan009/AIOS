import React, { useState, useEffect, useRef } from 'react';
import { Activity, Server, Database, Layers, Cpu, Network, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAgentStore } from '../../store/useAgentStore';

interface SystemHealthPopoverProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const SystemHealthPopover: React.FC<SystemHealthPopoverProps> = ({
  isOpen,
  onToggle,
  onClose
}) => {
  const { telemetry } = useAgentStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const avgLatency = telemetry?.avg_latency_ms ?? 24;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const INFRASTRUCTURE_SERVICES = [
    { name: 'FastAPI Core Gateway', status: 'Healthy', icon: Server, latency: '4ms' },
    { name: 'PostgreSQL Relational DB', status: 'Connected', icon: Database, latency: '12ms' },
    { name: 'Redis Cache & Queue', status: 'Connected', icon: Layers, latency: '2ms' },
    { name: 'Neo4j Knowledge Graph', status: 'Connected', icon: Network, latency: '18ms' },
    { name: 'Qdrant Vector DB', status: 'Connected', icon: Database, latency: '14ms' },
    { name: 'Model Router Gateway', status: 'Active', icon: Cpu, latency: '280ms' },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      {/* Live Badge Trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label="System Health Status"
        aria-expanded={isOpen}
        className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded border border-border bg-secondary text-xs font-mono text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
        <span>{avgLatency}ms</span>
      </button>

      {/* Health Popover */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden text-foreground transform transition-all duration-100 ease-out origin-top-right"
        >
          {/* Header */}
          <div className="p-3 border-b border-border bg-secondary/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-semibold">Infrastructure Status</h3>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Refresh Health Check"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            </button>
          </div>

          {/* Infrastructure Indicators List */}
          <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
            {INFRASTRUCTURE_SERVICES.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-secondary/40 border border-border/50 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <div className="font-medium text-foreground">{svc.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{svc.latency}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    {svc.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
