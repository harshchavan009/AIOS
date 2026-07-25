import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, RefreshCw, Terminal, AlertOctagon, ArrowLeft, LayoutDashboard, ChevronDown } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Button } from '../components/ui/Button';

export const ServerErrorPage: React.FC<{ errorDetails?: string }> = ({
  errorDetails = 'RuntimeError: LangGraph agent worker process terminated unexpectedly (Exit Code 139).',
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full glass-card p-10 md:p-12 rounded-3xl space-y-6 border border-rose-500/20 shadow-2xl relative z-10 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <Bot className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-mono font-bold border border-rose-500/20">
            <span>ERROR 500</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Agent Crashed</h1>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            An unhandled exception occurred in the agent worker thread or multi-model LLM router.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full shadow-lg shadow-rose-500/20"
            onClick={handleRetry}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry
          </Button>

          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>View Logs</span>
          </button>
        </div>

        {/* Terminal Logs Drawer */}
        {showLogs && (
          <div className="p-4 rounded-2xl bg-[#06080e] border border-white/10 font-mono text-left text-[11px] space-y-2 animate-fade-in">
            <div className="flex items-center justify-between text-muted-foreground border-b border-white/10 pb-2">
              <span className="font-bold text-rose-400 flex items-center space-x-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Worker Crash Traceback</span>
              </span>
              <span>127.0.0.1</span>
            </div>
            <div className="text-rose-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {errorDetails}
            </div>
            <div className="text-gray-500 text-[10px]">
              FastAPI Loop • Redis Broker Connection OK • Celery Worker Offline
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-muted-foreground hover:text-white transition-colors inline-flex items-center space-x-1"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
};
