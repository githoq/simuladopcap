import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Backgrounds — deeper blacks for cinematic depth ──────────
        bg: {
          base:     "#06080B",  // deepest layer — near pure black
          surface:  "#0B0F14",  // primary surfaces
          elevated: "#0F141B",  // cards, panels
          overlay:  "#141A22",  // modals, dropdowns
          input:    "#0E141C",  // form inputs
        },
        // ── Gold accent (luxury, restrained) ──────────────────────────
        gold: {
          DEFAULT: "#c8a75d",
          soft:    "#d6b97a",
          bright:  "#e4cc95",
          muted:   "#8a7240",
          subtle:  "rgba(200,167,93,0.10)",
          glow:    "rgba(200,167,93,0.22)",
        },
        // ── Aurora accents (cinematic ambient lighting only) ─────────
        aurora: {
          violet: "#7c5cff",
          teal:   "#3ed7c2",
          rose:   "#ff7eb6",
          amber:  "#ffb86b",
        },
        // ── Borders ──────────────────────────────────────────────────
        border: {
          subtle:  "rgba(255,255,255,0.06)",
          faint:   "rgba(255,255,255,0.09)",
          soft:    "rgba(255,255,255,0.12)",
          gold:    "rgba(200,167,93,0.20)",
          "gold-active": "rgba(200,167,93,0.45)",
        },
        // ── Text ─────────────────────────────────────────────────────
        text: {
          primary:   "#F4F5F7",
          secondary: "#9CA3AF",
          tertiary:  "#6B7280",
          muted:     "#4B5563",
          gold:      "#c8a75d",
          inverse:   "#06080B",
        },

        // ── Aliases for legacy compatibility ──────────────────────────
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
        // ── Geist as primary UI — premium, neutral, Vercel-grade ────
        sans:    ["'Geist'", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        // ── Instrument Serif for display italic accents (Linear/Apple) ─
        display: ["'Instrument Serif'", "Georgia", "serif"],
        body:    ["'Geist'", "-apple-system", "system-ui", "sans-serif"],
        mono:    ["'Geist Mono'", "'JetBrains Mono'", "ui-monospace", "monospace"],
        // ── Question rendering — Georgia, NEVER touched (PDF/print fidelity) ─
        serif:   ["Georgia", "'Times New Roman'", "serif"],
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
        "6xl": ["3.75rem",   { lineHeight: "1.04" }],
        "7xl": ["4.75rem",   { lineHeight: "0.98" }],
        "8xl": ["6rem",      { lineHeight: "0.94" }],
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
        // Premium depth — multi-layer shadows
        "card":         "0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 3px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.30)",
        "card-hover":   "0 1px 0 rgba(255,255,255,0.06) inset, 0 4px 16px rgba(0,0,0,0.45), 0 16px 48px rgba(0,0,0,0.40)",
        "elevated":     "0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.40)",
        "floating":     "0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 64px -16px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.40)",
        "gold-focus":   "0 0 0 1px rgba(200,167,93,0.35), 0 0 28px -6px rgba(200,167,93,0.30)",
        "gold-glow":    "0 0 32px -8px rgba(200,167,93,0.45), 0 0 0 1px rgba(200,167,93,0.20)",
        "inner-soft":   "inset 0 1px 0 rgba(255,255,255,0.04)",
        "inner-edge":   "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        // Aurora glows for accent moments
        "violet-glow":  "0 0 40px -8px rgba(124,92,255,0.40)",
      },
      backgroundImage: {
        "gradient-surface":     "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 100%)",
        "gradient-gold-subtle": "linear-gradient(135deg, rgba(200,167,93,0.14) 0%, rgba(200,167,93,0.04) 100%)",
        "gradient-card":        "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
        // Aurora background for atmospheric depth
        "aurora":               "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,92,255,0.10), transparent 60%), radial-gradient(ellipse 60% 60% at 80% 30%, rgba(200,167,93,0.07), transparent 60%), radial-gradient(ellipse 50% 50% at 50% 100%, rgba(62,215,194,0.05), transparent 60%)",
        // Grid pattern (Linear-style)
        "grid-pattern":         "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      // ── Refined motion system — Apple-level easing ────────────────
      transitionDuration: {
        fast:    "150ms",
        base:    "200ms",
        smooth:  "280ms",
        slow:    "400ms",
        slower:  "600ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.32, 0.72, 0, 1)",      // Apple ease
        out:    "cubic-bezier(0.16, 1, 0.3, 1)",       // Linear ease
        in:     "cubic-bezier(0.32, 0, 0.67, 0)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",   // springy bounce
      },
      animation: {
        "fade-in":      "fadeIn 0.4s ease forwards",
        "fade-up":      "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "shimmer":      "shimmer 2.4s linear infinite",
        "aurora-shift": "auroraShift 16s ease-in-out infinite",
        "float-slow":   "floatSlow 8s ease-in-out infinite",
        "pulse-glow":   "pulseGlow 3.5s ease-in-out infinite",
        "border-spin":  "borderSpin 4s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp:  { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        auroraShift: {
          "0%, 100%": { transform: "translate(0,0) scale(1)", opacity: "0.6" },
          "50%":      { transform: "translate(-3%,2%) scale(1.08)", opacity: "0.8" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%":      { opacity: "0.9", transform: "scale(1.04)" },
        },
        borderSpin: {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
