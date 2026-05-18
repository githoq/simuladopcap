import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, TrendingUp, Award, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { fadeUp, staggerContainer, staggerItem, timing } from "../lib/motion";
import { fmtDate, fmtTime } from "../lib/utils";
import type { ProgressEntry } from "../types";

interface HistoryPageProps {
  history: ProgressEntry[];
}

export default function HistoryPage({ history }: HistoryPageProps) {
  const navigate = useNavigate();

  if (!history.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="w-12 h-12 text-text-tertiary mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Nenhum histórico</h2>
        <p className="text-text-secondary text-sm mb-6">Complete um simulado para ver seu progresso.</p>
        <Button variant="primary" onClick={() => navigate("/generator")}>Começar agora</Button>
      </div>
    );
  }

  const avg = Math.round(history.reduce((s, e) => s + e.percent, 0) / history.length);
  const best = Math.max(...history.map((e) => e.percent));

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto px-4 pb-24 pt-6 md:pb-8 md:pt-20 space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">
          Histórico
        </h1>
        <p className="text-text-secondary text-sm mt-1">{history.length} simulados realizados</p>
      </motion.div>

      {/* Summary */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-4">
          <TrendingUp className="w-4 h-4 text-gold mb-2" />
          <div className="text-2xl font-bold font-mono text-gold tabular-nums">{avg}%</div>
          <div className="text-xs text-text-tertiary uppercase tracking-wide mt-1">Média geral</div>
        </div>
        <div className="rounded-2xl bg-bg-elevated border border-border-subtle p-4">
          <Award className="w-4 h-4 text-correct-DEFAULT mb-2" />
          <div className="text-2xl font-bold font-mono text-correct-DEFAULT tabular-nums">{best}%</div>
          <div className="text-xs text-text-tertiary uppercase tracking-wide mt-1">Melhor resultado</div>
        </div>
      </motion.div>

      {/* History list */}
      <motion.div
        variants={staggerItem}
        className="rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden"
      >
        <div className="divide-y divide-border-subtle/40">
          {history.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xl font-bold font-mono tabular-nums ${
                      entry.percent >= 70 ? "text-correct-DEFAULT" :
                      entry.percent >= 50 ? "text-yellow-400" : "text-wrong-DEFAULT"
                    }`}>
                      {entry.percent}%
                    </span>
                    <span className="text-sm text-text-secondary">
                      {entry.score}/{entry.total}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${
                      entry.mode === "prova"
                        ? "bg-gold-subtle text-gold"
                        : "bg-white/5 text-text-tertiary"
                    }`}>
                      {entry.mode}
                    </span>
                  </div>
                  <ProgressBar value={entry.percent} height="xs" />
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {fmtTime(entry.timeSpent)}
                    </span>
                    <span>{fmtDate(entry.date)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
