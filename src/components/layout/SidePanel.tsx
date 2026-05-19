/**
 * SidePanel — Global hamburger slide-out panel.
 * Linear/Notion-style. Used in ALL screens via App.tsx.
 * Exam/Focus pages: still accessible but unobtrusive.
 */
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  X, LayoutDashboard, Layers, BookOpen, Clock, Bot,
  Focus, Download, RotateCcw, Settings, ChevronRight,
  Flame,
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
  { to: "/app",       label: "Dashboard",  icon: LayoutDashboard },
  { to: "/generator", label: "Simular",    icon: Layers },
  { to: "/bank",      label: "Banco",      icon: BookOpen },
  { to: "/history",   label: "Histórico",  icon: Clock },
  { to: "/focus",     label: "Modo Foco",  icon: Focus },
  { to: "/ai",        label: "Assistente IA", icon: Bot },
] as const;

export function SidePanel({
  open, onClose, streak = 0, totalQ = 0, usedQ = 0,
  history = [], onReset, onExportPDF,
}: SidePanelProps) {
  const navigate = useNavigate();
  const avg = history.length
    ? Math.round(history.reduce((s, e) => s + e.percent, 0) / history.length)
    : 0;

  return (
    <>
      {/* ── Backdrop: CSS transition — pointer-events-none quando fechado ── */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ backdropFilter: open ? "blur(4px)" : "none" }}
      />

      {/* ── Panel: framer-motion slide ────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 bottom-0 z-[70] w-72 flex flex-col border-r border-white/[0.06]"
            style={{ background: "#0B0F14" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.12]"
                  style={{ background: "rgba(200,167,93,0.12)" }}
                >
                  <span className="text-gold font-bold text-xs font-sans">P</span>
                </div>
                <span className="text-text-primary font-semibold text-sm font-sans">PC-AP Simulados</span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-white/5 transition-colors duration-150"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Stats strip */}
            {history.length > 0 && (
              <div className="px-5 py-3 border-b border-white/[0.04] grid grid-cols-3 gap-3">
                {[
                  { label: "Média", value: `${avg}%` },
                  { label: "Provas", value: history.length },
                  { label: "Streak", value: streak > 0 ? `${streak}🔥` : "–" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-sm font-bold font-mono text-text-primary">{s.value}</div>
                    <div className="text-[10px] text-text-muted font-sans">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-colors duration-150",
                    isActive
                      ? "bg-white/[0.06] text-text-primary"
                      : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Footer actions */}
            <div className="px-3 pb-5 pt-2 border-t border-white/[0.04] space-y-0.5">
              {onExportPDF && (
                <button
                  onClick={() => { onExportPDF(); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-colors duration-150 font-sans"
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-white/[0.04] hover:text-wrong transition-colors duration-150 font-sans"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetar progresso
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * HamburgerButton — minimal 3-line icon, used in FloatingNav and ExamPage.
 */
export function HamburgerButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-[4.5px] w-8 h-8 rounded-lg",
        "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]",
        "transition-colors duration-150",
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
