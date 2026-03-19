import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // === SURFACES (EXACT spec values — pure dark, NO blue tint) ===
        'surface-0': '#0a0a0a',
        'surface-1': '#111111',
        'surface-2': '#1a1a1a',
        'surface-3': '#222222',

        // === BORDERS (EXACT spec — rgba for subtle transparency) ===
        'border-subtle': 'rgba(255, 255, 255, 0.06)',
        'border-default': 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.12)',

        // === TEXT (EXACT spec values) ===
        'text-primary': '#ededed',
        'text-secondary': '#a1a1a1',
        'text-tertiary': '#6b6b6b',
        'text-muted': '#6b6b6b', // alias for text-tertiary (backward compat)
        'text-inverse': '#0a0a0a',

        // === ACCENT (EXACT spec — green-neon) ===
        'accent': '#00FF94',
        'accent-hover': '#00E085',
        'accent-dim': '#00cc77', // keep backward compat
        'accent-muted': 'rgba(0, 255, 148, 0.15)',
        'accent-subtle': 'rgba(0, 255, 148, 0.08)',
        'accent-glow': 'rgba(0, 255, 148, 0.15)',

        // === STATUS (EXACT spec) ===
        'status-success': '#00FF94',
        'status-warning': '#FFB224',
        'status-error': '#FF4444',
        'status-info': '#3B82F6',
        'status-neutral': '#6b6b6b',
        'status-running': '#A78BFA',

        // === AGENT COLORS (NAMED per spec) ===
        'agent-jarvis': '#FFD700',
        'agent-tony': '#FF4444',
        'agent-banner': '#00CC66',
        'agent-shuri': '#A855F7',
        'agent-parker': '#3B82F6',
        'agent-visao': '#FF6B35',
        // Generic aliases for backward compat
        'agent-blue': '#3B82F6',
        'agent-purple': '#A855F7',
        'agent-pink': '#F472B6',
        'agent-orange': '#FB923C',
        'agent-cyan': '#22D3EE',

        // === LEGACY MC TOKENS (backward compat — map to new values) ===
        'mc-bg': '#0a0a0a',
        'mc-bg-secondary': '#111111',
        'mc-bg-tertiary': '#1a1a1a',
        'mc-border': 'rgba(255, 255, 255, 0.08)',
        'mc-text': '#ededed',
        'mc-text-secondary': '#a1a1a1',
        'mc-accent': '#3B82F6',
        'mc-accent-green': '#00FF94',
        'mc-accent-yellow': '#FFB224',
        'mc-accent-red': '#FF4444',
        'mc-accent-purple': '#A855F7',
        'mc-accent-pink': '#F472B6',
        'mc-accent-cyan': '#22D3EE',
      },

      fontFamily: {
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        body: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'Consolas', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }],  // 13px — Linear style
        'base': ['0.875rem', { lineHeight: '1.5rem' }],  // 14px — main body
        'lg': ['1rem', { lineHeight: '1.5rem' }],
        'xl': ['1.125rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '64': '16rem',
      },

      borderRadius: {
        'DEFAULT': '8px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },

      boxShadow: {
        'card': '0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-hover': '0 0 0 1px rgba(255, 255, 255, 0.12)',
        'dropdown': '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'glow-accent': '0 0 20px rgba(0, 255, 148, 0.15)',
        'accent-glow': '0 0 20px rgba(0, 255, 148, 0.15)',
        'glow-blue': '0 0 20px rgba(77, 166, 255, 0.2)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
        'slide-in-right': 'slideInRight 200ms ease-out',
        'slide-in-up': 'slideInUp 150ms ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(4px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
