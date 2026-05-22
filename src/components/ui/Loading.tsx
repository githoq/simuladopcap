import { motion } from "framer-motion";
import { AmbientBackground } from "./AmbientBackground";

interface LoadingProps {
  progress?: number;
  error?:    string | null;
}

export function Loading({ progress = 0, error }: LoadingProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ background: "#06080B" }}>
      <AmbientBackground variant="hero" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Wordmark with halo */}
        <div className="relative mb-7">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl blur-2xl opacity-70 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(200,167,93,0.5), transparent 70%)" }}
          />
          <div
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(228,204,149,0.25), rgba(200,167,93,0.08))",
              border: "1px solid rgba(200,167,93,0.35)",
              boxShadow: "0 0 32px -6px rgba(200,167,93,0.5), inset 0 1px 0 rgba(228,204,149,0.20)",
            }}
          >
            <span className="font-bold text-xl font-sans" style={{ color: "#e4cc95" }}>P</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div
            className="font-sans font-semibold tracking-tightest text-2xl"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            PC-AP Simulados
          </div>
          <div className="text-text-muted text-xs font-sans mt-1.5 tracking-tight">Polícia Civil do Amapá</div>
        </div>

        {/* Progress */}
        <div className="w-64 space-y-3">
          {error ? (
            <p className="text-wrong text-sm font-sans text-center">{error}</p>
          ) : (
            <>
              <div className="h-1 rounded-full overflow-hidden bg-white/[0.04]">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: "linear-gradient(90deg, #8a7240 0%, #c8a75d 50%, #e4cc95 100%)",
                    boxShadow: "0 0 12px rgba(200,167,93,0.5)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.8s linear infinite",
                    }}
                  />
                </motion.div>
              </div>
              <p className="text-text-muted text-xs font-sans tabular-nums text-center tracking-tight">
                Carregando questões · {progress}%
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
