import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ToastData } from "../../types";

const icons = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
  warning: AlertTriangle,
};

const styles = {
  success: "border-correct-border text-correct-DEFAULT",
  error:   "border-wrong-border text-wrong-DEFAULT",
  info:    "border-border-gold text-gold",
  warning: "border-yellow-600/30 text-yellow-400",
};

interface ToastProps { toast: ToastData | null; onClose: () => void; }

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = toast ? icons[toast.type] : null;
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,   scale: 1 }}
          exit={{    opacity: 0, y: 6,   scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "border shadow-elevated",
            styles[toast.type]
          )}
          style={{ background: "rgba(22,27,34,0.97)", backdropFilter: "blur(12px)" }}
        >
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span className="text-sm text-text-primary font-sans font-medium">{toast.msg}</span>
          <button onClick={onClose} className="ml-1 text-text-muted hover:text-text-secondary transition-colors duration-150">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
