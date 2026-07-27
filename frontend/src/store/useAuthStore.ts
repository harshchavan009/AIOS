import { create } from 'zustand';
import { User, UserSession, LoginHistoryItem, InviteItem } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessions: UserSession[];
  loginHistory: LoginHistoryItem[];
  pendingInvites: InviteItem[];
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  oauthLogin: (provider: 'google' | 'github' | 'microsoft', rememberMe?: boolean) => Promise<void>;
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  fetchLoginHistory: () => Promise<void>;
  fetchPendingInvites: () => Promise<void>;
  acceptInvite: (inviteToken: string) => Promise<boolean>;
  updatePreferences: (data: Partial<User>) => Promise<boolean>;
  uploadAvatar: (avatarData: string) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('aios_access_token'),
  refreshToken: localStorage.getItem('aios_refresh_token'),
  isAuthenticated: !!localStorage.getItem('aios_access_token'),
  isLoading: true,
  sessions: [],
  loginHistory: [],
  pendingInvites: [],

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('aios_access_token', token);
    if (refreshToken) {
      localStorage.setItem('aios_refresh_token', refreshToken);
    }
    set({
      user,
      token,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateUser: (user) => {
    set({ user });
  },

  logout: async () => {
    const token = get().token;
    if (token) {
      try {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('aios_access_token');
    localStorage.removeItem('aios_refresh_token');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false, sessions: [], loginHistory: [] });
  },

  initAuth: async () => {
    const token = localStorage.getItem('aios_access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        // Token invalid or expired - attempt refresh
        const refresh = localStorage.getItem('aios_refresh_token');
        if (refresh) {
          const refreshRes = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            get().setAuth(data.user, data.access_token, data.refresh_token);
            return;
          }
        }
        // If refresh fails, log out
        get().logout();
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ isLoading: false });
    }
  },

  oauthLogin: async (provider, rememberMe = false) => {
    try {
      const res = await fetch(`/api/v1/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          remember_me: rememberMe,
          email: `${provider}.user@aios.enterprise`,
          name: `${provider.toUpperCase()} Enterprise User`
        }),
      });
      if (res.ok) {
        const data = await res.json();
        get().setAuth(data.user, data.access_token, data.refresh_token);
      }
    } catch (err) {
      console.error('OAuth error:', err);
    }
  },

  fetchSessions: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch('/api/v1/auth/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ sessions: data });
      }
    } catch (err) {
      console.error('Fetch sessions error:', err);
    }
  },

  revokeSession: async (sessionId) => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        get().fetchSessions();
      }
    } catch (err) {
      console.error('Revoke session error:', err);
    }
  },

  fetchLoginHistory: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch('/api/v1/auth/login-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ loginHistory: data });
      }
    } catch (err) {
      console.error('Fetch login history error:', err);
    }
  },

  fetchPendingInvites: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch('/api/v1/auth/invites/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        set({ pendingInvites: data });
      }
    } catch (err) {
      console.error('Fetch pending invites error:', err);
    }
  },

  acceptInvite: async (inviteToken) => {
    const token = get().token;
    if (!token) return false;
    try {
      const res = await fetch('/api/v1/auth/invites/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ invite_token: inviteToken })
      });
      if (res.ok) {
        get().fetchPendingInvites();
        get().initAuth();
        return true;
      }
    } catch (err) {
      console.error('Accept invite error:', err);
    }
    return false;
  },

  updatePreferences: async (data) => {
    const token = get().token;
    if (!token) return false;
    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        set({ user: updatedUser });
        return true;
      }
    } catch (err) {
      console.error('Update preferences error:', err);
    }
    return false;
  },

  uploadAvatar: async (avatarData) => {
    const token = get().token;
    if (!token) return false;
    try {
      const res = await fetch('/api/v1/auth/me/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatar_data: avatarData })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        set({ user: updatedUser });
        return true;
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
    }
    return false;
  },

  deleteAccount: async () => {
    const token = get().token;
    if (!token) return false;
    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await get().logout();
        return true;
      }
    } catch (err) {
      console.error('Delete account error:', err);
    }
    return false;
  },

  resendVerification: async (email) => {
    try {
      const res = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return res.ok;
    } catch (err) {
      console.error('Resend verification error:', err);
      return false;
    }
  },

  verifyEmail: async (tokenStr) => {
    try {
      const res = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenStr })
      });
      return res.ok;
    } catch (err) {
      console.error('Verify email error:', err);
      return false;
    }
  }
}));
