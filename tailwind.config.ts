import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "mab-blue": "#0B1B3A",
        "mab-gold": "#D6A84B",
        "mab-ivory": "#F6F1E6",
        "mab-blue-2": "#0F254F",
        "mab-gold-2": "#F2C76C"
      },
      boxShadow: {
        glow: "0 0 20px rgba(214, 168, 75, 0.35)",
        panel: "0 20px 60px rgba(8, 18, 38, 0.45)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        shimmer: "shimmer 6s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
