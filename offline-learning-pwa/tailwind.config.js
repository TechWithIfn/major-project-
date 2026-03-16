/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: '#0f766e',
        sun: '#f59e0b',
        ink: '#102a43',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Segoe UI', 'sans-serif'],
        body: ['DM Sans', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};