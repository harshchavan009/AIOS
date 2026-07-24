import { create } from 'zustand';

export interface NotificationItem {
  id: string;
  type: 'login' | 'workflow' | 'document' | 'agent' | 'eval' | 'key' | 'knowledge';
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
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'login',
    title: 'Login Successful',
    description: 'Admin signed in from 127.0.0.1 (Mac OS Chrome)',
    timestamp: 'Just now',
    isRead: false
  },
  {
    id: 'n-2',
    type: 'workflow',
    title: 'Workflow Completed',
    description: 'Enterprise RAG Indexing Pipeline #4092 executed in 1.4s',
    timestamp: '5 mins ago',
    isRead: false
  },
  {
    id: 'n-3',
    type: 'agent',
    title: 'Agent Deployed',
    description: 'Code Architect Agent v2.4 initialized with 6 sub-workers',
    timestamp: '25 mins ago',
    isRead: false
  },
  {
    id: 'n-4',
    type: 'document',
    title: 'Document Indexed',
    description: 'Architecture_Spec_v3.pdf chunked and stored in Qdrant (128 vectors)',
    timestamp: '1 hour ago',
    isRead: true
  },
  {
    id: 'n-5',
    type: 'eval',
    title: 'Evaluation Finished',
    description: 'Benchmark score: 94.8% accuracy across 500 test cases',
    timestamp: '2 hours ago',
    isRead: true
  },
  {
    id: 'n-6',
    type: 'key',
    title: 'New API Key Created',
    description: 'Production-Gateway-Key-2026 issued for Acme Workspace',
    timestamp: '4 hours ago',
    isRead: true
  },
  {
    id: 'n-7',
    type: 'knowledge',
    title: 'Knowledge Base Synced',
    description: 'Neo4j Graph RAG synced 1,420 entity nodes and 3,890 relationships',
    timestamp: '1 day ago',
    isRead: true
  }
];

const loadInitialNotifications = (): NotificationItem[] => {
  try {
    const saved = localStorage.getItem('aios_notifications');
    if (saved) {
      return JSON.parse(saved);
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
  }
}));
