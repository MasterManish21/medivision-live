/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef9ff',
          100: '#d8f0fe',
          200: '#b9e4fd',
          300: '#89d3fb',
          400: '#52baf7',
          500: '#2a9df4',
          600: '#147de9',
          700: '#0d65d6',
          800: '#1151ad',
          900: '#144689',
          950: '#112c54',
        },
        accent: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        dark: {
          800: '#0f172a',
          900: '#070d1b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 2s linear infinite',
        'bounce-sm':  'bounceSm 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:  { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        bounceSm: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glow: '0 0 20px rgba(42,157,244,0.35)',
        'glow-green': '0 0 20px rgba(16,185,129,0.35)',
      },
    },
  },
  plugins: [],
}
