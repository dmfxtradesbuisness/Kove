import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Aligned with CSS custom properties in globals.css
        background: '#07070a',        // --base
        surface: {
          DEFAULT: '#0e0e13',         // --surface-1
          2: '#13131a',               // --surface-2
          3: '#18181f',               // --surface-3
          4: '#1e1e27',               // --surface-4
        },
        muted: '#6b7280',             // --text-2
        accent: {
          DEFAULT: '#1E6EFF',         // --accent
          hover: '#3d84ff',           // --accent-hi
          subtle: 'rgba(30,110,255,0.12)',
        },
        success: '#34D399',
        warning: '#FBBF24',
        danger:  '#F87171',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Fahkwang',  'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'Krona One', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'Inter',     'system-ui', 'sans-serif'],
        mono:    ['var(--font-body)',    'Inter',     'ui-monospace', 'monospace'],
        sans:    ['var(--font-body)',    'Inter',     'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        sm:   '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        md:   '0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)',
        lg:   '0 8px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
        glow: '0 0 24px rgba(30,110,255,0.25), 0 0 8px rgba(30,110,255,0.15)',
      },
      animation: {
        'fade-in':   'fadeIn 0.35s ease-out',
        'fade-up':   'fadeUp 0.55s cubic-bezier(0.22,1,0.36,1)',
        'slide-up':  'slideUp 0.4s cubic-bezier(0.22,1,0.36,1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.22,1,0.36,1)',
        'pop':       'pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer':   'shimmer 2s linear infinite',
        'glow-pulse':'glowPulse 3s ease-in-out infinite',
        'float':     'float 6s ease-in-out infinite',
        'orb-drift': 'orbDrift 24s ease-in-out infinite',
        'pulse-slow':'pulseSlow 8s ease-in-out infinite',
        'count-in':  'countIn 0.6s cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pop: {
          '0%':   { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(30,110,255,0.2)' },
          '50%':       { boxShadow: '0 0 24px rgba(30,110,255,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%':       { transform: 'translate(40px,-30px) scale(1.05)' },
          '66%':       { transform: 'translate(-30px,40px) scale(0.96)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.7' },
          '50%':       { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
