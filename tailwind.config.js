/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,js}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    }
  },
  safelist: [
    'pa-word-good', 'pa-word-fair', 'pa-word-bad',
    'pa-word-omission', 'pa-word-insertion',
    'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-500',
  ],
  plugins: [],
};
