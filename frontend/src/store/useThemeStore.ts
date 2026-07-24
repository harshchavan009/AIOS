import { create } from 'zustand';

export type ThemeMode = 'graphite' | 'light';

interface ThemeState {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => void;
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('aios_theme') as ThemeMode;
  if (saved === 'light' || saved === 'graphite') return saved;
  return 'graphite';
};

const applyThemeToDOM = (theme: ThemeMode) => {
  const root = document.documentElement;
  root.classList.remove('graphite', 'dark', 'light');
  
  if (theme === 'graphite') {
    root.classList.add('graphite', 'dark');
    root.setAttribute('data-theme', 'graphite');
  } else {
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  
  toggleTheme: () => {
    const current = get().theme;
    const next: ThemeMode = current === 'graphite' ? 'light' : 'graphite';
    localStorage.setItem('aios_theme', next);
    applyThemeToDOM(next);
    set({ theme: next });
  },

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('aios_theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  initTheme: () => {
    const current = getInitialTheme();
    applyThemeToDOM(current);
  }
}));

// Auto-initialize theme on load
useThemeStore.getState().initTheme();
