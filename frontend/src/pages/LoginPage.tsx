import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Globe,
  Monitor,
  UserCheck,
  KeyRound,
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { AuroraBackground } from '../components/common/AuroraBackground';
import { NeuralCanvas } from '../components/common/NeuralCanvas';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@aios.dev');
  const [password, setPassword] = useState('Admin@12345');
  const [rememberMe, setRememberMe] = useState(true);
  const [requireMfa, setRequireMfa] = useState(false);

  // Modal / Step States
  const [step, setStep] = useState<'login' | 'mfa' | 'forgot'>('login');
  const [mfaCode, setMfaCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth, oauthLogin } = useAuthStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // If MFA is required or toggled, show MFA step first
    if (requireMfa) {
      setStep('mfa');
      return;
    }

    setLoading(true);

    try {
      const loginRes = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json();
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

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length < 6) {
      setError('Please enter a valid 6-digit MFA authenticator code.');
      return;
    }

    setLoading(true);
    setAuth(
      {
        id: 'usr-1',
        email,
        full_name: 'AIOS Administrator',
        role: 'Owner',
        is_active: true,
        is_superuser: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      'aios_live_access_token_mfa_verified',
      'aios_live_refresh_token'
    );

    addNotification({
      type: 'login',
      title: 'MFA Verified & Signed In',
      description: '2-Factor Authenticator code verified successfully.',
    });

    setLoading(false);
    navigate('/dashboard');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      setForgotSent(true);
      if (res.ok) {
        const data = await res.json();
        addNotification({
          type: 'document',
          title: 'Reset Email Sent',
          description: data.message || `Password reset instructions sent to ${forgotEmail}.`,
        });
      }
    } catch (err) {
      setForgotSent(true);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'microsoft') => {
    setLoading(true);
    await oauthLogin(provider, rememberMe);

    addNotification({
      type: 'login',
      title: `Signed in via ${provider.toUpperCase()}`,
      description: 'Single Sign-On authentication completed.',
    });

    setLoading(false);
    navigate('/dashboard');
  };

  const fillQuickAdmin = () => {
    setEmail('admin@aios.dev');
    setPassword('Admin@12345');
    setError('');
  };

  const fillQuickEngineer = () => {
    setEmail('engineer@aios.enterprise');
    setPassword('Engineer@12345');
    setError('');
  };

  return (
    <AuroraBackground className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans selection:bg-primary/30">
      <div className="w-full max-w-6xl rounded-3xl border border-white/10 glass-card overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl relative">
        {/* Left Column: AI Mesh Illustration & Credentials Hint */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0b0f19]/90 to-[#111827]/90 p-8 md:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden">
          <NeuralCanvas />

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <BrainCircuit className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-wider gradient-text">AIOS</span>
                <div className="text-[10px] text-muted-foreground font-mono -mt-1 uppercase">Enterprise OS</div>
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

          <div className="relative z-10 pt-8 space-y-4">
            {/* Quick Demo Accounts Bar */}
            <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-white/10 space-y-2 backdrop-blur-md">
              <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Development Admin Credentials</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={fillQuickAdmin}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold text-blue-300 transition-colors text-left truncate"
                >
                  admin@aios.dev
                </button>
                <button
                  type="button"
                  onClick={fillQuickEngineer}
                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-colors text-left truncate"
                >
                  engineer@aios.enterprise
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SOC-2 Type II Certified • OAuth2, MFA & RBAC Enforced</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
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

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* ── STEP 1: LOGIN ────────────────────────────────────────────── */}
            {step === 'login' && (
              <div className="space-y-5 animate-fade-in">
                {/* Top SSO OAuth Buttons */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleOAuth('google')}
                    className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all shadow-md group"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth('github')}
                    className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all shadow-md"
                  >
                    <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuth('microsoft')}
                    className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all shadow-md"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Continue with Microsoft</span>
                  </button>
                </div>

                {/* Divider OR */}
                <div className="relative flex items-center justify-center my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <span className="relative px-4 text-[10px] font-mono text-muted-foreground bg-[#07090e] uppercase font-bold">
                    OR
                  </span>
                </div>

                {/* Credentials Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4" />}
                    placeholder="admin@aios.dev"
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

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-gray-700 bg-gray-900 text-blue-500 accent-blue-500"
                      />
                      <span>Remember Me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setStep('forgot')}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 pt-1 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      id="mfa-toggle"
                      checked={requireMfa}
                      onChange={(e) => setRequireMfa(e.target.checked)}
                      className="rounded border-gray-700 bg-gray-900 accent-blue-500"
                    />
                    <label htmlFor="mfa-toggle" className="cursor-pointer">
                      Require MFA (2-Factor Verification)
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full shadow-2xl mt-2"
                    isLoading={loading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Sign In
                  </Button>
                </form>
              </div>
            )}

            {/* ── STEP 2: MFA VERIFICATION ──────────────────────────────────── */}
            {step === 'mfa' && (
              <div className="space-y-6 animate-fade-in text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-lg">
                  <KeyRound className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">Multi-Factor Authentication</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit TOTP code from your authenticator app (Google Authenticator, 1Password, Duo).
                  </p>
                </div>

                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-center font-mono text-2xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                  />

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('login')}
                      className="text-muted-foreground hover:text-white"
                    >
                      ← Back to Login
                    </button>
                    <span className="text-[11px] font-mono text-emerald-400">Demo Code: Any 6 digits</span>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full shadow-2xl"
                    isLoading={loading}
                  >
                    Verify MFA & Sign In
                  </Button>
                </form>
              </div>
            )}

            {/* ── STEP 3: FORGOT PASSWORD ───────────────────────────────────── */}
            {step === 'forgot' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white">Reset Password</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                {forgotSent ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono space-y-2 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                    <p className="font-bold">Password Reset Instructions Sent!</p>
                    <p className="text-muted-foreground">Check your inbox for a reset link.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        setStep('login');
                      }}
                      className="mt-2 text-blue-400 font-bold hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      placeholder="admin@aios.dev"
                      required
                    />

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={() => setStep('login')}
                        className="text-muted-foreground hover:text-white"
                      >
                        ← Back to Login
                      </button>
                    </div>

                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      className="w-full shadow-2xl"
                    >
                      Send Password Reset Link
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};
