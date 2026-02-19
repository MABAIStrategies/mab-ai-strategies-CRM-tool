import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "mab-navy": "#0B1F3A",
        "mab-navy-700": "#122B4D",
        "mab-gold": "#C9A227",
        "mab-gold-200": "#EBD694",
        "mab-ivory": "#F8F3E7",
        "mab-ink": "#0A0F1A"
      },
      boxShadow: {
        "gold-glow": "0 0 20px rgba(201, 162, 39, 0.35)",
        "navy-soft": "0 18px 45px rgba(10, 15, 26, 0.35)"
      },
      keyframes: {
        glimmer: {
          "0%, 100%": { opacity: "0.35", transform: "translateX(-5%)" },
          "50%": { opacity: "0.85", transform: "translateX(5%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        }
      },
      animation: {
        glimmer: "glimmer 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
