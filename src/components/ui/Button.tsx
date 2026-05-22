/**
 * Button — Premium cinematic variants.
 *
 * Variants:
 *  - primary:   White-on-black, Vercel-style. Gold shimmer on hover.
 *  - gold:      Subtle gold-tinted, refined accent action.
 *  - secondary: Glass surface with gradient border.
 *  - ghost:     Pure transparent, hover wash.
 *  - danger:    Restrained crimson.
 *
 * Microinteractions:
 *  - whileTap: 0.98 scale (subtle compress)
 *  - Hover: -1px lift (magnetic feel)
 *  - Shimmer sweep on primary variants
 */
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  icon?:      React.ReactNode;
  iconRight?: React.ReactNode;
  shimmer?:   boolean;
}

const base = "inline-flex items-center justify-center font-medium font-sans tracking-tight " +
             "transition-all duration-base ease-smooth " +
             "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 " +
             "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none " +
             "relative overflow-hidden select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-bg-base font-semibold " +
    "shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_0_0_1px_rgba(255,255,255,0.18),0_8px_24px_-6px_rgba(0,0,0,0.45)] " +
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_0_0_1px_rgba(255,255,255,0.25),0_12px_32px_-6px_rgba(0,0,0,0.55),0_0_24px_-6px_rgba(200,167,93,0.35)] " +
    "hover:-translate-y-[1px]",
  gold:
    "text-bg-base font-semibold " +
    "bg-[linear-gradient(180deg,#e4cc95_0%,#c8a75d_50%,#a8884a_100%)] " +
    "shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(200,167,93,0.45),0_8px_24px_-6px_rgba(200,167,93,0.35)] " +
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_0_0_1px_rgba(200,167,93,0.6),0_14px_36px_-6px_rgba(200,167,93,0.5),0_0_30px_-8px_rgba(200,167,93,0.55)] " +
    "hover:-translate-y-[1px]",
  secondary:
    "text-text-primary " +
    "bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.01)_100%)] " +
    "border border-white/[0.08] " +
    "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_1px_3px_rgba(0,0,0,0.35)] " +
    "hover:bg-white/[0.04] hover:border-white/[0.14] " +
    "hover:-translate-y-[1px] " +
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_16px_-2px_rgba(0,0,0,0.5)]",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
  danger:
    "bg-wrong-bg text-wrong border border-wrong-border " +
    "hover:bg-wrong/15 hover:border-wrong/40 hover:-translate-y-[1px]",
};

const sizes: Record<Size, string> = {
  sm: "h-7  px-3   text-xs gap-1.5 rounded-lg",
  md: "h-9  px-4   text-sm gap-2   rounded-xl",
  lg: "h-11 px-5.5 text-sm gap-2.5 rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  shimmer = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const hasShimmer = shimmer || variant === "primary" || variant === "gold";

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.12 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {/* Shimmer sweep on premium variants */}
      {hasShimmer && !disabled && !loading && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%)",
            backgroundSize: "250% 100%",
            backgroundPosition: "200% 0",
            transition: "background-position 700ms cubic-bezier(0.16,1,0.3,1)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundPosition = "-50% 0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundPosition = "200% 0"; }}
        />
      )}

      <span className="relative inline-flex items-center justify-center gap-[inherit]">
        {loading
          ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
          : icon
        }
        {children}
        {iconRight}
      </span>
    </motion.button>
  );
}
