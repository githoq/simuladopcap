/**
 * AlternativeRow — FCC institutional alternatives.
 * Pure CSS transitions — no Framer Motion (was 5 instances per question).
 * State feedback via border + background only. No transform/scale.
 */

import { Check, X } from "lucide-react";
import { getRenderer } from "./FCCRenderer";
import { cn } from "../../lib/utils";
import { LETTERS } from "../../lib/constants";

export type AltState = "idle" | "selected" | "correct" | "wrong" | "revealed";

export interface AlternativeRowProps {
  index:      number;
  content:    string;
  state:      AltState;
  disabled?:  boolean;
  onClick?:   () => void;
  isCorrect?: boolean;
  banca?:     string;
  key?:       string | number | null;
}

const ROW: Record<AltState, string> = {
  idle:
    "border-white/[0.06] bg-transparent text-text-secondary " +
    "hover:border-white/[0.11] hover:bg-white/[0.025] hover:text-text-primary",
  selected:
    "border-[rgba(200,167,93,0.42)] bg-[rgba(200,167,93,0.04)] text-text-primary",
  correct:
    "border-emerald-500/30 bg-emerald-500/[0.06] text-text-primary",
  wrong:
    "border-rose-500/20 bg-rose-500/[0.04] text-text-tertiary line-through decoration-rose-500/30",
  revealed:
    "border-white/[0.10] bg-white/[0.03] text-text-secondary",
};

const LETTER: Record<AltState, string> = {
  idle:     "bg-white/[0.03]  text-text-muted    border border-white/[0.07]",
  selected: "bg-[rgba(200,167,93,0.5)] text-[#06080B] border-transparent font-bold",
  correct:  "bg-emerald-500/25 text-emerald-300   border-transparent",
  wrong:    "bg-rose-500/15    text-rose-400       border-transparent",
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
    <button
      onClick={canClick ? onClick : undefined}
      className={cn(
        "w-full flex items-baseline gap-2.5 px-2.5 py-1.5 rounded-md",
        "border text-left",
        "transition-[border-color,background-color,color,opacity] duration-150",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-subtle",
        "alt-entry",
        ROW[state],
        disabled && state === "idle" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Letter badge */}
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

      {/* Content */}
      <span className="flex-1">{renderer.renderAlt(content)}</span>
    </button>
  );
}
