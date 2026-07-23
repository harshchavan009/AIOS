import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Home, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl font-extrabold font-mono text-rose-400">404</span>
          <h1 className="text-2xl font-bold tracking-tight text-white">Page Not Found</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            The target route does not exist in the AIOS frontend application.
          </p>
        </div>

        <Button
          variant="gradient"
          size="md"
          className="w-full"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Return to Home
        </Button>
      </div>
    </AuroraBackground>
  );
};
