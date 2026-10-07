import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
        body: JSON.stringify({ email: email.trim() }),
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Mark */}
        <Link to="/" className="flex items-center justify-center space-x-2.5 mb-6 group">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-[#0B0C0E] font-semibold text-sm">
            AI
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">AIOS</span>
        </Link>

        <h1 className="text-center text-xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Enter your email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="p-3 rounded border border-destructive/30 bg-destructive/5 text-xs text-destructive flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
              {resetToken && (
                <div className="pt-2 border-t border-emerald-500/20 font-mono text-[10px] break-all">
                  Reset Token: <span className="text-foreground">{resetToken}</span>
                  <div className="mt-2">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => navigate(`/reset-password?token=${resetToken}`)}
                    >
                      Proceed to Reset Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4">
            <Input
              id="reset-email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Instructions
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-border">
            <Link
              to="/login"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
