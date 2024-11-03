/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workshop: {
          metal: '#2d3748',
          accent: '#10b981',
          highlight: '#34d399',
        }
      }
    },
  },
  plugins: [],
}