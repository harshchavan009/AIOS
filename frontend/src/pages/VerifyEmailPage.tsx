import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MailCheck, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { Button } from '../components/ui/Button';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing email verification token in link.');
        return;
      }

      try {
        const res = await fetch('/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });
        if (res.ok) {
          setStatus('success');
          setMessage('Your enterprise email address has been verified successfully!');
        } else {
          const data = await res.json();
          setStatus('error');
          setMessage(data.detail || data.message || 'Invalid or expired verification token.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error verifying token.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md p-8 rounded-3xl glass-card border border-white/10 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary mx-auto flex items-center justify-center">
          <MailCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Email Verification</h2>
          <p className="text-xs text-muted-foreground mt-1">Enterprise Account Verification</p>
        </div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center space-y-3 py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-muted-foreground">Verifying token with AIOS auth engine...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-3">
            <div className="flex items-center justify-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verified!</span>
            </div>
            <p>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-3">
            <div className="flex items-center justify-center space-x-2 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Verification Failed</span>
            </div>
            <p>{message}</p>
          </div>
        )}

        <Button
          onClick={() => navigate('/login')}
          variant="gradient"
          className="w-full"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Return to Sign In
        </Button>
      </div>
    </AuroraBackground>
  );
};
