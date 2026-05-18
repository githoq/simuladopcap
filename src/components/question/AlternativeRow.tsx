/**
 * AlternativeRow — Institutional FCC exam alternatives.
 *
 * Design target: Like a printed FCC exam booklet.
 * - Compact spacing: py-1.5 px-2.5
 * - NO hover lift, NO scale, NO glow
 * - State changes via border-color + background only
 * - Underline in alternatives: text-decoration: underline (never faked)
 * - Georgia serif content via .fcc-alt-text
 */

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { getRenderer } from "./FCCRenderer";
import { cn } from "../../lib/utils";
import { LETTERS } from "../../lib/constants";

export type AltState = "idle" | "selected" | "correct" | "wrong" | "revealed";

interface AlternativeRowProps {
  index:      number;
  content:    string;
  state:      AltState;
  disabled?:  boolean;
  onClick?:   () => void;
  isCorrect?: boolean;
  banca?:     string;
}

// ── Pure CSS state styles — no transform, no glow ────────────────────
const ROW: Record<AltState, string> = {
  // Idle: invisible container, barely perceptible hover
  idle:
    "border-white/[0.05] bg-transparent text-text-secondary " +
    "hover:border-white/[0.08] hover:bg-white/[0.02] hover:text-text-primary",
  // Selected: barely perceptible gold — institutional acknowledgment only
  selected:
    "border-[rgba(200,167,93,0.38)] bg-[rgba(200,167,93,0.035)] text-text-primary",
  // Correct/wrong: neutral institutional tones, no color spectacle
  correct:
    "border-white/[0.12] bg-white/[0.04] text-text-primary",
  wrong:
    "border-white/[0.06] bg-transparent text-text-tertiary",
  revealed:
    "border-white/[0.10] bg-white/[0.03] text-text-secondary",
};

const LETTER: Record<AltState, string> = {
  // Dry, institutional letter badges
  idle:     "bg-white/[0.03]  text-text-muted    border border-white/[0.06]",
  selected: "bg-[rgba(200,167,93,0.45)] text-bg-base border-transparent",
  correct:  "bg-white/[0.15]  text-text-primary  border-transparent",
  wrong:    "bg-white/[0.05]  text-text-muted    border-transparent",
  revealed: "bg-white/[0.10]  text-text-secondary border-transparent",
};

export function AlternativeRow({
  index, content, state, disabled = false,
  onClick, isCorrect = false, banca,
}: AlternativeRowProps) {
  const renderer = getRenderer(banca);
  const letter   = LETTERS[index] ?? String.fromCharCode(65 + index);
  const canClick = state === "idle" && !disabled;

  return (
    <motion.button
      onClick={canClick ? onClick : undefined}
      // ── No transform animations — opacity entry only ──────────────
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: index * 0.025 }}
      className={cn(
        // ── Institutional compact sizing — py-1.5 px-2.5 ───────────
        "w-full flex items-baseline gap-2.5 px-2.5 py-1.5 rounded-md",
        "border text-left",
        // ── Transition: color + border only, 150ms ──────────────────
        "transition-[border-color,background-color,color] duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-subtle",
        ROW[state],
        disabled && state === "idle" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {/* Letter — compact, matches FCC exam convention */}
      <span
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded text-[11px] font-semibold font-sans",
          "flex items-center justify-center",
          "transition-colors duration-150",
          LETTER[state]
        )}
      >
        {state === "correct" || state === "revealed"
          ? <Check className="w-3 h-3" strokeWidth={2.5} />
          : state === "wrong"
            ? <X className="w-3 h-3" strokeWidth={2.5} />
            : letter
        }
      </span>

      {/* Content — institutional Georgia serif via .fcc-alt-text ──── */}
      <span className="flex-1">{renderer.renderAlt(content)}</span>
    </motion.button>
  );
}
