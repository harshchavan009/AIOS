import { create } from 'zustand';

export type NotificationType =
  | 'login'
  | 'workflow'
  | 'document'
  | 'agent'
  | 'eval'
  | 'key'
  | 'knowledge'
  | 'prompt_approved'
  | 'document_indexed'
  | 'workflow_completed'
  | 'model_unavailable'
  | 'token_limit'
  | 'agent_failed'
  | 'billing_reminder'
  | 'deployment_completed';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  triggerSequence: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'prompt_approved',
    title: 'Prompt approved',
    description: 'System prompt "SOC-2 Audit Guardrail" passed RAGAS review and was approved by Lead Architect',
    timestamp: 'Just now',
    isRead: false
  },
  {
    id: 'n-2',
    type: 'document_indexed',
    title: 'Document indexed',
    description: 'File "acme_soc2_audit.pdf" (1,250 words, 8 chunks) successfully indexed into Qdrant & Neo4j',
    timestamp: '2 mins ago',
    isRead: false
  },
  {
    id: 'n-3',
    type: 'workflow_completed',
    title: 'Workflow completed',
    description: 'LangGraph multi-agent DAG workflow executed cleanly across all 6 node steps in 0.65s',
    timestamp: '5 mins ago',
    isRead: false
  },
  {
    id: 'n-4',
    type: 'model_unavailable',
    title: 'Model unavailable',
    description: 'LLM endpoint "claude-3-5-sonnet" timed out; failover routed to "gpt-4o" fallback node',
    timestamp: '8 mins ago',
    isRead: false
  },
  {
    id: 'n-5',
    type: 'token_limit',
    title: 'Token limit reached',
    description: 'Monthly token usage reached 85% threshold (8,420,000 / 10,000,000 tokens for Pro Tier)',
    timestamp: '12 mins ago',
    isRead: false
  },
  {
    id: 'n-6',
    type: 'agent_failed',
    title: 'Agent failed',
    description: 'Python Tool Agent encountered sandbox timeout exception; automatic retry initiated',
    timestamp: '15 mins ago',
    isRead: false
  },
  {
    id: 'n-7',
    type: 'billing_reminder',
    title: 'Billing reminder',
    description: 'Pro Subscription renewal scheduled for August 1, 2026 ($299/mo via Stripe)',
    timestamp: '20 mins ago',
    isRead: false
  },
  {
    id: 'n-8',
    type: 'deployment_completed',
    title: 'Deployment completed',
    description: 'Swarm Agent "Custom LangGraph Swarm Agent" successfully deployed to production Celery cluster',
    timestamp: '25 mins ago',
    isRead: false
  }
];

const loadInitialNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem('aios_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading notifications from localStorage:', e);
  }
  return DEFAULT_NOTIFICATIONS;
};

const saveNotifications = (list: NotificationItem[]) => {
  try {
    localStorage.setItem('aios_notifications', JSON.stringify(list));
  } catch (e) {
    console.error('Error saving notifications to localStorage:', e);
  }
};

const calcUnread = (list: NotificationItem[]) => list.filter(n => !n.isRead).length;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: loadInitialNotifications(),
  unreadCount: calcUnread(loadInitialNotifications()),

  markAsRead: (id: string) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifications(updated);
    set({ notifications: updated, unreadCount: calcUnread(updated) });
  },

  markAllAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
    set({ notifications: updated, unreadCount: 0 });
  },

  deleteNotification: (id: string) => {
    const updated = get().notifications.filter(n => n.id !== id);
    saveNotifications(updated);
    set({ notifications: updated, unreadCount: calcUnread(updated) });
  },

  clearAll: () => {
    saveNotifications([]);
    set({ notifications: [], unreadCount: 0 });
  },

  addNotification: (item) => {
    const newEntry: NotificationItem = {
      ...item,
      id: `n-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false
    };
    const updated = [newEntry, ...get().notifications];
    saveNotifications(updated);
    set({ notifications: updated, unreadCount: calcUnread(updated) });
  },

  triggerSequence: () => {
    saveNotifications(DEFAULT_NOTIFICATIONS);
    set({ notifications: DEFAULT_NOTIFICATIONS, unreadCount: calcUnread(DEFAULT_NOTIFICATIONS) });
  }
}));
