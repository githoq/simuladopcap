/**
 * Card — Premium surfaces with gradient borders, glass effects, hover glow.
 *
 * Variants by prop:
 *  - default:   Subtle gradient surface with inner highlight
 *  - glass:     Translucent backdrop-blur surface (for floating elements)
 *  - gold:      Gold-tinted accent border
 *  - elevated:  Stronger surface for primary cards
 *  - spotlight: Cursor-following soft glow on hover
 *
 * All cards have a gradient border (::before) for that Linear/Vercel edge.
 *
 * Type-safe: extends HTMLMotionProps<"div"> so all framer-motion props
 * (whileHover, animate, transition, etc.) work alongside HTML div props.
 */
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";
import { useRef, type MouseEvent } from "react";

interface CardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  hover?:     boolean;
  glass?:     boolean;
  gold?:      boolean;
  elevated?:  boolean;
  spotlight?: boolean;
}

export function Card({
  hover     = false,
  glass     = false,
  gold      = false,
  elevated  = false,
  spotlight = false,
  children,
  className,
  onMouseMove,
  style,
  ...props
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (spotlight && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      ref.current.style.setProperty("--mx", `${x}%`);
      ref.current.style.setProperty("--my", `${y}%`);
    }
    onMouseMove?.(e);
  };

  const surface = glass
    ? "glass border-gradient"
    : elevated
      ? "surface-elevated border-gradient"
      : "surface border-gradient";

  const spotlightStyle: React.CSSProperties | undefined = spotlight
    ? { ["--mx" as never]: "50%", ["--my" as never]: "50%" }
    : undefined;

  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        surface,
        gold && "border-gradient-gold",
        spotlight && "spotlight",
        className
      )}
      style={{ ...spotlightStyle, ...style }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
