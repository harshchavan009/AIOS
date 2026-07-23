import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrainCircuit, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Password reset failed.');
      }

      setMessage(data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error processing password reset.');
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Set New Password</h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Enter your reset token and new password to restore account access.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4" />}
            placeholder="Paste reset token..."
            required
          />

          <Input
            label="New Password"
            isPassword
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••••••"
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
            Update Password
          </Button>
        </form>
      </div>
    </AuroraBackground>
  );
};
