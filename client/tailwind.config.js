/** @type {import('tailwindcss').Config} */
// Tailwind v4: semantic tokens live in src/index.css @theme — this file kept minimal.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
