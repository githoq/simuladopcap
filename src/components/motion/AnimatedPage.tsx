import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedPageProps {
  children:  ReactNode;
  className?: string;
}

// Restrained: opacity + minimal Y, no blur
export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
