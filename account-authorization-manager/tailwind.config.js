/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        status: {
          normal: '#22c55e',
          expiring: '#f97316',
          expired: '#ef4444',
          reminder: '#3b82f6',
        },
      },
      boxShadow: {
        card: '0 10px 30px -15px rgba(15, 23, 42, 0.25)',
      },
    },
  },
  plugins: [],
}
