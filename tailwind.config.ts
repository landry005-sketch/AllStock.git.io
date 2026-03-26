/** @type {import('tailwindcss').Config} */
module.exports = {
  // AJOUTE CETTE LIGNE ICI
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}