import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
    <path fill="#f35325" d="M1 1h10v10H1z"/>
    <path fill="#81bc06" d="M12 1h10v10H12z"/>
    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
    <path fill="#ffba08" d="M12 12h10v10H12z"/>
  </svg>
);

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth, oauthLogin } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, remember_me: rememberMe }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json().catch(() => ({}));
        throw new Error(errData?.detail || errData?.error?.message || 'Invalid email or password.');
      }

      const data = await loginRes.json();
      setAuth(data.user, data.access_token, data.refresh_token);

      addNotification({
        type: 'login',
        title: 'Authentication Successful',
        description: `Welcome back, ${data.user?.full_name || 'User'}!`,
      });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error authenticating with backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    setError('');
    setLoading(true);
    try {
      await oauthLogin(provider, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      setError(`OAuth authentication with ${provider} failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-primary/20 selection:text-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Mark */}
        <Link to="/" className="flex items-center justify-center space-x-2.5 mb-6 group">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-semibold text-sm">
            AI
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground">AIOS</span>
        </Link>

        <h1 className="text-center text-xl font-semibold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Access your multi-agent workspaces, Graph RAG indexes, and runtime telemetry.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
          {/* SSO Authentication Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <GitHubIcon />
              <span>Continue with GitHub</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('microsoft')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              <MicrosoftIcon />
              <span>Continue with Microsoft</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="bg-card px-2 text-[11px] text-muted-foreground uppercase font-medium absolute">
              Or continue with email
            </span>
          </div>

          {/* Inline Error State */}
          {error && (
            <div className="p-3 rounded border border-destructive/30 bg-destructive/5 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="space-y-1">
              <Input
                id="login-password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                isPassword
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 bg-background"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Auth Switch Link */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create an account
          </Link>
        </p>

        {/* Discreet Dev Environment Credentials Helper */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-center">
            <details className="text-[11px] text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Development test credentials
              </summary>
              <div className="mt-2 p-2 rounded border border-border bg-secondary/40 text-left space-y-1 font-mono text-[10px]">
                <div>Admin: <span className="text-foreground">admin@aios.dev</span> / <span className="text-foreground">Admin@12345</span></div>
                <div>Engineer: <span className="text-foreground">engineer@aios.enterprise</span> / <span className="text-foreground">Engineer@12345</span></div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
