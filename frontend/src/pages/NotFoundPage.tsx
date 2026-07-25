import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, ArrowLeft, LayoutDashboard, Sparkles, Terminal } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full glass-card p-10 md:p-12 rounded-3xl space-y-6 border border-white/10 shadow-2xl relative z-10 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
          <Network className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
            <span>ERROR 404</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Workflow Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            The target LangGraph DAG workflow route, agent node, or resource does not exist in your AIOS workspace.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="gradient"
            size="lg"
            className="w-full shadow-xl shadow-blue-500/25"
            onClick={() => navigate('/dashboard')}
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
          >
            Go Dashboard
          </Button>
        </div>
      </div>
    </AuroraBackground>
  );
};
