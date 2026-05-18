import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ComponentPropsWithoutRef } from "react";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  hover?: boolean;
  glass?: boolean;
  gold?: boolean;
}

export function Card({ hover = false, glass = false, gold = false, children, className, ...props }: CardProps) {
  const Comp = hover ? motion.div : "div" as React.ElementType;
  const motionProps = hover ? { whileHover: { y: -2 }, transition: { duration: 0.2 } } : {};
  return (
    <Comp
      {...motionProps}
      className={cn(
        "rounded-2xl border",
        glass ? "bg-bg-overlay/80 backdrop-blur-xl border-border-subtle" : "bg-bg-elevated border-border-subtle",
        gold && "border-border-gold",
        "shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
