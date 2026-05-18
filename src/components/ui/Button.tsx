import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:   "bg-gold text-bg-base font-semibold hover:bg-gold-soft active:bg-gold-muted",
  secondary: "bg-bg-elevated border border-border-subtle text-text-primary hover:bg-bg-overlay hover:border-border-faint",
  ghost:     "text-text-secondary hover:text-text-primary hover:bg-white/5",
  danger:    "bg-wrong-bg text-wrong border border-wrong-border hover:bg-wrong/15",
  gold:      "bg-gold-subtle border border-border-gold text-gold hover:bg-gold-glow",
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-xs gap-1.5 rounded-lg",
  md: "h-8 px-3.5 text-sm gap-2 rounded-lg",
  lg: "h-10 px-5 text-sm gap-2.5 rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "inline-flex items-center justify-center font-medium font-sans",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-subtle",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading
        ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
        : icon
      }
      {children}
      {iconRight}
    </motion.button>
  );
}
