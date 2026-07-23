import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Github,
  Globe
} from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { NeuralCanvas } from '../components/common/NeuralCanvas';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('engineer@aios.enterprise');
  const [password, setPassword] = useState('SecurePassword123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
        throw new Error(errData?.error?.message || errData?.detail || 'Invalid email or password.');
      }

      const data = await loginRes.json();
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error authenticating with backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans selection:bg-primary/30">
      <div className="w-full max-w-6xl rounded-3xl border border-white/10 glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl relative">
        
        {/* Left Column: AI Mesh Illustration & Product Metrics */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0b0f19]/90 to-[#111827]/90 p-8 md:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
          <NeuralCanvas />

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-wider gradient-text">
                  AIOS
                </span>
                <div className="text-[10px] text-muted-foreground font-mono -mt-1 uppercase">
                  Enterprise OS
                </div>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              <Badge variant="info" pulse>
                AIOS Platform Multi-Agent Core
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Enterprise AI Sign In
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                Log in to access your multi-agent AI environment, Graph RAG semantic memory, and model provider gateway.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12 space-y-4">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC-2 Type II Certified • OAuth2 & RBAC Enforced</span>
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphism Auth Card */}
        <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center bg-[#07090e]/70 relative z-10">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            <div className="flex rounded-xl bg-muted/40 p-1 border border-white/10">
              <button
                type="button"
                className="flex-1 py-2 text-xs font-bold rounded-lg bg-primary text-white shadow-md transition-all"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 py-2 text-xs font-bold rounded-lg text-muted-foreground hover:text-white transition-all"
              >
                Register Account
              </button>
            </div>

            <div className="text-left space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
              <p className="text-xs text-muted-foreground">Enter your credentials to sign in.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Enterprise Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                placeholder="engineer@aios.enterprise"
                required
              />

              <Input
                label="Password"
                isPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="••••••••••••"
                required
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-700 bg-gray-900 text-primary" />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-primary hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full shadow-2xl"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to AIOS
              </Button>
            </form>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-4 text-[10px] font-mono text-muted-foreground bg-[#07090e] uppercase">
                Or Continue With
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                <Github className="w-4 h-4 text-white" />
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};
