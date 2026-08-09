import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        smartBg: '#0A0C0E',
        smartSurface: '#111519',
        smartElevated: '#181D21',
        smartBorder: '#282F34',
        smartTextPrimary: '#F4F6F1',
        smartTextSecondary: '#8B9298',
        signature: '#B7F34A',
        available: '#10B981',
        limited: '#F59E0B',
        occupied: '#EF4444',
        aiBlue: '#3B82F6',
        background: '#0A0C0E',
        foreground: '#F4F6F1',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'sans-serif'],
        sans: ['var(--font-inter)', 'ui-sans-serif', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'smart-sm': '4px',
        smart: '6px',
        'smart-lg': '10px',
      },
      backgroundImage: {
        'gradient-to-right': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
