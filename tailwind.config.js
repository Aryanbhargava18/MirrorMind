/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#06060E',
        surface: 'rgba(255,255,255,0.04)',
        gold: {
          DEFAULT: '#C9A227',
          hover: '#DBB640',
          dark: '#8C6C0F',
        },
        agent: {
          scout: '#3B82F6',
          critic: '#EF4444',
          advocate: '#C9A227',
          synth: '#8B5CF6',
        },
        warm: {
          DEFAULT: '#F0EDE6',
          muted: '#6B6B7B',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'pill': '999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'pulse-border': 'pulseBorder 2s infinite',
        'marquee': 'marquee 40s linear infinite',
        'curtain': 'curtainWipe 0.6s ease-in-out forwards',
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
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(255, 255, 255, 0.07)' },
          '50%': { borderColor: 'var(--pulse-color)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        curtainWipe: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0%)' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
