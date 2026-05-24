import { cn } from "../../lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface BadgeProps {
  children:  ReactNode;
  variant?:  "gold" | "neutral" | "outline" | "correct" | "wrong" | "violet";
  size?:     "sm" | "md";
  className?: string;
  style?:    CSSProperties;
}

const variants = {
  gold:    "bg-gold-subtle text-gold border border-border-gold",
  neutral: "bg-white/[0.05] text-text-secondary border border-white/[0.08]",
  outline: "border border-white/[0.10] text-text-tertiary",
  correct: "bg-correct-bg text-correct border border-correct-border",
  wrong:   "bg-wrong-bg text-wrong border border-wrong-border",
  violet:  "bg-[rgba(124,92,255,0.10)] text-[#a698ff] border border-[rgba(124,92,255,0.25)]",
};

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5 rounded-md",
  md: "text-xs   px-2   py-0.5 rounded-md",
};

export function Badge({ children, variant = "neutral", size = "md", className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium font-sans whitespace-nowrap tracking-tight",
        variants[variant], sizes[size], className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
