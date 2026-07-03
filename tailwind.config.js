/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    borderRadius: {
      DEFAULT: '0',
      none: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C8102E', // Primary Red
          light: '#D50032', // Accent Red
          dark: '#A00824',
          50: '#FDF2F3',
          100: '#F2D7D5', // Soft Pink
          200: '#EAB8C9', // Light Rose
          300: '#E099B0',
          400: '#D87A96',
          500: '#C8102E',
          600: '#A00824',
          700: '#78061B',
          800: '#500412',
          900: '#280209',
        },
        bg: {
          DEFAULT: '#FFFFFF', // Pure White Main
          dark: '#F8F9FA',
          darker: '#E9ECEF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9FA',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#4A5568',
          muted: '#718096',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        soft: '0 4px 20px rgba(0,0,0,0.05)',
        glow: '0 0 15px rgba(200, 16, 46, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
