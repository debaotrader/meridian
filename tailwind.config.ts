import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface tokens
        'surface-0': '#0a0a0f',
        'surface-1': '#111118',
        'surface-2': '#1a1a24',
        'surface-3': '#222232',
        // Border tokens
        'border-subtle': '#1e1e2e',
        'border-default': '#2a2a3d',
        'border-strong': '#3d3d5c',
        // Text tokens
        'text-primary': '#e8e8f0',
        'text-secondary': '#9090b0',
        'text-muted': '#5a5a7a',
        'text-inverse': '#0a0a0f',
        // Accent
        'accent': '#00FF94',
        'accent-dim': '#00cc77',
        'accent-glow': 'rgba(0,255,148,0.15)',
        // Status colors
        'status-success': '#00FF94',
        'status-warning': '#FFB800',
        'status-error': '#FF4D6A',
        'status-info': '#4DA6FF',
        'status-running': '#A78BFA',
        // Agent colors
        'agent-blue': '#4DA6FF',
        'agent-purple': '#A78BFA',
        'agent-pink': '#F472B6',
        'agent-orange': '#FB923C',
        'agent-cyan': '#22D3EE',
        // Legacy MC tokens (backward compat)
        'mc-bg': '#0a0a0f',
        'mc-bg-secondary': '#111118',
        'mc-bg-tertiary': '#1a1a24',
        'mc-border': '#2a2a3d',
        'mc-text': '#e8e8f0',
        'mc-text-secondary': '#9090b0',
        'mc-accent': '#4DA6FF',
        'mc-accent-green': '#00FF94',
        'mc-accent-yellow': '#FFB800',
        'mc-accent-red': '#FF4D6A',
        'mc-accent-purple': '#A78BFA',
        'mc-accent-pink': '#F472B6',
        'mc-accent-cyan': '#22D3EE',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(0,255,148,0.2)',
        'glow-blue': '0 0 20px rgba(77,166,255,0.2)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
        'card': '0 2px 8px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
