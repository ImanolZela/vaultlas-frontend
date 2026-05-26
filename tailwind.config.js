/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vault-neon':    '#CCFF00',
        'vault-emerald': '#10B981',
        'vault-coral':   '#EF4444',
        'vault-deep':    '#0F0F0F',
        'vault-dark':    '#1A1A1A',
        'vault-white':   '#FFFFFF',
        'vault-blue':    '#3B82F6',
        'vault-amber':   '#FBBF24',
        'vault-lime':    '#B3FF00',
      },
    },
  },
  plugins: [],
}
