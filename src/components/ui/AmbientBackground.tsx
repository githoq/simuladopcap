/**
 * AmbientBackground — Cinematic premium backdrop system.
 *
 * Composable layers:
 *  - Aurora: animated radial gradients (violet × gold × teal)
 *  - Grid:   ultra-subtle Linear-style dotted/line grid
 *  - Noise:  film-grain SVG texture
 *  - Vignette: edge-darkening for focus
 *
 * Variants: "hero" (full intensity, Landing), "workspace" (subtle, dashboards),
 *           "minimal" (just noise, for reading modes).
 *
 * Inspired by: Vercel, Linear, Stripe, Apple, Framer.
 */
import { motion } from "framer-motion";

type Variant = "hero" | "workspace" | "minimal";

interface AmbientBackgroundProps {
  variant?: Variant;
  className?: string;
}

export function AmbientBackground({ variant = "workspace", className }: AmbientBackgroundProps) {
  const intensity = variant === "hero" ? 1 : variant === "workspace" ? 0.5 : 0.2;
  const showGrid  = variant !== "minimal";
  const showOrbs  = variant !== "minimal";

  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      style={{ zIndex: 0 }}
    >
      {/* ── Layer 1: Base gradient (always present) ────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(124,92,255,0.08) 0%, transparent 55%)," +
            "radial-gradient(ellipse 80% 50% at 100% 50%, rgba(200,167,93,0.05) 0%, transparent 55%)," +
            "radial-gradient(ellipse 70% 50% at 0% 100%, rgba(62,215,194,0.04) 0%, transparent 55%)",
          opacity: intensity,
        }}
      />

      {/* ── Layer 2: Animated aurora orbs ──────────────────────────── */}
      {showOrbs && (
        <>
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{
              width: 620,
              height: 620,
              top: "-15%",
              left: "10%",
              background: "radial-gradient(circle, rgba(124,92,255,0.18), transparent 65%)",
              opacity: 0.6 * intensity,
            }}
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.08, 0.96, 1],
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[110px]"
            style={{
              width: 540,
              height: 540,
              top: "20%",
              right: "-5%",
              background: "radial-gradient(circle, rgba(200,167,93,0.15), transparent 65%)",
              opacity: 0.55 * intensity,
            }}
            animate={{
              x: [0, -30, 25, 0],
              y: [0, 25, -15, 0],
              scale: [1, 0.94, 1.06, 1],
            }}
            transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
          />
          {variant === "hero" && (
            <motion.div
              className="absolute rounded-full blur-[100px]"
              style={{
                width: 480,
                height: 480,
                bottom: "5%",
                left: "30%",
                background: "radial-gradient(circle, rgba(62,215,194,0.10), transparent 70%)",
                opacity: 0.45,
              }}
              animate={{
                x: [0, 30, -25, 0],
                y: [0, -20, 15, 0],
                scale: [1, 1.05, 0.97, 1],
              }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </>
      )}

      {/* ── Layer 3: Subtle grid (Linear-style) ────────────────────── */}
      {showGrid && (
        <div
          className="absolute inset-0 grid-mask"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: 0.7 * intensity,
          }}
        />
      )}

      {/* ── Layer 4: Top horizon glow (Vercel-style) ───────────────── */}
      {variant === "hero" && (
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 15%, rgba(200,167,93,0.5) 50%, transparent 85%)",
            boxShadow: "0 0 40px 4px rgba(200,167,93,0.25)",
          }}
        />
      )}

      {/* ── Layer 5: Noise grain ───────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix values=\'0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.55\'/%3E%3C/svg%3E")',
          opacity: variant === "hero" ? 0.035 : 0.025,
          mixBlendMode: "overlay",
        }}
      />

      {/* ── Layer 6: Edge vignette ─────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(6,8,11,0.45) 100%)",
        }}
      />
    </div>
  );
}

/**
 * SpotlightCard — A card that follows the cursor with a soft golden spotlight.
 * Apply via .spotlight utility class on the element directly,
 * setting --mx and --my CSS custom properties via onMouseMove.
 */
