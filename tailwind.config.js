/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        depth: {
          950: "#061420",
          900: "#0B1E2D",
          800: "#122B3E",
          700: "#1B3C52",
          600: "#254D68",
        },
        river: {
          400: "#5FC9C9",
          500: "#2A9D8F",
          600: "#1C6E8C",
        },
        alert: {
          amber: "#E9B44C",
          red: "#D64550",
          green: "#5FA777",
        },
        mist: "#EAF4F4",
        steel: "#7C93A3",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        contour:
          "radial-gradient(circle at 20% 20%, rgba(95,201,201,0.08) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(233,180,76,0.06) 0, transparent 45%)",
      },
    },
  },
  plugins: [],
};
