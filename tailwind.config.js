/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['"Roboto Mono"', 'ui-monospace', 'monospace'],
        display: ['Roboto', 'sans-serif'],
      },
      colors: {
        'vault-neon':    '#CCFF00',
        'vault-emerald': '#10B981',
        'vault-coral':   '#EF4444',
        'vault-deep':    '#080808',
        'vault-darker':  '#0D0D0D',
        'vault-dark':    '#1A1A1A',
        'vault-card':    '#111111',
        'vault-border':  '#232323',
        'vault-white':   '#FFFFFF',
        'vault-blue':    '#3B82F6',
        'vault-amber':   '#FBBF24',
        'vault-lime':    '#B3FF00',
      },
      boxShadow: {
        'neon-sm':  '0 0 0 1px rgba(204,255,0,0.25), 0 0 12px rgba(204,255,0,0.1)',
        'neon':     '0 0 0 1px rgba(204,255,0,0.35), 0 0 24px rgba(204,255,0,0.12)',
        'neon-lg':  '0 0 0 1px rgba(204,255,0,0.5),  0 0 40px rgba(204,255,0,0.18)',
        'emerald':  '0 0 16px rgba(16,185,129,0.3)',
        'coral':    '0 0 16px rgba(239,68,68,0.3)',
      },
      animation: {
        'glow-pulse':  'glow-pulse 2.5s ease-in-out infinite',
        'slide-up':    'slide-up 0.35s ease forwards',
        'fade-in':     'fade-in 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}
