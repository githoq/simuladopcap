import type { Variants, Transition } from "framer-motion";

// ── Restrained timing (0.2–0.35s, no blur) ────────────────────────────
export const timing = {
  fast:   { duration: 0.15, ease: [0.4, 0, 0.2, 1] } as Transition,
  base:   { duration: 0.20, ease: [0.4, 0, 0.2, 1] } as Transition,
  smooth: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } as Transition,
  slow:   { duration: 0.35, ease: [0.4, 0, 0.2, 1] } as Transition,
  spring: { type: "spring" as const, stiffness: 380, damping: 32 } as Transition,
};

// ── Page transitions — subtle, fast ──────────────────────────────────
export const pageVariants: Variants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -4 },
};
export const pageTransition: Transition = timing.smooth;

// ── Fade up — minimal lift ────────────────────────────────────────────
export const fadeUp: Variants = {
  initial:  { opacity: 0, y: 8 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: 4 },
};

// ── Fade in — opacity only ────────────────────────────────────────────
export const fadeIn: Variants = {
  initial:  { opacity: 0 },
  animate:  { opacity: 1 },
  exit:     { opacity: 0 },
};

// ── Stagger — restrained children ────────────────────────────────────
export const staggerContainer: Variants = {
  initial:  {},
  animate:  { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
};
export const staggerItem: Variants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0 },
};

// ── Question transition — slide, no blur ──────────────────────────────
export const questionVariants: Variants = {
  initial:  { opacity: 0, x: 14 },
  animate:  { opacity: 1, x: 0 },
  exit:     { opacity: 0, x: -8 },
};

// ── Alt row — hover is opacity/border only (no lift) ─────────────────
export const altVariants: Variants = {
  rest:     { opacity: 1 },
  hover:    { opacity: 1 },          // handled via CSS, not transform
  selected: { opacity: 1 },
};
