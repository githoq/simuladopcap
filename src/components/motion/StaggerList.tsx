import { motion } from "framer-motion";
import type { ReactNode } from "react";
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div variants={container} initial="hidden" animate="show" className={className}>{children}</motion.div>;
}
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div variants={item} className={className}>{children}</motion.div>;
}