/**
 * AmbientBackground — Cinematic backdrop. CSS-only animations (no JS).
 * Replaces Framer Motion orbs with CSS @keyframes for zero runtime overhead.
 */

type Variant = "hero" | "workspace" | "minimal";
interface AmbientBackgroundProps { variant?: Variant; className?: string; }

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
      {/* Layer 1: Static base gradients */}
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

      {/* Layer 2: CSS-animated aurora orbs (no JS overhead) */}
      {showOrbs && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 600, height: 600,
              top: "-15%", left: "10%",
              background: "radial-gradient(circle, rgba(124,92,255,0.16), transparent 65%)",
              filter: "blur(80px)",
              opacity: 0.6 * intensity,
              animation: "orb-1 28s ease-in-out infinite",
              willChange: "transform",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 520, height: 520,
              top: "20%", right: "-5%",
              background: "radial-gradient(circle, rgba(200,167,93,0.13), transparent 65%)",
              filter: "blur(90px)",
              opacity: 0.55 * intensity,
              animation: "orb-2 34s ease-in-out infinite",
              willChange: "transform",
            }}
          />
          {variant === "hero" && (
            <div
              className="absolute rounded-full"
              style={{
                width: 460, height: 460,
                bottom: "5%", left: "30%",
                background: "radial-gradient(circle, rgba(62,215,194,0.09), transparent 70%)",
                filter: "blur(90px)",
                opacity: 0.45,
                animation: "orb-3 24s ease-in-out infinite",
                willChange: "transform",
              }}
            />
          )}
        </>
      )}

      {/* Layer 3: Ultra-subtle dot grid (Linear-style) */}
      {showGrid && (
        <div
          className="absolute inset-0 grid-mask"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.7 * intensity,
          }}
        />
      )}

      {/* Layer 4: Top horizon glow */}
      {variant === "hero" && (
        <div
          className="absolute left-0 right-0 top-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 15%, rgba(200,167,93,0.45) 50%, transparent 85%)",
            boxShadow: "0 0 32px 4px rgba(200,167,93,0.2)",
          }}
        />
      )}

      {/* Layer 5: Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(6,8,11,0.4) 100%)",
        }}
      />
    </div>
  );
}
