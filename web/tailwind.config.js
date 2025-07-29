/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'streak-blue': '#007AFF',
        'streak-green': '#34C759',
        'streak-red': '#FF3B30',
        'streak-gray': '#8E8E93',
      },
    },
  },
  plugins: [],
}