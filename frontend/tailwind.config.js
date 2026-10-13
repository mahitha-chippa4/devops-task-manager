/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        circle: {
          blue: "#0480EC",
          dark: "#161616",
          gray: "#2B2B2B",
          accent: "#32CD32",
        }
      }
    },
  },
  plugins: [],
}
