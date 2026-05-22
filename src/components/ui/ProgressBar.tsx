import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value:    number;
  max?:     number;
  height?:  "xs" | "sm" | "md";
  className?: string;
  color?:   string;
  shimmer?: boolean;
}

const heights = { xs: "h-px", sm: "h-1", md: "h-1.5" };

export function ProgressBar({
  value,
  max = 100,
  height = "sm",
  className,
  color,
  shimmer = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        "w-full rounded-full overflow-hidden relative",
        "bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,rgba(255,255,255,0.05)_100%)]",
        heights[height],
        className
      )}
    >
      <motion.div
        className="h-full rounded-full relative overflow-hidden"
        style={{
          background:
            color ??
            "linear-gradient(90deg, #8a7240 0%, #c8a75d 45%, #e4cc95 65%, #c8a75d 100%)",
          boxShadow: "0 0 12px -2px rgba(200,167,93,0.4)",
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {shimmer && (
          <span
            className="absolute inset-0 animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
