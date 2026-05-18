import { motion } from "framer-motion";
import type { ReactNode } from "react";
interface FadeUpProps { children: ReactNode; delay?: number; className?: string; }
export function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >{children}</motion.div>
  );
}