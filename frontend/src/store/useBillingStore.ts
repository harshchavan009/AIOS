import { create } from 'zustand';

export interface SubscriptionPlan {
  id: string;
  name: 'Starter' | 'Pro' | 'Business' | 'Enterprise';
  price_monthly: number;
  price_yearly: number;
  token_limit: number;
  agent_limit: number;
  workspace_limit: number;
  features: string[];
  is_popular?: boolean;
}

export interface SubscriptionDetails {
  tier: 'Starter' | 'Pro' | 'Business' | 'Enterprise';
  status: string;
  monthly_budget_usd: number;
  current_spend_usd: number;
  token_usage_current: number;
  token_usage_limit: number;
  next_billing_date: string;
  auto_renew: boolean;
  payment_method?: {
    brand: string;
    last4: string;
    exp_month: string;
    exp_year: string;
  };
  plan_details: SubscriptionPlan;
}

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  date: string;
  tier: string;
  amount_usd: number;
  status: 'paid' | 'pending' | 'failed';
  pdf_url: string;
}

export interface ModelTokenBreakdown {
  model: string;
  tokens: number;
  cost_usd: number;
}

export interface BillingUsage {
  token_consumption_today: number;
  token_consumption_month: number;
  monthly_token_limit: number;
  monthly_spend_usd: number;
  monthly_budget_limit_usd: number;
  model_breakdown: ModelTokenBreakdown[];
  daily_consumption_history: { date: string; tokens: number; spend_usd: number }[];
}

interface BillingState {
  subscription: SubscriptionDetails | null;
  plans: SubscriptionPlan[];
  invoices: InvoiceItem[];
  usage: BillingUsage | null;
  isLoading: boolean;
  fetchBillingData: () => Promise<void>;
  upgradePlan: (tier: 'Starter' | 'Pro' | 'Business' | 'Enterprise', cycle?: 'monthly' | 'yearly') => Promise<boolean>;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    price_monthly: 0,
    price_yearly: 0,
    token_limit: 100000,
    agent_limit: 2,
    workspace_limit: 1,
    features: [
      '100k Monthly LLM Tokens',
      '2 Active Agent Swarms',
      '1 Workspace Isolation',
      'Community Support & Basic Analytics'
    ],
    is_popular: false,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    price_monthly: 49,
    price_yearly: 470,
    token_limit: 2000000,
    agent_limit: 10,
    workspace_limit: 3,
    features: [
      '2 Million Monthly LLM Tokens',
      '10 Active Agent Swarms',
      '3 Workspaces (My Startup, Team Labs)',
      'Standard API Keys & Email Support',
      'Prompt Studio Template Library'
    ],
    is_popular: true,
  },
  {
    id: 'plan-business',
    name: 'Business',
    price_monthly: 199,
    price_yearly: 1900,
    token_limit: 10000000,
    agent_limit: 50,
    workspace_limit: 10,
    features: [
      '10 Million Monthly LLM Tokens',
      '50 Active Agent Swarms',
      '10 Workspaces Isolation',
      'Graph RAG & Vector Mesh (Qdrant & Neo4j)',
      'Enterprise Access & Audit Controls',
      '24/7 Priority SLA Support'
    ],
    is_popular: false,
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    price_monthly: 999,
    price_yearly: 9500,
    token_limit: 100000000,
    agent_limit: 999,
    workspace_limit: 999,
    features: [
      'Unlimited LLM Tokens Mesh',
      'Unlimited Multi-Agent Orchestration',
      'Custom Workspaces & Fine-Tuned Models',
      'Dedicated Infrastructure Node',
      'Custom SSO & SAML Authentication',
      'Dedicated Solutions Architect'
    ],
    is_popular: false,
  },
];

export const useBillingStore = create<BillingState>((set, get) => ({
  subscription: null,
  plans: DEFAULT_PLANS,
  invoices: [],
  usage: null,
  isLoading: false,

  fetchBillingData: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('aios_access_token');
      if (!token) return;
      const [subRes, usageRes, invRes] = await Promise.all([
        fetch('/api/v1/billing/subscription', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/billing/usage', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/billing/invoices', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        set({ subscription: subData });
      }
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        set({ usage: usageData });
      }
      if (invRes.ok) {
        const invData = await invRes.json();
        set({ invoices: invData });
      }
    } catch (e) {
      console.error('Fetch billing error:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  upgradePlan: async (tier, cycle = 'monthly') => {
    try {
      const token = localStorage.getItem('aios_access_token');
      if (!token) return false;
      const res = await fetch('/api/v1/billing/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier, billing_cycle: cycle }),
      });

      if (res.ok) {
        const updatedSub = await res.json();
        set({ subscription: updatedSub });
        return true;
      }
    } catch (e) {
      console.error('Upgrade plan error:', e);
    }
    return false;
  },
}));
