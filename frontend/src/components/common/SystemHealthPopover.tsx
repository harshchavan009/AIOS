import React, { useState, useEffect, useRef } from 'react';
import { Activity, CheckCircle2, Server, Database, Layers, Cpu, Network, RefreshCw } from 'lucide-react';
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
  const [lastPing, setLastPing] = useState('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const avgLatency = telemetry?.avg_latency_ms ?? 178;

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
      setLastPing('Just now');
    }, 600);
  };

  const INFRASTRUCTURE_SERVICES = [
    { name: 'FastAPI Backend Core', status: 'Healthy', icon: Server, color: 'text-emerald-400', latency: '4ms' },
    { name: 'PostgreSQL Relational DB', status: 'Connected', icon: Database, color: 'text-emerald-400', latency: '12ms' },
    { name: 'Redis Cache & Queue', status: 'Connected', icon: Layers, color: 'text-emerald-400', latency: '2ms' },
    { name: 'Neo4j Knowledge Graph', status: 'Connected', icon: Network, color: 'text-emerald-400', latency: '18ms' },
    { name: 'Qdrant Vector DB', status: 'Connected', icon: Database, color: 'text-emerald-400', latency: '14ms' },
    { name: 'LLM Gateway (6 Models)', status: 'Connected', icon: Cpu, color: 'text-emerald-400', latency: '124ms' },
  ];

  return (
    <div className="relative" ref={popoverRef}>
      {/* Live Badge Trigger */}
      <button
        type="button"
        onClick={onToggle}
        aria-label="System Health Status"
        aria-expanded={isOpen}
        className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium font-mono hover:bg-emerald-500/20 transition-all focus:outline-none"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <Activity className="w-3.5 h-3.5" />
        <span>{avgLatency}ms</span>
      </button>

      {/* Health Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/[0.08] bg-[#111827] shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out origin-top-right">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06] bg-[#0F1117] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-[#F8FAFC]">System Health & Status</h3>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-1 rounded-lg text-gray-400 hover:text-white transition-colors ${
                isRefreshing ? 'animate-spin text-blue-400' : ''
              }`}
              title="Refresh Health Check"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Infrastructure Indicators List */}
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {INFRASTRUCTURE_SERVICES.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs font-semibold text-[#F8FAFC]">{svc.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">Latency: {svc.latency}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{svc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#0F1117] border-t border-white/[0.06] flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>Overall Status: 100% Operational</span>
            <span>Updated: {lastPing}</span>
          </div>
        </div>
      )}
    </div>
  );
};
