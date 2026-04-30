/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CD0000',
          light: '#E83333',
          dark: '#A00000',
          50: '#FFF0F0',
          100: '#FFD6D6',
          200: '#FFAAAA',
          300: '#FF7070',
          400: '#E83333',
          500: '#CD0000',
          600: '#A00000',
          700: '#7A0000',
          800: '#560000',
          900: '#370000',
        },
        bg: {
          DEFAULT: '#EFEDE6',
          dark: '#E4E1D9',
          darker: '#D5D0C5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F7F4',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#555555',
          muted: '#888888',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        full: '9999px',
      },
      boxShadow: {
        sharp: '4px 4px 0px #CD0000',
        'sharp-sm': '2px 2px 0px #CD0000',
        'sharp-dark': '4px 4px 0px #1A1A1A',
        card: '0 2px 8px rgba(0,0,0,0.08)',
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
