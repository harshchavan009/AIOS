import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Palette,
  CreditCard,
  Key,
  Users,
  ShieldCheck,
  Webhook,
  Lock,
  Building2,
  Sliders,
  Fingerprint,
  Plus,
  Trash2,
  Check,
  Copy,
  Laptop,
  History,
  AlertCircle,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  DollarSign,
  Sun,
  Moon,
  Sparkles,
  LogIn,
  UserPlus,
  Edit3,
  Download,
  Search,
  Brain,
  Bot,
  SlidersHorizontal,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { useNotificationStore } from '../store/useNotificationStore';

type SettingsTab =
  | 'profile'
  | 'theme'
  | 'billing'
  | 'api-keys'
  | 'team'
  | 'audit'
  | 'webhooks'
  | 'oauth'
  | 'security'
  | 'organization'
  | 'usage-limits'
  | 'pats';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'profile');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const { currentOrganization, currentWorkspace } = useWorkspaceStore();
  const { user, loginHistory, fetchLoginHistory, sessions, fetchSessions, revokeSession, updatePreferences, uploadAvatar, deleteAccount } = useAuthStore();
  const { theme, toggleTheme, setTheme } = useThemeStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const isLight = theme === 'light';

  // State forms
  const [profileName, setProfileName] = useState(user?.full_name || 'AIOS User');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'user@aios.dev');
  const [userRole, setUserRole] = useState(user?.role || 'Developer');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [timezone, setTimezone] = useState('UTC-5 (Eastern Time)');

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'Production Gateway Key', prefix: 'aios_live_8f9a...', created: '2026-07-01', lastUsed: '2 mins ago', status: 'active' },
    { id: 'key-2', name: 'Staging Integration Worker', prefix: 'aios_live_3k2m...', created: '2026-07-15', lastUsed: '1 hour ago', status: 'active' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  // PATs state
  const [pats, setPats] = useState([
    { id: 'pat-1', name: 'CLI Developer Token', scope: 'full_access', expires: 'In 90 days', created: '2026-06-20' },
  ]);
  const [patName, setPatName] = useState('');

  // Webhooks state
  const [webhooks, setWebhooks] = useState([
    { id: 'wh-1', url: 'https://api.enterprise.com/webhooks/aios', events: ['workflow.completed', 'agent.failed'], status: 'active', secret: 'whsec_98a72b...' },
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  // Usage Limits state
  const [tpmLimit, setTpmLimit] = useState(50);
  const [maxAgents, setMaxAgents] = useState(6);
  const [costAlert, setCostAlert] = useState(800);

  // Security state
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.0/24, 10.0.0.0/8');

  useEffect(() => {
    fetchSessions();
    fetchLoginHistory();
  }, []);

  const handleSaveProfile = async () => {
    const success = await updatePreferences({ full_name: profileName, role: userRole });
    if (success) {
      addNotification({
        type: 'login',
        title: 'Profile Updated',
        description: 'Your profile details and preferences have been updated.',
      });
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      const success = await uploadAvatar(base64);
      if (success) {
        addNotification({
          type: 'login',
          title: 'Avatar Updated',
          description: 'Your profile picture avatar has been updated.',
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeleting(true);
    const success = await deleteAccount();
    setIsDeleting(false);
    if (success) {
      addNotification({
        type: 'login',
        title: 'Account Deleted',
        description: 'Your account has been deactivated and active sessions revoked.',
      });
    }
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    const newSecret = `aios_live_sec_${Math.random().toString(36).substring(2, 12)}`;
    const newEntry = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      prefix: `${newSecret.substring(0, 12)}...`,
      created: 'Just now',
      lastUsed: 'Never',
      status: 'active',
    };
    setApiKeys([newEntry, ...apiKeys]);
    setGeneratedKey(newSecret);
    setNewKeyName('');
    addNotification({
      type: 'key',
      title: 'API Key Copied',
      description: 'New API secret created and copied to clipboard.',
    });
  };

  const handleCreatePat = () => {
    if (!patName.trim()) return;
    const newPat = {
      id: `pat-${Date.now()}`,
      name: patName,
      scope: 'full_access',
      expires: 'In 90 days',
      created: 'Just now',
    };
    setPats([newPat, ...pats]);
    setPatName('');
    addNotification({
      type: 'key',
      title: 'Personal Access Token Created',
      description: `Token "${patName}" generated successfully.`,
    });
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl.trim()) return;
    const newWh = {
      id: `wh-${Date.now()}`,
      url: newWebhookUrl,
      events: ['workflow.completed'],
      status: 'active',
      secret: `whsec_${Math.random().toString(36).substring(2, 10)}`,
    };
    setWebhooks([newWh, ...webhooks]);
    setNewWebhookUrl('');
    addNotification({
      type: 'workflow',
      title: 'Webhook Registered',
      description: `Endpoint ${newWebhookUrl} attached to active event bus.`,
    });
  };

  const TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'oauth', label: 'OAuth & SSO', icon: Globe },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'usage-limits', label: 'Usage Limits', icon: Sliders },
    { id: 'pats', label: 'Personal Access Tokens', icon: Fingerprint },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Settings & Security Governance</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account preferences, RBAC permissions, API secrets, OAuth integrations, and compliance policies.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="success">SOC-2 Type II Enforced</Badge>
          <Badge variant="info">{currentOrganization?.name || 'AIOS Enterprise'}</Badge>
        </div>
      </div>

      {/* 12 Tab Pill Navigation */}
      <div className="flex items-center overflow-x-auto p-1.5 rounded-2xl bg-white/5 border border-white/10 space-x-1 font-mono text-xs no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id }, { replace: true });
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl shrink-0 transition-all font-semibold ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: PROFILE ─────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-3xl animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-lg shadow-blue-500/20" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-blue-500/20">
                    {profileName.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-[10px] font-bold text-white uppercase tracking-wider">
                  Upload
                  <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">{profileName}</h3>
                <p className="text-xs text-muted-foreground font-mono">{profileEmail} • {userRole} Role</p>
              </div>
            </div>
            <label className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold cursor-pointer text-foreground transition-all">
              Change Avatar
              <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={profileEmail}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-muted-foreground focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Timezone Preference</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground font-mono focus:outline-none"
              >
                <option value="UTC-5 (Eastern Time)">UTC-5 (Eastern Time)</option>
                <option value="UTC+0 (Greenwich Mean Time)">UTC+0 (Greenwich Mean Time)</option>
                <option value="UTC+5:30 (Indian Standard Time)">UTC+5:30 (Indian Standard Time)</option>
                <option value="UTC+8 (Singapore Standard Time)">UTC+8 (Singapore Standard Time)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40 flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
            >
              Save Profile Changes
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="pt-6 border-t border-rose-500/30 space-y-3">
            <h4 className="text-sm font-extrabold text-rose-400 flex items-center space-x-2">
              <Trash2 className="w-4 h-4" />
              <span>Danger Zone — Delete Account</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Permanently delete your user account, revoke active sessions, and remove access token authorizations.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all"
            >
              Delete Account...
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-3xl max-w-md w-full border border-rose-500/30 space-y-4">
            <h3 className="text-lg font-extrabold text-rose-400">Confirm Account Deletion</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete your AIOS account? This will revoke all your JWT refresh sessions immediately.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/30"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: THEME ───────────────────────────────────────────────────── */}
      {activeTab === 'theme' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-3xl animate-fade-in">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Appearance & Dark Mode Controls</h3>
            <p className="text-xs text-muted-foreground">Select your preferred user interface design theme and glassmorphism styling</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div
              onClick={() => setTheme('graphite')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                theme === 'graphite'
                  ? 'bg-blue-600/15 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Moon className="w-6 h-6 text-blue-400" />
                {theme === 'graphite' && <Badge variant="info">Active Theme</Badge>}
              </div>
              <h4 className="text-sm font-extrabold text-white">Apple Pro Obsidian Dark</h4>
              <p className="text-xs text-gray-400 mt-1">Deep obsidian glassmorphism, dynamic glowing meshes, and vibrant contrast.</p>
            </div>

            <div
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Sun className="w-6 h-6 text-amber-500" />
                {theme === 'light' && <Badge variant="info">Active Theme</Badge>}
              </div>
              <h4 className="text-sm font-extrabold text-gray-900">Enterprise Clean Light</h4>
              <p className="text-xs text-gray-500 mt-1">Sleek slate white background, crisp enterprise cards, and high readability.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: BILLING ─────────────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Subscription Plan & Billing</h3>
              <p className="text-xs text-muted-foreground">Manage your monthly token commitment and billing history</p>
            </div>
            <Badge variant="success">Active Enterprise Tier</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-mono text-muted-foreground">Monthly Budget</div>
              <div className="text-2xl font-extrabold text-emerald-400">$1,000.00 / mo</div>
              <div className="text-[11px] text-muted-foreground font-mono">Current Spend: $442.80</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-mono text-muted-foreground">Payment Method</div>
              <div className="text-sm font-extrabold text-foreground flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Visa ending in 8842</span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">Expires 09/2028</div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-mono text-muted-foreground">Next Invoice</div>
              <div className="text-sm font-extrabold text-foreground">August 1, 2026</div>
              <div className="text-[11px] text-emerald-400 font-mono">Auto-renewal enabled</div>
            </div>
          </div>

          {/* Invoice History */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase font-mono text-muted-foreground">Invoice Receipts</h4>
            {[
              { date: 'Jul 1, 2026', amount: '$1,000.00', status: 'PAID', invoice: 'INV-2026-0701' },
              { date: 'Jun 1, 2026', amount: '$1,000.00', status: 'PAID', invoice: 'INV-2026-0601' },
            ].map((inv) => (
              <div key={inv.invoice} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-foreground">{inv.invoice}</span>
                  <span className="text-muted-foreground ml-3">{inv.date}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-emerald-400">{inv.amount}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: API KEYS ────────────────────────────────────────────────── */}
      {activeTab === 'api-keys' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Programmatic Service API Keys</h3>
              <p className="text-xs text-muted-foreground">API keys authenticate worker nodes and REST gateway connections</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Description (e.g. CI/CD Key)"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleCreateApiKey}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Key</span>
              </button>
            </div>
          </div>

          {generatedKey && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-1.5">
              <div className="text-emerald-400 font-bold">New Secret Key Generated (Copy now, secret won't be shown again):</div>
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-bold break-all flex items-center justify-between">
                <span>{generatedKey}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedKey);
                    addNotification({ type: 'key', title: 'API Key Copied', description: 'Copied to clipboard.' });
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 font-mono text-xs">
            {apiKeys.map((k) => (
              <div key={k.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-foreground">{k.name}</div>
                  <div className="text-[11px] text-muted-foreground">{k.prefix} • Created: {k.created}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="success">{k.status.toUpperCase()}</Badge>
                  <button
                    type="button"
                    onClick={() => setApiKeys(apiKeys.filter((item) => item.id !== k.id))}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 5: TEAM MEMBERS ────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">5-Tier RBAC Team Members</h3>
              <p className="text-xs text-muted-foreground">Manage organization access control roles (Owner, Admin, Developer, Analyst, Viewer)</p>
            </div>
            <Badge variant="info">5 Members Active</Badge>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Senior AI Systems Architect', role: 'Owner', email: 'engineer@aios.enterprise' },
              { name: 'DevOps & Infra Lead', role: 'Admin', email: 'admin@aios.enterprise' },
              { name: 'ML Engineer', role: 'Developer', email: 'dev@aios.enterprise' },
              { name: 'Data Analyst', role: 'Analyst', email: 'analyst@aios.enterprise' },
              { name: 'Security Auditor', role: 'Viewer', email: 'auditor@aios.enterprise' },
            ].map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-foreground">{m.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{m.email}</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono font-bold border border-blue-500/20">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: AUDIT LOGS ──────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>SOC-2 Type II Enterprise Audit Logs</span>
              </h3>
              <p className="text-xs text-muted-foreground">Immutable append-only audit ledger of security events, administrative logins, API secrets, and resource mutations</p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Badge variant="success">SOC-2 Enforced</Badge>
              <button
                type="button"
                onClick={() => addNotification({ type: 'workflow', title: 'Audit Exported', description: 'Downloaded SHA-256 signed audit log CSV snapshot.' })}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Audit Log Stream */}
          <div className="space-y-3">
            {[
              {
                id: 'aud-1',
                timestamp: '10:25:04 AM',
                action: 'Admin Login',
                actor: 'harsh@aios.dev',
                details: 'Authenticated via Google Workspace OAuth2 + TOTP MFA',
                ip: '192.168.1.45',
                severity: 'info',
                icon: LogIn,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                id: 'aud-2',
                timestamp: '10:22:18 AM',
                action: 'API Key Created',
                actor: 'alex@aios.dev',
                details: 'Issued Production Gateway Secret (prefix: aios_live_8f9a...)',
                ip: '10.0.4.12',
                severity: 'success',
                icon: Key,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                id: 'aud-3',
                timestamp: '10:18:42 AM',
                action: 'Workflow Deleted',
                actor: 'sarah@aios.dev',
                details: 'Permanently deleted LangGraph DAG "Legacy Customer Support Worker"',
                ip: '172.16.0.8',
                severity: 'danger',
                icon: Trash2,
                color: 'text-rose-400',
                bg: 'bg-rose-500/10',
              },
              {
                id: 'aud-4',
                timestamp: '10:12:09 AM',
                action: 'User Added',
                actor: 'harsh@aios.dev',
                details: 'Granted Workspace Admin role to dev-lead@aios.dev',
                ip: '192.168.1.45',
                severity: 'info',
                icon: UserPlus,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
              },
              {
                id: 'aud-5',
                timestamp: '10:05:31 AM',
                action: 'Prompt Edited',
                actor: 'prompt-engineer@aios.dev',
                details: 'Updated system prompt version v2.4 for "Enterprise RAG Synthesizer"',
                ip: '192.168.1.88',
                severity: 'warning',
                icon: Edit3,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
            ].map((log) => {
              const Icon = log.icon;
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isLight
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-[#080B10] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`p-2.5 rounded-xl border border-white/10 shrink-0 ${log.bg} ${log.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-foreground tracking-tight">{log.action}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground border border-white/5">
                          {log.actor}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{log.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end md:self-center font-mono text-[11px] text-muted-foreground">
                    <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-emerald-400 font-bold">
                      {log.ip}
                    </span>
                    <span className="font-bold text-gray-400">{log.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-2 border-t border-border/40">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Audit Ledger Active</span>
            </span>
            <span>5 Events Logged</span>
          </div>
        </div>
      )}

      {/* ── TAB 7: WEBHOOKS ────────────────────────────────────────────────── */}
      {activeTab === 'webhooks' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Outbound Webhook Endpoints</h3>
              <p className="text-xs text-muted-foreground">Receive HTTP POST payloads when DAG workflows complete or fails</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://api.enterprise.com/webhooks"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-blue-500 w-64"
              />
              <button
                type="button"
                onClick={handleCreateWebhook}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Webhook</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {webhooks.map((wh) => (
              <div key={wh.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-foreground truncate">{wh.url}</div>
                  <Badge variant="success">{wh.status.toUpperCase()}</Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Events: {wh.events.join(', ')}</span>
                  <span>Signing Secret: {wh.secret}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 8: OAUTH & SSO ─────────────────────────────────────────────── */}
      {activeTab === 'oauth' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">SSO & OAuth Identity Providers</h3>
            <p className="text-xs text-muted-foreground">Authenticate users via GitHub SSO, Google Workspace, Okta SAML 2.0, or Azure AD</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'GitHub OAuth2', status: 'Connected', desc: 'SAML SSO organization sync enabled' },
              { name: 'Google Workspace', status: 'Configured', desc: 'Domain restriction: @aios.dev' },
              { name: 'Okta Enterprise SAML 2.0', status: 'Available', desc: 'Single Sign-On for enterprise users' },
              { name: 'Azure Active Directory', status: 'Available', desc: 'Microsoft Entra ID authentication' },
            ].map((idp) => (
              <div key={idp.name} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-foreground">{idp.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{idp.desc}</p>
                </div>
                <Badge variant={idp.status === 'Connected' ? 'success' : 'info'}>{idp.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 9: SECURITY ────────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Platform Security & MFA Enforcement</h3>
            <p className="text-xs text-muted-foreground">Session timeout, two-factor authentication, and IP whitelisting</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold text-foreground">Enforce Multi-Factor Authentication (MFA/TOTP)</div>
                <div className="text-[11px] text-muted-foreground">Require hardware key or authenticator app for all organization members</div>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={() => setMfaEnabled(!mfaEnabled)}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-xs font-extrabold text-foreground">Allowed IP Whitelist Subnets</div>
              <input
                type="text"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 10: ORGANIZATION & WORKSPACE MANAGEMENT ───────────────────── */}
      {activeTab === 'organization' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                <span>Organization & Workspace Management</span>
              </h3>
              <p className="text-xs text-muted-foreground">Manage multi-tenant workspace environments with isolated prompts, documents, agents, and security settings</p>
            </div>
            <Badge variant="info">3 Workspaces Enforced</Badge>
          </div>

          {/* Workspaces List: Workspace A, Workspace B, Workspace C */}
          <div className="space-y-4">
            {[
              {
                name: 'Workspace A',
                slug: 'workspace-a',
                env: 'Production Cluster',
                prompts: 14,
                documents: 42,
                agents: 6,
                region: 'us-east-1',
                active: true,
              },
              {
                name: 'Workspace B',
                slug: 'workspace-b',
                env: 'Staging / QA Sandbox',
                prompts: 8,
                documents: 24,
                agents: 4,
                region: 'eu-west-1',
                active: false,
              },
              {
                name: 'Workspace C',
                slug: 'workspace-c',
                env: 'SOC-2 Compliance Isolated',
                prompts: 19,
                documents: 88,
                agents: 10,
                region: 'us-west-2',
                active: false,
              },
            ].map((ws) => (
              <div
                key={ws.name}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  ws.active
                    ? isLight
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-blue-600/10 border-blue-500/30'
                    : isLight
                    ? 'bg-white border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold font-mono text-xs">
                      {ws.name.split(' ')[1]}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-extrabold text-foreground">{ws.name}</h4>
                        {ws.active && <Badge variant="success">Current Active</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{ws.env} • {ws.region}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => addNotification({ type: 'workflow', title: 'Workspace Switch', description: `Switched active scope to ${ws.name}` })}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shrink-0 self-start sm:self-center"
                  >
                    Switch Context
                  </button>
                </div>

                {/* 4 Isolated Resources: Prompts, Documents, Agents, Settings */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Prompts</span>
                    </div>
                    <div className="text-base font-extrabold text-foreground">{ws.prompts}</div>
                    <div className="text-[10px] text-muted-foreground">Templates Registered</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Documents</span>
                    </div>
                    <div className="text-base font-extrabold text-foreground">{ws.documents}</div>
                    <div className="text-[10px] text-muted-foreground">RAG Vector Files</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Agents</span>
                    </div>
                    <div className="text-base font-extrabold text-foreground">{ws.agents}</div>
                    <div className="text-[10px] text-muted-foreground">Active Workers</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-sky-400 font-bold">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </div>
                    <div className="text-base font-extrabold text-emerald-400">Configured</div>
                    <div className="text-[10px] text-muted-foreground">RBAC & Gateway</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 11: USAGE LIMITS ───────────────────────────────────────────── */}
      {activeTab === 'usage-limits' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">Token Usage & Rate Limits</h3>
            <p className="text-xs text-muted-foreground">Set token quotas, max concurrent worker agents, and expenditure alert thresholds</p>
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Max Concurrent Active Agents</span>
                <span className="font-mono text-blue-400">{maxAgents} Agents</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={maxAgents}
                onChange={(e) => setMaxAgents(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Cost Alert Threshold ($)</span>
                <span className="font-mono text-emerald-400">${costAlert}.00</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={costAlert}
                onChange={(e) => setCostAlert(parseInt(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 12: PERSONAL ACCESS TOKENS ─────────────────────────────────── */}
      {activeTab === 'pats' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-4xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Personal Access Tokens (PATs)</h3>
              <p className="text-xs text-muted-foreground">Developer tokens for authenticating AIOS CLI and automated scripts</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={patName}
                onChange={(e) => setPatName(e.target.value)}
                placeholder="Token Name (e.g. CLI Dev)"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleCreatePat}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create PAT</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {pats.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-foreground">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">Scope: {p.scope} • Expires: {p.expires}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPats(pats.filter((item) => item.id !== p.id))}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
