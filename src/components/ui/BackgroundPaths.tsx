/**
 * BackgroundPaths — Animated SVG paths for cinematic premium backgrounds.
 * Adapted for dark navy theme. No Math.random (deterministic, stable).
 * opacity prop: 1.0 = landing (active), 0.15 = dashboard (subtle workspace feel).
 */
import { motion } from "framer-motion";

function FloatingPaths({ position, opacity = 1 }: { position: number; opacity?: number }) {
  // 20 paths — enough depth without performance cost
  const paths = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    // Thin strokes — institutional, not gamer
    width: 0.25 + i * 0.018,
    // Deterministic duration — no re-renders
    duration: 28 + (i % 8) * 2.5,
    delay: (i % 5) * 3,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="white"
            strokeWidth={path.width}
            // Very low base opacity — never competes with content
            strokeOpacity={(0.018 + path.id * 0.008) * opacity}
            initial={{ pathLength: 0.4, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [(0.15 + path.id * 0.04) * opacity, (0.35 + path.id * 0.04) * opacity, (0.15 + path.id * 0.04) * opacity],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: path.duration,
              delay: path.delay,
              repeat: Infinity,
              ease: "linear",
              // Opacity breathes at slightly different rate
              opacity: { duration: path.duration * 0.7, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
      </svg>
    </div>
  );
}

interface BackgroundPathsProps {
  opacity?: number;
  className?: string;
}

export function BackgroundPaths({ opacity = 1, className }: BackgroundPathsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}>
      <FloatingPaths position={1}  opacity={opacity} />
      <FloatingPaths position={-1} opacity={opacity} />
    </div>
  );
}
