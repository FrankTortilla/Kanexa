import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'kanexa-bg': '#0A0C10',
        'kanexa-surface': '#111318',
        'kanexa-card': '#161B24',
        'kanexa-gold': '#C9A84C',
        'kanexa-gold-light': '#E2C97E',
        'kanexa-gold-dark': '#8B6914',
        'kanexa-text': '#F0EDE6',
        'kanexa-muted': '#8A8F9C',
        'kanexa-border': '#1E2430',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      letterSpacing: {
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
}

export default config
