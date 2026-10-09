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

const loadInitialNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem('aios_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading notifications from localStorage:', e);
  }
  return [];
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
    const demoItems: NotificationItem[] = [
      {
        id: `demo-${Date.now()}-1`,
        type: 'agent',
        title: 'Agent Swarm Deployed',
        description: 'AutoDev and RAG Orchestrator swarm synchronized across cluster nodes.',
        timestamp: 'Just now',
        isRead: false,
      },
      {
        id: `demo-${Date.now()}-2`,
        type: 'workflow_completed',
        title: 'Graph RAG Index Built',
        description: 'Knowledge Graph embedding generated for 1,420 entities.',
        timestamp: '1m ago',
        isRead: false,
      },
    ];
    const updated = [...demoItems, ...get().notifications];
    saveNotifications(updated);
    set({ notifications: updated, unreadCount: calcUnread(updated) });
  }
}));
