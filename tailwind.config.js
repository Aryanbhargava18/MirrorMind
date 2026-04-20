/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'var(--bg-base)',
          50: 'var(--bg-surface)',
          100: 'var(--bg-elevated)',
          200: 'var(--bg-elevated)',
        },
        warm: {
          DEFAULT: 'var(--text-primary)',
          50: 'var(--text-primary)',
          100: 'var(--text-secondary)',
          200: 'var(--text-secondary)',
        },
        amber: {
          DEFAULT: 'var(--accent-primary)',
          50: 'rgba(245,158,11,0.1)',
          100: 'rgba(245,158,11,0.2)',
          200: 'rgba(245,158,11,0.3)',
          300: 'rgba(245,158,11,0.5)',
          400: 'var(--accent-primary)',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        muted: 'var(--text-muted)',
        'muted-light': 'var(--text-secondary)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'pill': '8px',
      },
      maxWidth: {
        'card': '900px',
        'app': '1100px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
