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
  triggerSequence: () => void;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'agent',
    title: 'Planner finished',
    description: 'Planner Agent completed task decomposition DAG into 4 subtasks',
    timestamp: 'Just now',
    isRead: false
  },
  {
    id: 'n-2',
    type: 'knowledge',
    title: 'Retriever indexed 320 chunks',
    description: 'Retriever Agent indexed 320 semantic chunks into Qdrant HNSW vector index',
    timestamp: '1 min ago',
    isRead: false
  },
  {
    id: 'n-3',
    type: 'knowledge',
    title: 'Neo4j synced',
    description: 'Neo4j Knowledge Graph synced 14,820 entity nodes & 32,400 relationships',
    timestamp: '3 mins ago',
    isRead: false
  },
  {
    id: 'n-4',
    type: 'workflow',
    title: 'Workflow deployed',
    description: 'LangGraph multi-agent DAG workflow deployed to production Celery swarm',
    timestamp: '5 mins ago',
    isRead: false
  },
  {
    id: 'n-5',
    type: 'key',
    title: 'API key created',
    description: 'New production API key (aios_live_key_2026) created for Acme Workspace',
    timestamp: '10 mins ago',
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
