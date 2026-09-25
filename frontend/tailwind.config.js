/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          red: '#E31B23',
          deep: '#B51218',
          yellow: '#C9A227',
          amber: '#D4A24C',
          orange: '#F59E0B',
          blue: '#9AA5B4',
        },
        ink: {
          900: '#E8EDF4',
          800: '#C5CDD8',
        },
        cream: {
          50: '#0B0E13',
          100: '#141A22',
        },
        surface: {
          DEFAULT: '#141A22',
          raised: '#1B232E',
          overlay: '#222B38',
        },
      },
      boxShadow: {
        card: '0 16px 40px -24px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
};
