import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          midnight: "#0A1C3B",
          deep: "#0F2A55",
          gold: "#D8B45C",
          goldGlow: "#F5D27D",
          ivory: "#F7F4EF",
        },
      },
      boxShadow: {
        glow: "0 0 35px rgba(216, 180, 92, 0.35)",
      },
      backgroundImage: {
        "brand-radial":
          "radial-gradient(circle at top, rgba(245, 210, 125, 0.18), transparent 55%)",
        "brand-sheen":
          "linear-gradient(120deg, rgba(245, 210, 125, 0.18), rgba(216, 180, 92, 0.02), rgba(10, 28, 59, 0.8))",
      },
      animation: {
        shimmer: "shimmer 6s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
