/**
 * HistoryPage — Premium history list with summary cards.
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, TrendingUp, Award, AlertCircle, BookOpen, Calendar } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { fmtDate, fmtTime, cn } from "../lib/utils";
import type { ProgressEntry } from "../types";

interface HistoryPageProps {
  history: ProgressEntry[];
}

export default function HistoryPage({ history }: HistoryPageProps) {
  const navigate = useNavigate();

  if (!history.length) {
    return (
      <div className="min-h-screen relative" style={{ background: "#06080B" }}>
        <AmbientBackground variant="workspace" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <AlertCircle className="w-7 h-7 text-text-tertiary" />
          </div>
          <h2 className="text-2xl font-semibold text-gradient-muted mb-2 tracking-tight font-sans">Nenhum histórico</h2>
          <p className="text-text-secondary text-sm mb-7 font-sans max-w-xs">
            Complete um simulado para ver seu progresso aqui.
          </p>
          <Button variant="gold" size="lg" onClick={() => navigate("/generator")}>Começar agora</Button>
        </div>
      </div>
    );
  }

  const avg = Math.round(history.reduce((s, e) => s + e.percent, 0) / history.length);
  const best = Math.max(...history.map((e) => e.percent));
  const total = history.reduce((s, e) => s + e.total, 0);

  return (
    <div className="min-h-screen relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="workspace" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24 pt-24 md:pb-12">
        <StaggerList className="space-y-6">

          <StaggerItem>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mb-1.5">
              Registro completo
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tightest text-gradient-muted">
              Histórico
            </h1>
            <p className="text-text-tertiary text-sm mt-1.5 font-sans tracking-tight">
              {history.length} simulado{history.length === 1 ? "" : "s"} realizado{history.length === 1 ? "" : "s"} · {total} questões respondidas
            </p>
          </StaggerItem>

          {/* Summary stats */}
          <StaggerItem>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: TrendingUp, label: "Média geral",  value: `${avg}%`,         color: "#c8a75d", glow: "rgba(200,167,93,0.18)" },
                { icon: Award,      label: "Melhor",       value: `${best}%`,        color: "#22c55e", glow: "rgba(34,197,94,0.18)" },
                { icon: BookOpen,   label: "Respondidas",  value: total.toString(),  color: "#a698ff", glow: "rgba(124,92,255,0.18)" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.25 }}
                    className="relative rounded-2xl p-4 overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-50"
                      style={{ background: `radial-gradient(circle, ${s.glow}, transparent 70%)` }}
                    />
                    <Icon className="w-4 h-4 mb-2 relative" style={{ color: s.color }} />
                    <div className="text-2xl font-bold font-mono tabular-nums relative" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mt-1 relative font-sans">{s.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </StaggerItem>

          {/* History list */}
          <StaggerItem>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.04]">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                </div>
                <h2 className="text-sm font-semibold text-text-primary font-sans tracking-tight">Todos os simulados</h2>
              </div>

              <div>
                {history.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.3 }}
                    className="px-5 py-4 border-b last:border-b-0 hover:bg-white/[0.015] transition-colors duration-200"
                    style={{ borderColor: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-1 h-12 rounded-full shrink-0 mt-0.5"
                        style={{
                          background:
                            entry.percent >= 70 ? "linear-gradient(180deg, #4ade80, #16a34a)"
                              : entry.percent >= 50 ? "linear-gradient(180deg, #fbbf24, #d97706)"
                              : "linear-gradient(180deg, #f87171, #dc2626)",
                          boxShadow: entry.percent >= 70 ? "0 0 8px rgba(34,197,94,0.4)" : "none",
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={cn(
                            "text-2xl font-bold font-mono tabular-nums tracking-tight",
                            entry.percent >= 70 ? "text-[#22c55e]" : entry.percent >= 50 ? "text-yellow-400" : "text-[#ef4444]"
                          )}>
                            {entry.percent}%
                          </span>
                          <span className="text-sm text-text-secondary font-sans tabular-nums">
                            {entry.score}/{entry.total}
                          </span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-md font-sans font-medium tracking-tight"
                            style={{
                              background: entry.mode === "prova" ? "rgba(200,167,93,0.10)" : "rgba(255,255,255,0.04)",
                              color: entry.mode === "prova" ? "#c8a75d" : "rgba(255,255,255,0.4)",
                              border: entry.mode === "prova" ? "1px solid rgba(200,167,93,0.18)" : "1px solid rgba(255,255,255,0.05)",
                            }}
                          >
                            {entry.mode}
                          </span>
                        </div>
                        <ProgressBar value={entry.percent} height="xs" />
                        <div className="flex items-center gap-3 mt-2.5 text-xs text-text-tertiary font-sans tabular-nums">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fmtTime(entry.timeSpent)}
                          </span>
                          <span className="text-text-muted">·</span>
                          <span>{fmtDate(entry.date)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </StaggerItem>

        </StaggerList>
      </div>
    </div>
  );
}
