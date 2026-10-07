/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '14px' }],
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'md': ['16px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'xl': ['28px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
        '2xl': ['40px', { lineHeight: '46px', letterSpacing: '-0.03em' }],
      },
      colors: {
        background: 'var(--bg)',
        surface: 'var(--surface)',
        elevated: 'var(--elevated)',
        border: 'var(--border)',
        foreground: 'var(--text)',
        text: 'var(--text)',
        muted: {
          DEFAULT: 'var(--elevated)',
          foreground: 'var(--muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        primary: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--surface)',
          foreground: 'var(--text)',
        },
        secondary: {
          DEFAULT: 'var(--elevated)',
          foreground: 'var(--text)',
        },
        destructive: {
          DEFAULT: 'var(--status-danger)',
          foreground: '#ffffff',
        },
        status: {
          success: 'var(--status-success)',
          warning: 'var(--status-warning)',
          danger: 'var(--status-danger)',
          info: 'var(--status-info)',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '12px',
        '2xl': '12px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        subtle: '0 0 0 1px var(--border), 0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '250ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
