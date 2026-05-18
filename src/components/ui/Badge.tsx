import { cn } from "../../lib/utils";
import type { CSSProperties } from "react";

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  "gold" | "neutral" | "outline" | "correct" | "wrong";
  size?:     "sm" | "md";
  className?: string;
  style?:    CSSProperties;
}

const variants = {
  gold:    "bg-gold-subtle text-gold border border-border-gold",
  neutral: "bg-white/[0.05] text-text-secondary border border-border-subtle",
  outline: "border border-border-faint text-text-tertiary",
  correct: "bg-correct-bg text-correct border border-correct-border",
  wrong:   "bg-wrong-bg text-wrong border border-wrong-border",
};

const sizes = {
  sm: "text-[10px] px-1.5 py-0.5 rounded-md",
  md: "text-xs  px-2    py-0.5 rounded-md",
};

export function Badge({ children, variant = "neutral", size = "md", className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium font-sans whitespace-nowrap",
        variants[variant], sizes[size], className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
