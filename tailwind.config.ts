import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CasaFoot Design System
        pitch: {
          DEFAULT: "#07090F",
          50: "#0D1117",
          100: "#0F1525",
          200: "#151E30",
          300: "#1E2D3D",
          400: "#263447",
          500: "#304050",
        },
        green: {
          DEFAULT: "#16A34A",
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          glow: "rgba(22, 163, 74, 0.20)",
        },
        gold: {
          DEFAULT: "#F0B429",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
          glow: "rgba(240, 180, 41, 0.20)",
        },
        cf: {
          bg: "#07090F",
          surface: "#0F1525",
          "surface-2": "#151E30",
          border: "#1E2D3D",
          "border-subtle": "#162030",
          text: "#EFF2F7",
          muted: "#8892A4",
          dim: "#4B5768",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        "card-bronze": "linear-gradient(145deg, #3B1F0A 0%, #2A1508 50%, #3B1F0A 100%)",
        "card-silver": "linear-gradient(145deg, #1E2430 0%, #141B26 50%, #1E2430 100%)",
        "card-gold": "linear-gradient(145deg, #2A1F08 0%, #1A1305 50%, #2A1F08 100%)",
        "card-elite": "linear-gradient(145deg, #080F1F 0%, #040810 50%, #080F1F 100%)",
        "pitch-pattern":
          "linear-gradient(rgba(7,9,15,0.95), rgba(7,9,15,0.98)), url('/pitch-pattern.svg')",
      },
      boxShadow: {
        "green-glow": "0 0 20px rgba(22, 163, 74, 0.25), 0 0 40px rgba(22, 163, 74, 0.10)",
        "gold-glow": "0 0 20px rgba(240, 180, 41, 0.30), 0 0 40px rgba(240, 180, 41, 0.15)",
        "card-shadow": "0 25px 50px rgba(0, 0, 0, 0.60)",
        "inner-border": "inset 0 0 0 1px rgba(255,255,255,0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        "card-reveal": "cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(22, 163, 74, 0.20)" },
          "50%": { boxShadow: "0 0 35px rgba(22, 163, 74, 0.40)" },
        },
        cardReveal: {
          from: { opacity: "0", transform: "scale(0.92) translateY(20px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
