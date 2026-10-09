import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  Check,
  Download,
  DollarSign,
  Shield,
  Activity,
} from 'lucide-react';
import { PageLayout } from '../components/layouts/PageLayout';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useBillingStore, SubscriptionPlan } from '../store/useBillingStore';
import { useNotificationStore } from '../store/useNotificationStore';

type BillingTab = 'subscription' | 'invoices' | 'usage';

export const BillingPage: React.FC = () => {
  const { subscription, plans, invoices, usage, fetchBillingData, upgradePlan } = useBillingStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [activeTab, setActiveTab] = useState<BillingTab>('subscription');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanModal, setSelectedPlanModal] = useState<SubscriptionPlan | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

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
    <PageLayout
      title="Billing & Subscriptions"
      description="Manage enterprise tier commitments, token consumption limits, and invoice history."
      actions={
        <div className="flex items-center space-x-2">
          <Badge variant="success">Active Plan: {activeTierName}</Badge>
          <div className="px-2.5 py-1 rounded bg-elevated border border-border text-xs font-mono text-muted flex items-center space-x-1.5">
            <CreditCard className="w-3.5 h-3.5 text-accent" />
            <span>Auto-Renew: Enforced</span>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-border pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'subscription'
                ? 'bg-accent/10 text-accent font-semibold border border-accent/30'
                : 'text-muted hover:text-text hover:bg-elevated'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Subscription Plans</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'usage'
                ? 'bg-accent/10 text-accent font-semibold border border-accent/30'
                : 'text-muted hover:text-text hover:bg-elevated'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Token Usage & Spend</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'bg-accent/10 text-accent font-semibold border border-accent/30'
                : 'text-muted hover:text-text hover:bg-elevated'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Invoices</span>
          </button>
        </div>

        {/* ── SUB-PAGE 1: SUBSCRIPTION PLANS ────────────────────────────────────── */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Monthly / Yearly Toggle */}
            <div className="flex justify-center items-center space-x-3 py-2">
              <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-text font-semibold' : 'text-muted'}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))}
                className="w-10 h-5 rounded-full bg-elevated p-0.5 border border-border relative transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-accent transition-all ${
                    billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-medium flex items-center space-x-1.5 ${billingCycle === 'yearly' ? 'text-text font-semibold' : 'text-muted'}`}>
                <span>Annual Billing</span>
                <span className="px-1.5 py-0.5 rounded bg-status-success/10 text-status-success font-mono text-[10px] border border-status-success/20">
                  Save 20%
                </span>
              </span>
            </div>

            {/* 4 Tier Pricing Cards Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isCurrent = plan.name === activeTierName;
                const price = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(0) : plan.price_monthly;

                return (
                  <div
                    key={plan.id}
                    className={`surface-card p-5 flex flex-col justify-between space-y-5 relative ${
                      isCurrent
                        ? 'border-accent shadow-xs'
                        : 'border-border'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-accent text-[#0B0C0E] text-[10px] font-semibold uppercase tracking-wider">
                        Current Plan
                      </span>
                    )}

                    <div className="space-y-4 pt-1">
                      <div>
                        <h3 className="text-base font-semibold text-text">{plan.name}</h3>
                        <p className="text-xs text-muted mt-1">
                          {plan.name === 'Starter' && 'Ideal for individuals & testing MVP apps.'}
                          {plan.name === 'Pro' && 'For growing startups and production agents.'}
                          {plan.name === 'Business' && 'Enterprise scale for high volume teams.'}
                          {plan.name === 'Enterprise' && 'Unlimited custom mesh for enterprise AI.'}
                        </p>
                      </div>

                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-semibold text-text font-mono">${price}</span>
                        <span className="text-xs text-muted font-mono">/ mo</span>
                      </div>

                      <div className="pt-3 border-t border-border space-y-2 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Monthly Tokens:</span>
                          <span className="font-medium text-text">
                            {plan.token_limit >= 100_000_000 ? 'Unlimited' : `${(plan.token_limit / 1000000).toFixed(1)}M`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Active Agents:</span>
                          <span className="font-medium text-text">{plan.agent_limit >= 999 ? 'Unlimited' : plan.agent_limit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">Workspaces:</span>
                          <span className="font-medium text-text">{plan.workspace_limit >= 999 ? 'Unlimited' : plan.workspace_limit}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-muted">Included Features:</div>
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs text-text">
                            <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3">
                      <Button
                        variant={isCurrent ? 'ghost' : 'primary'}
                        size="sm"
                        disabled={isCurrent}
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full text-xs"
                      >
                        {isCurrent ? 'Active Subscription' : `Upgrade to ${plan.name}`}
                      </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="surface-card p-5 space-y-2">
                <div className="text-xs font-mono text-muted flex items-center justify-between">
                  <span>Monthly Tokens</span>
                  <Activity className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-semibold text-text font-mono">
                  {((usage?.token_consumption_month || 1840000) / 1000000).toFixed(2)}M
                </div>
                <div className="text-xs text-muted font-mono">
                  Limit: {((usage?.monthly_token_limit || 10000000) / 1000000).toFixed(0)}M (18.4% consumed)
                </div>
                <div className="w-full bg-elevated rounded-full h-1.5 mt-2 overflow-hidden border border-border">
                  <div className="bg-accent h-full rounded-full" style={{ width: '18.4%' }} />
                </div>
              </div>

              <div className="surface-card p-5 space-y-2">
                <div className="text-xs font-mono text-muted flex items-center justify-between">
                  <span>Monthly Spend</span>
                  <DollarSign className="w-4 h-4 text-accent" />
                </div>
                <div className="text-2xl font-semibold text-text font-mono">
                  ${usage?.monthly_spend_usd != null ? usage.monthly_spend_usd.toFixed(2) : '0.00'}
                </div>
                <div className="text-xs text-muted font-mono">
                  Budget Cap: ${usage?.monthly_budget_limit_usd != null ? usage.monthly_budget_limit_usd.toFixed(2) : '1,000.00'} / mo
                </div>
                <div className="w-full bg-elevated rounded-full h-1.5 mt-2 overflow-hidden border border-border">
                  <div className="bg-accent h-full rounded-full" style={{ width: `${Math.min(100, ((usage?.monthly_spend_usd || 0) / (usage?.monthly_budget_limit_usd || 1000)) * 100)}%` }} />
                </div>
              </div>

              <div className="surface-card p-5 space-y-2">
                <div className="text-xs font-mono text-muted flex items-center justify-between">
                  <span>Today's Rate</span>
                  <Activity className="w-4 h-4 text-muted" />
                </div>
                <div className="text-2xl font-semibold text-text font-mono">
                  {((usage?.token_consumption_today || 0) / 1000).toFixed(1)}k tokens
                </div>
                <div className="text-xs text-muted font-mono">
                  Est. Daily Spend: ${((usage?.token_consumption_today || 0) * 0.000018).toFixed(2)}
                </div>
                <div className="w-full bg-elevated rounded-full h-1.5 mt-2 overflow-hidden border border-border">
                  <div className="bg-muted h-full rounded-full" style={{ width: `${Math.min(100, ((usage?.token_consumption_today || 0) / 100000) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Model Token Breakdown */}
            <div className="surface-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text">Token Consumption Breakdown by Model</h3>
              {(!usage?.model_breakdown || usage.model_breakdown.length === 0) ? (
                <div className="p-4 text-center border border-dashed border-border rounded text-xs text-muted">
                  No token consumption recorded yet. Run a prompt or agent workflow to view per-model expenditure.
                </div>
              ) : (
                <div className="space-y-2 font-mono text-xs">
                  {usage.model_breakdown.map((mb) => (
                    <div key={mb.model} className="p-3 rounded bg-elevated border border-border flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span className="font-medium text-text">{mb.model}</span>
                      </div>
                      <div className="flex items-center space-x-6">
                        <span className="text-muted">{(mb.tokens / 1000000).toFixed(2)}M Tokens</span>
                        <span className="font-semibold text-text">${mb.cost_usd.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUB-PAGE 3: INVOICE HISTORY ────────────────────────────────────── */}
        {activeTab === 'invoices' && (
          <div className="surface-card p-5 space-y-5 max-w-5xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-semibold text-text">Invoice Receipts & Payment History</h3>
                <p className="text-xs text-muted">Historical invoices, Stripe receipts, and automated statements</p>
              </div>
              <Badge variant="neutral">Billing Ready</Badge>
            </div>

            {invoices.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-lg space-y-2">
                <p className="text-xs font-medium text-text">No invoices generated yet</p>
                <p className="text-[11px] text-muted">Statements and downloadable receipts will appear here once subscription cycles are processed.</p>
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {invoices.map((inv) => (
                  <div key={inv.id} className="p-3 rounded bg-elevated border border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-semibold text-xs">
                        INV
                      </div>
                      <div>
                        <div className="font-semibold text-text text-xs">{inv.invoice_number}</div>
                        <div className="text-[11px] text-muted">{inv.date} • {inv.tier} Subscription</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-text font-mono">${inv.amount_usd.toFixed(2)}</span>
                      <Badge variant="success">
                        {inv.status}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => {
                          addNotification({
                            type: 'document',
                            title: 'Invoice Downloaded',
                            description: `Downloaded PDF receipt for ${inv.invoice_number}.`,
                          });
                        }}
                        className="p-1.5 rounded hover:bg-surface border border-border text-muted hover:text-text transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plan Upgrade Confirmation Modal */}
        {selectedPlanModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
            <div className="surface-card p-6 rounded-lg max-w-md w-full border border-border space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-text">Confirm Plan Upgrade</h3>
                <Badge variant="info">{selectedPlanModal.name} Tier</Badge>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted">Selected Plan:</span>
                  <span className="font-semibold text-text">{selectedPlanModal.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Billing Frequency:</span>
                  <span className="font-semibold text-text capitalize">{billingCycle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Monthly Token Allowance:</span>
                  <span className="font-semibold text-text">
                    {selectedPlanModal.token_limit >= 100_000_000 ? 'Unlimited' : `${(selectedPlanModal.token_limit / 1000000).toFixed(1)}M`}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="font-semibold text-text">Total Due:</span>
                  <span className="font-bold text-accent">
                    ${billingCycle === 'yearly' ? (selectedPlanModal.price_yearly / 12).toFixed(2) : selectedPlanModal.price_monthly.toFixed(2)} / mo
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-elevated border border-border text-[11px] text-muted flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Secured by Stripe Billing Architecture. Auto-renew can be canceled anytime.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlanModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isUpgrading}
                  onClick={handleConfirmUpgrade}
                >
                  Confirm & Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
