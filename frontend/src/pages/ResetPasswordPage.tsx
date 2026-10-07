import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), new_password: newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Password reset failed.');
      }

      setMessage(data.message || 'Password successfully reset. Redirecting...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error processing password reset.');
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
          Set new password
        </h1>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Enter your reset token and new password to restore account access.
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
            <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              id="reset-token"
              label="Reset token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste reset token..."
              required
            />

            <Input
              id="new-password"
              label="New password"
              type="password"
              isPassword
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min. 8 characters)"
              required
            />

            <Input
              id="confirm-password"
              label="Confirm new password"
              type="password"
              isPassword
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
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
              Update Password
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
