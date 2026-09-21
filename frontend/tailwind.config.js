/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gbest: {
          yellow: "#FFD21F",
          "yellow-hover": "#E6BC15",
          orange: "#FF8A00",
          dark: "#111111",
          secondary: "#1B1B1B",
          panel: "#242424",
          card: "#1F1F1F",
          border: "#333333",
          light: "#F7F7F5",
          muted: "#A0A0A0",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
