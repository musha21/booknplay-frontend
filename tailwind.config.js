/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        navy: {
          50:  '#eef1f8',
          100: '#d5dcef',
          200: '#aab8de',
          300: '#7f95ce',
          400: '#5471be',
          500: '#2a4dac',
          600: '#1e3a8a',
          700: '#152c6e',
          800: '#0d1e50',
          900: '#061032',
        },
        lime: {
          50:  '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(21, 44, 110, 0.10)',
        'card-hover': '0 8px 40px rgba(21, 44, 110, 0.18)',
        'lime': '0 4px 24px rgba(132, 204, 22, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'navy-gradient': 'linear-gradient(135deg, #061032 0%, #152c6e 50%, #1e3a8a 100%)',
        'lime-gradient': 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)',
      },
    },
  },
  plugins: [],
}
