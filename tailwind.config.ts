import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "mab-navy": "#0B1B2B",
        "mab-gold": "#D4AF37",
        "mab-ivory": "#F6F2EA",
        "mab-ink": "#0F172A",
        "mab-slate": "#334155"
      },
      boxShadow: {
        glow: "0 0 20px rgba(212, 175, 55, 0.25)"
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(212, 175, 55, 0.0)" },
          "50%": { boxShadow: "0 0 30px rgba(212, 175, 55, 0.45)" }
        }
      },
      animation: {
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
