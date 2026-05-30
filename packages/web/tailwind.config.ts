import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: '#A91B18',
        cerulean: '#CEE7F3',
        noir: '#181717',
        linen: '#F8FAED',
        canvas: '#F8FAED',
        structure: '#181717',
        space: '#CEE7F3',
        signal: '#A91B18',
        'noir-05': 'rgba(24,23,23,0.05)',
        'noir-10': 'rgba(24,23,23,0.10)',
        'noir-20': 'rgba(24,23,23,0.20)',
        'noir-50': 'rgba(24,23,23,0.50)',
        'noir-70': 'rgba(24,23,23,0.70)',
        'cerulean-10': 'rgba(206,231,243,0.10)',
        'cerulean-20': 'rgba(206,231,243,0.20)',
        'cerulean-30': 'rgba(206,231,243,0.30)',
        'red-10': 'rgba(169,27,24,0.10)',
        'red-20': 'rgba(169,27,24,0.20)',
        yellow: '#FFD700',
        orange: '#FF9500',
        'green-deep': '#2D5016',
        'gray-muted': '#999999',
        sidebar: '#F0F0F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '28px',
        'card-sm': '24px',
        dock: '40px',
        pill: '9999px',
      },
      fontSize: {
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      backgroundImage: {
        'gradient-cerulean': 'radial-gradient(circle at 90% 10%, rgba(206,231,243,0.3) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config;
