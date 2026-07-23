import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('aios_access_token'),
  refreshToken: localStorage.getItem('aios_refresh_token'),
  isAuthenticated: !!localStorage.getItem('aios_access_token'),
  isLoading: true,

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
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
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
}));
