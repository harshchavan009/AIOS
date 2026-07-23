import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('aios_access_token'),
  isAuthenticated: !!localStorage.getItem('aios_access_token'),
  setAuth: (user, token) => {
    localStorage.setItem('aios_access_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('aios_access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
