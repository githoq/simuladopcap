/**
 * SidePanel — Premium slide-out side navigation.
 * Glass surface, gradient borders, refined typography.
 */
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import {
  X, LayoutDashboard, Layers, BookOpen, Clock, Bot,
  Focus, Download, RotateCcw, Flame,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { ProgressEntry } from "../../types";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  streak?: number;
  totalQ?: number;
  usedQ?: number;
  history?: ProgressEntry[];
  onReset?: () => void;
  onExportPDF?: () => void;
}

const NAV_ITEMS = [
  { to: "/app",       label: "Dashboard",     icon: LayoutDashboard },
  { to: "/generator", label: "Simular",       icon: Layers },
  { to: "/bank",      label: "Banco",         icon: BookOpen },
  { to: "/history",   label: "Histórico",     icon: Clock },
  { to: "/focus",     label: "Modo Foco",     icon: Focus },
  { to: "/ai",        label: "Assistente IA", icon: Bot },
] as const;

export function SidePanel({
  open, onClose, streak = 0,
  history = [], onReset, onExportPDF,
}: SidePanelProps) {
  const avg = history.length
    ? Math.round(history.reduce((s, e) => s + e.percent, 0) / history.length)
    : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 50%, rgba(0,0,0,0.7), rgba(0,0,0,0.55))",
          backdropFilter: open ? "blur(8px)" : "none",
          WebkitBackdropFilter: open ? "blur(8px)" : "none",
        }}
      />

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-80 flex flex-col"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,15,20,0.95) 0%, rgba(6,8,11,0.98) 100%)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "12px 0 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* Ambient glow */}
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(200,167,93,0.10), transparent 70%)" }}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div
                  className="relative w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(228,204,149,0.30), rgba(200,167,93,0.10))",
                    boxShadow:
                      "0 0 0 1px rgba(200,167,93,0.30) inset, 0 0 18px -4px rgba(200,167,93,0.40)",
                  }}
                >
                  <span className="font-bold text-xs font-sans" style={{ color: "#e4cc95" }}>P</span>
                </div>
                <div>
                  <div className="text-text-primary font-semibold text-sm font-sans tracking-tight">PC-AP</div>
                  <div className="text-text-tertiary text-[10px] font-sans">Simulados FCC</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stats strip */}
            {history.length > 0 && (
              <div className="relative px-5 py-4 border-b border-white/[0.04]">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Média",  value: `${avg}%`,                                color: "#c8a75d" },
                    { label: "Provas", value: history.length.toString(),                color: "#F4F5F7" },
                    { label: "Streak", value: streak > 0 ? streak.toString() : "–",     color: streak > 0 ? "#fb923c" : "#6B7280" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="text-center p-2.5 rounded-xl"
                      style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <div className="text-base font-semibold font-mono tabular-nums" style={{ color: s.color }}>
                          {s.value}
                        </div>
                        {s.label === "Streak" && streak > 0 && (
                          <Flame className="w-3 h-3 text-orange-400" />
                        )}
                      </div>
                      <div className="text-[9px] text-text-muted font-sans uppercase tracking-wider mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nav */}
            <nav className="relative flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted px-3 mb-2 font-sans font-medium">
                Navegação
              </div>
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/app"}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans font-medium tracking-tight transition-all duration-200 relative",
                      isActive
                        ? "text-text-primary bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.01)_100%)] border border-white/[0.07]"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                          style={{
                            background: "linear-gradient(180deg, #e4cc95, #c8a75d)",
                            boxShadow: "0 0 8px rgba(200,167,93,0.5)",
                          }}
                        />
                      )}
                      <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Footer */}
            <div className="relative px-3 pb-5 pt-3 border-t border-white/[0.04] space-y-0.5">
              {onExportPDF && (
                <button
                  onClick={() => { onExportPDF(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-colors duration-200 font-sans font-medium"
                >
                  <Download className="w-4 h-4" />
                  Exportar PDF
                </button>
              )}
              {onReset && (
                <button
                  onClick={() => {
                    if (confirm("Resetar todo o progresso?")) { onReset(); onClose(); }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-[rgba(239,68,68,0.06)] hover:text-wrong transition-colors duration-200 font-sans font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetar progresso
                </button>
              )}
              <div className="px-3 pt-3 text-[10px] text-text-muted/60 font-sans">
                v2.0 · 741 questões FCC
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * HamburgerButton — used in FloatingNav.
 */
export function HamburgerButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-[4.5px] w-8 h-8 rounded-full",
        "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]",
        "transition-all duration-200",
        className
      )}
      aria-label="Menu"
    >
      <span className="w-4 h-px bg-current rounded-full" />
      <span className="w-4 h-px bg-current rounded-full" />
      <span className="w-3 h-px bg-current rounded-full" />
    </button>
  );
}
