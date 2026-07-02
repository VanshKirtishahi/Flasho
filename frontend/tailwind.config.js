/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flasho: '#05AC5F', // Matching your Flutter app
        flashoDark: '#048C4F',
      }
    },
  },
  plugins: [],
}