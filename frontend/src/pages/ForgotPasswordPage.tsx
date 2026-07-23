import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Failed to generate reset request.');
      }

      setMessage(data.message);
      if (data.reset_token) {
        setResetToken(data.reset_token);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans selection:bg-primary/30">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl space-y-6 border border-white/10 shadow-2xl relative z-10">
        
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-wider gradient-text">
            AIOS
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your enterprise email address. We will generate password reset instructions for your account.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{message}</span>
            </div>
            {resetToken && (
              <div className="mt-2 pt-2 border-t border-emerald-500/20 font-mono text-[10px] break-all">
                Reset Token: <span className="text-white">{resetToken}</span>
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors"
                  >
                    Proceed to Reset Password
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleRequestReset} className="space-y-4">
          <Input
            label="Enterprise Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            placeholder="engineer@aios.enterprise"
            required
          />

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full shadow-2xl"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Send Reset Instructions
          </Button>
        </form>

        <div className="pt-2 text-center border-t border-white/10">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-muted-foreground hover:text-white flex items-center justify-center space-x-2 mx-auto font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </div>
    </AuroraBackground>
  );
};
