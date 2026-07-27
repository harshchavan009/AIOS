import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  Check,
  Download,
  TrendingUp,
  DollarSign,
  Shield,
  Sparkles,
  Calendar,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { useBillingStore, SubscriptionPlan } from '../store/useBillingStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useThemeStore } from '../store/useThemeStore';

type BillingTab = 'subscription' | 'invoices' | 'usage';

export const BillingPage: React.FC = () => {
  const { theme } = useThemeStore();
  const { subscription, plans, invoices, usage, fetchBillingData, upgradePlan } = useBillingStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [activeTab, setActiveTab] = useState<BillingTab>('subscription');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanModal, setSelectedPlanModal] = useState<SubscriptionPlan | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    fetchBillingData();
  }, []);

  const activeTierName = subscription?.tier || 'Enterprise';

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.name === activeTierName) return;
    setSelectedPlanModal(plan);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlanModal) return;
    setIsUpgrading(true);
    const success = await upgradePlan(selectedPlanModal.name, billingCycle);
    setIsUpgrading(false);
    if (success) {
      addNotification({
        type: 'key',
        title: `Subscribed to ${selectedPlanModal.name} Plan`,
        description: `Your subscription has been updated to the ${selectedPlanModal.name} Tier (${billingCycle}).`,
      });
      setSelectedPlanModal(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">SaaS Billing & Token Subscriptions</h1>
          <p className="text-muted-foreground text-sm">
            Manage your subscription tiers (Starter, Pro, Business, Enterprise), Token Consumption, and Invoice History.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="success">Active Plan: {activeTierName}</Badge>
          <div className="px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-mono text-muted-foreground flex items-center space-x-2">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>Auto-Renew: Enforced</span>
          </div>
        </div>
      </div>

      {/* 3 Tab Navigation: Subscription, Invoice History, Usage */}
      <div className="flex items-center space-x-2 border-b border-border/60 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'subscription'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Subscription Plans (4 Tiers)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usage')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'usage'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Token Usage & Spend</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'invoices'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Invoice Receipts</span>
        </button>
      </div>

      {/* ── SUB-PAGE 1: SUBSCRIPTION PLANS ────────────────────────────────────── */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Monthly / Yearly Toggle */}
          <div className="flex justify-center items-center space-x-4 py-2">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))}
              className="w-12 h-6 rounded-full bg-blue-600/30 p-1 border border-blue-500/40 relative transition-all"
            >
              <div
                className={`w-4 h-4 rounded-full bg-blue-500 transition-all ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center space-x-1.5 ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                Save 20%
              </span>
            </span>
          </div>

          {/* 4 Tier Pricing Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.name === activeTierName;
              const price = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(0) : plan.price_monthly;

              return (
                <div
                  key={plan.id}
                  className={`glass-card p-6 rounded-3xl flex flex-col justify-between space-y-6 relative transition-all duration-300 hover:scale-[1.02] ${
                    isCurrent
                      ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/20 bg-blue-900/10'
                      : plan.is_popular
                      ? 'border border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'border border-border/60 hover:border-border'
                  }`}
                >
                  {plan.is_popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  )}

                  {isCurrent && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                      Current Plan
                    </span>
                  )}

                  <div className="space-y-4 pt-2">
                    <div>
                      <h3 className="text-xl font-extrabold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.name === 'Starter' && 'Ideal for individuals & testing MVP apps.'}
                        {plan.name === 'Pro' && 'For growing startups and production agents.'}
                        {plan.name === 'Business' && 'SOC-2 compliant scale for high volume teams.'}
                        {plan.name === 'Enterprise' && 'Unlimited custom mesh for enterprise AI.'}
                      </p>
                    </div>

                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-extrabold text-foreground">${price}</span>
                      <span className="text-xs text-muted-foreground font-mono">/ mo</span>
                    </div>

                    <div className="pt-3 border-t border-border/40 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Monthly Tokens:</span>
                        <span className="font-bold text-foreground">
                          {plan.token_limit >= 100_000_000 ? 'Unlimited' : `${(plan.token_limit / 1000000).toFixed(1)}M`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Active Agents:</span>
                        <span className="font-bold text-foreground">{plan.agent_limit >= 999 ? 'Unlimited' : plan.agent_limit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Workspaces:</span>
                        <span className="font-bold text-foreground">{plan.workspace_limit >= 999 ? 'Unlimited' : plan.workspace_limit}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Included Features:</div>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-foreground">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                        isCurrent
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 cursor-default'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
                      }`}
                    >
                      {isCurrent ? 'Active Subscription' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUB-PAGE 2: TOKEN USAGE & SPEND Analytics ───────────────────────────── */}
      {activeTab === 'usage' && (
        <div className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl space-y-2 border border-border/60">
              <div className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>Monthly Token Consumption</span>
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-foreground">
                {((usage?.token_consumption_month || 1840000) / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Limit: {((usage?.monthly_token_limit || 10000000) / 1000000).toFixed(0)}M tokens (18.4% consumed)
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '18.4%' }} />
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-2 border border-border/60">
              <div className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>Monthly Spend Commitment</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">
                ${usage?.monthly_spend_usd.toFixed(2) || '442.80'}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Budget Cap: ${usage?.monthly_budget_limit_usd.toFixed(2) || '1,000.00'} / mo
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '44.2%' }} />
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl space-y-2 border border-border/60">
              <div className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                <span>Today's Token Rate</span>
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-purple-400">
                {((usage?.token_consumption_today || 148200) / 1000).toFixed(1)}k tokens
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                Est. Daily Spend: ${((usage?.token_consumption_today || 148200) * 0.00024).toFixed(2)}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          {/* Model Token Breakdown */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border border-border/60">
            <h3 className="text-base font-extrabold text-foreground">Token Consumption Breakdown by Model</h3>
            <div className="space-y-3 font-mono text-xs">
              {usage?.model_breakdown.map((mb) => (
                <div key={mb.model} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="font-bold text-foreground">{mb.model}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="text-muted-foreground">{(mb.tokens / 1000000).toFixed(2)}M Tokens</span>
                    <span className="font-bold text-emerald-400">${mb.cost_usd.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-PAGE 3: INVOICE HISTORY ────────────────────────────────────── */}
      {activeTab === 'invoices' && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 max-w-5xl animate-fade-in border border-border/60">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Invoice Receipts & Payment History</h3>
              <p className="text-xs text-muted-foreground">Historical invoices, Stripe receipts, and automated tax statements</p>
            </div>
            <Badge variant="success">Stripe Billing Architecture Active</Badge>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
                    INV
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{inv.invoice_number}</div>
                    <div className="text-[11px] text-muted-foreground">{inv.date} • {inv.tier} Subscription</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-base font-extrabold text-emerald-400">${inv.amount_usd.toFixed(2)}</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[10px]">
                    {inv.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addNotification({
                        type: 'document',
                        title: 'Invoice Downloaded',
                        description: `Downloaded PDF receipt for ${inv.invoice_number}.`,
                      });
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Upgrade Stripe Confirmation Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-lg w-full border border-blue-500/40 space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-lg font-extrabold text-foreground">Confirm Plan Upgrade</h3>
              <Badge variant="info">{selectedPlanModal.name} Tier</Badge>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Plan:</span>
                <span className="font-bold text-foreground">{selectedPlanModal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Frequency:</span>
                <span className="font-bold text-foreground capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Token Allowance:</span>
                <span className="font-bold text-foreground">
                  {selectedPlanModal.token_limit >= 100_000_000 ? 'Unlimited' : `${(selectedPlanModal.token_limit / 1000000).toFixed(1)}M`}
                </span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-border/40">
                <span className="font-bold text-foreground">Total Due Today:</span>
                <span className="font-extrabold text-emerald-400">
                  ${billingCycle === 'yearly' ? (selectedPlanModal.price_yearly / 12).toFixed(2) : selectedPlanModal.price_monthly.toFixed(2)} / mo
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-300 font-mono flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Secured by Stripe Billing Architecture. Auto-renew can be canceled anytime.</span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlanModal(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpgrading}
                onClick={handleConfirmUpgrade}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/30"
              >
                {isUpgrading ? 'Processing...' : `Confirm & Upgrade to ${selectedPlanModal.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
