/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 🟢 MAKES SURE TAILWIND SCANS YOUR REACT FILES
  ],
  theme: {
    extend: {
      colors: {
        flasho: {
          DEFAULT: '#05AC5F',
          dark: '#048C4F',
          light: '#E8F8F0'
        }
      }
    },
  },
  plugins: [],
}