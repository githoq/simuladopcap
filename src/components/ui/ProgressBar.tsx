import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value:    number;
  max?:     number;
  height?:  "xs" | "sm";
  className?: string;
  color?:   string;
}

const heights = { xs: "h-px", sm: "h-1" };

export function ProgressBar({ value, max = 100, height = "sm", className, color }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full rounded-full bg-white/[0.05] overflow-hidden", heights[height], className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color ?? "linear-gradient(90deg, #8a7240, #c8a75d)" }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}
