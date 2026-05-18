import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Backgrounds (navy-dark, layered depth) ──────────────────
        bg: {
          base:     "#0B0F14",  // deepest layer
          surface:  "#111827",  // primary surfaces
          elevated: "#161B22",  // cards, panels
          overlay:  "#1C2230",  // modals, dropdowns
          input:    "#131A26",  // form inputs
        },
        // ── Gold accent (restrained luxury) ─────────────────────────
        gold: {
          DEFAULT: "#c8a75d",
          soft:    "#d6b97a",
          bright:  "#e4cc95",
          muted:   "#8a7240",
          subtle:  "rgba(200,167,93,0.10)",
          glow:    "rgba(200,167,93,0.18)",
        },
        // ── Borders ──────────────────────────────────────────────────
        border: {
          subtle:  "rgba(255,255,255,0.06)",
          faint:   "rgba(255,255,255,0.09)",
          soft:    "rgba(255,255,255,0.12)",
          gold:    "rgba(200,167,93,0.18)",
          "gold-active": "rgba(200,167,93,0.40)",
        },
        // ── Text ─────────────────────────────────────────────────────
        text: {
          primary:   "#F3F4F6",
          secondary: "#9CA3AF",
          tertiary:  "#6B7280",
          muted:     "#4B5563",
          gold:      "#c8a75d",
          inverse:   "#0B0F14",
        },

        // ── Aliases for legacy token compatibility ──────────────
        "correct-DEFAULT": "#22c55e",
        "wrong-DEFAULT":   "#ef4444",
        "text-gold":       "#c8a75d",

        // ── Semantic ─────────────────────────────────────────────────
        correct: {
          DEFAULT: "#22c55e",
          bg:      "rgba(34,197,94,0.09)",
          border:  "rgba(34,197,94,0.22)",
        },
        wrong: {
          DEFAULT: "#ef4444",
          bg:      "rgba(239,68,68,0.09)",
          border:  "rgba(239,68,68,0.22)",
        },
      },
      fontFamily: {
        sans:    ["'Inter'", "system-ui", "sans-serif"],
        serif:   ["Georgia", "'Times New Roman'", "serif"],
        display: ["'Barlow Condensed'", "'Inter'", "sans-serif"],
        body:    ["'Barlow'", "'Inter'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
        // Question-specific: institutional serif
        question: ["Georgia", "'Times New Roman'", "serif"],
      },
      fontSize: {
        "2xs": ["0.625rem",  { lineHeight: "1rem" }],
        xs:    ["0.75rem",   { lineHeight: "1.125rem" }],
        sm:    ["0.8125rem", { lineHeight: "1.35rem" }],
        base:  ["0.9375rem", { lineHeight: "1.6rem" }],
        lg:    ["1.0625rem", { lineHeight: "1.7rem" }],
        xl:    ["1.25rem",   { lineHeight: "1.75rem" }],
        "2xl": ["1.5625rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem",  { lineHeight: "2.25rem" }],
        "4xl": ["2.375rem",  { lineHeight: "2.75rem" }],
        "5xl": ["3rem",      { lineHeight: "1.08" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "13":  "3.25rem",
        "15":  "3.75rem",
        "18":  "4.5rem",
        "22":  "5.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        // Subtle depth — no dramatic glows
        "card":       "0 1px 3px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.25)",
        "card-hover": "0 2px 8px rgba(0,0,0,0.40), 0 8px 24px rgba(0,0,0,0.30)",
        "elevated":   "0 4px 16px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
        "gold-focus": "0 0 0 2px rgba(200,167,93,0.30)",
        "inner-soft": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "gradient-surface": "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)",
        "gradient-gold-subtle": "linear-gradient(135deg, rgba(200,167,93,0.12) 0%, rgba(200,167,93,0.04) 100%)",
      },
      // ── Restrained motion system ────────────────────────────────────
      transitionDuration: {
        fast:   "150ms",
        base:   "200ms",
        smooth: "280ms",
        slow:   "350ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        out:    "cubic-bezier(0, 0, 0.2, 1)",
        in:     "cubic-bezier(0.4, 0, 1, 1)",
      },
      animation: {
        "fade-in":  "fadeIn 0.25s ease forwards",
        "fade-up":  "fadeUp 0.3s ease forwards",
        "shimmer":  "shimmer 1.8s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" },                            "100%": { opacity: "1" } },
        fadeUp:  { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" },           "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};

export default config;
