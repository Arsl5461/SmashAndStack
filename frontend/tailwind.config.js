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
          yellow: '#2F6BFF',
          amber: '#3B82F6',
          orange: '#2563EB',
          blue: '#2F6BFF',
        },
        ink: {
          900: '#2F6BFF',
          800: '#2563EB',
        },
        cream: {
          50: '#FFF8F0',
          100: '#F7E8D4',
        },
      },
      boxShadow: {
        card: '0 12px 28px -20px rgba(10, 22, 40, 0.45)',
      },
    },
  },
  plugins: [],
};
