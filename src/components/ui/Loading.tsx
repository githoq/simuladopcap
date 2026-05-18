import { motion } from "framer-motion";
import { ProgressBar } from "./ProgressBar";

interface LoadingProps {
  progress?: number;
  error?:    string | null;
}

export function Loading({ progress = 0, error }: LoadingProps) {
  return (
    <div className="fixed inset-0 bg-bg-base flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-8 text-center"
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-xl bg-gold-subtle border border-border-gold flex items-center justify-center mb-3">
            <span className="text-gold font-bold text-base font-sans">P</span>
          </div>
          <span className="text-text-primary font-sans font-semibold tracking-tight">PC-AP Simulados</span>
          <span className="text-text-muted text-xs font-sans">Polícia Civil do Amapá</span>
        </div>

        {/* Progress */}
        <div className="w-52 space-y-2">
          {error ? (
            <p className="text-wrong text-sm font-sans">{error}</p>
          ) : (
            <>
              <ProgressBar value={progress} height="xs" />
              <p className="text-text-muted text-xs font-sans tabular-nums">
                Carregando questões... {progress}%
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
