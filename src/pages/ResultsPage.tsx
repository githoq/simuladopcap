import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Target, Clock, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, CheckCircle, XCircle, MinusCircle, Download
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { QuestionCard } from "../components/question/QuestionCard";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { fmtTime, cn } from "../lib/utils";
import { DISCIPLINE_ORDER, DISC_COLORS } from "../lib/constants";
import { exportResultsPDF } from "../lib/pdf";
import type { ExamResult } from "../types";

function AnimatedScore({ target }: { target: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const unsub = display.on("change", setShown);
    setTimeout(() => motionVal.set(target), 300);
    return unsub;
  }, [target]);

  return <span className="tabular-nums">{shown}</span>;
}

export default function ResultsPage({ result }: { result: ExamResult | null }) {
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-text-secondary">Nenhum resultado disponível.</p>
        <Button variant="primary" onClick={() => navigate("/")}>Início</Button>
      </div>
    );
  }

  const pct = result.percent;
  const grade = pct >= 70 ? "Aprovado" : pct >= 50 ? "Regular" : "Abaixo da média";
  const gradeColor = pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const gradeBg   = pct >= 70 ? "rgba(34,197,94,0.08)" : pct >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)";

  const discRows = DISCIPLINE_ORDER
    .filter((d) => result.disciplineStats[d])
    .map((d, i) => {
      const s = result.disciplineStats[d];
      const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      return { disc: d, short: d.length > 16 ? d.slice(0, 14) + "…" : d, ...s, pct: p, color: DISC_COLORS[DISCIPLINE_ORDER.indexOf(d)] };
    });

  const radarData = discRows.map((r) => ({ subject: r.short, value: r.pct, fullMark: 100 }));
  const barData   = discRows.map((r) => ({ name: r.short, acertos: r.correct, erros: r.wrong }));

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-6 md:pb-8 md:pt-20">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none blur-[120px]"
        style={{ background: `radial-gradient(${gradeColor}18, transparent)` }} />

      <StaggerList className="space-y-5 relative">

        {/* Score Hero */}
        <StaggerItem>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden border p-8 text-center"
            style={{ background: gradeBg, borderColor: `${gradeColor}25` }}
          >
            {/* Top shimmer */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${gradeColor}60, transparent)` }} />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            >
              <Trophy className="w-10 h-10 mx-auto mb-5" style={{ color: gradeColor }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-7xl font-bold font-mono leading-none mb-2"
              style={{ color: gradeColor }}
            >
              <AnimatedScore target={pct} />%
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              <p className="text-text-secondary text-base mt-2">{result.score} de {result.total} questões corretas</p>
              <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full border" style={{ color: gradeColor, borderColor: `${gradeColor}40`, background: `${gradeColor}12` }}>
                {grade}
              </span>
              <div className="mt-5 max-w-xs mx-auto">
                <ProgressBar value={pct} height="sm" />
              </div>
            </motion.div>
          </motion.div>
        </StaggerItem>

        {/* Stats row */}
        <StaggerItem>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: CheckCircle, label: "Corretas",  value: result.score,  color: "#22c55e" },
              { icon: XCircle,     label: "Erradas",   value: result.total - result.score, color: "#ef4444" },
              { icon: Clock,       label: "Tempo",     value: fmtTime(result.timeSpent), color: "#c8a75d" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl bg-bg-elevated border border-border-subtle p-4 text-center"
                >
                  <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} />
                  <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wide mt-1">{s.label}</div>
                </motion.div>
              );
            })}
          </div>
        </StaggerItem>

        {/* Discipline bars */}
        {discRows.length > 0 && (
          <StaggerItem>
            <div className="rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-border-subtle/50">
                <h2 className="text-sm font-semibold text-text-primary">Por disciplina</h2>
              </div>
              <div className="p-5 space-y-3">
                {discRows.map((r) => (
                  <div key={r.disc}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-text-secondary">{r.disc}</span>
                      <span className={cn(
                        "font-mono font-semibold tabular-nums",
                        r.pct >= 70 ? "text-correct-DEFAULT" : r.pct >= 50 ? "text-yellow-400" : "text-wrong-DEFAULT"
                      )}>{r.correct}/{r.total}</span>
                    </div>
                    <motion.div
                      className="h-1.5 rounded-full bg-white/5 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: r.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.pct}%` }}
                        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>
        )}

        {/* Bar chart */}
        {barData.length > 1 && (
          <StaggerItem>
            <div className="rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden">
              <div className="px-5 pt-5 pb-4 border-b border-border-subtle/50">
                <h2 className="text-sm font-semibold text-text-primary">Acertos vs. Erros</h2>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={Math.max(120, barData.length * 28)}>
                  <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fill: "#5a5652", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#8a8680", fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ background: "#131620", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                    <Bar dataKey="acertos" fill="#22c55e" radius={[0, 3, 3, 0]} maxBarSize={10} stackId="a" />
                    <Bar dataKey="erros"   fill="#ef4444" radius={[0, 3, 3, 0]} maxBarSize={10} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </StaggerItem>
        )}

        {/* Review toggle */}
        <StaggerItem>
          <button
            onClick={() => setShowReview((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-bg-elevated border border-border-subtle hover:border-border-faint transition-all"
          >
            <span className="text-sm font-semibold text-text-primary">Revisar questão por questão</span>
            <motion.div animate={{ rotate: showReview ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-text-tertiary" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="mt-3 overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  <QuestionCard
                    key={result.questions[reviewIdx]?.id + reviewIdx}
                    question={result.questions[reviewIdx]}
                    numero={reviewIdx + 1}
                    total={result.questions.length}
                    userAnswer={result.answers[result.questions[reviewIdx]?.numero_simulado] ?? null}
                    showResult={true}
                    isTreino={false}
                    onPrev={reviewIdx > 0 ? () => setReviewIdx((q) => q - 1) : undefined}
                    onNext={reviewIdx < result.questions.length - 1 ? () => setReviewIdx((q) => q + 1) : undefined}
                  />
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </StaggerItem>

        {/* Actions */}
        <StaggerItem>
          <div className="flex gap-3">
            <Button
              variant="secondary" size="lg" className="flex-1"
              onClick={() => exportResultsPDF(result)}
              icon={<Download className="w-4 h-4" />}
            >
              Exportar PDF
            </Button>
            <Button
              variant="secondary" size="lg" className="flex-1"
              onClick={() => navigate("/generator")}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Novo simulado
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onClick={() => navigate("/")}>
              Início
            </Button>
          </div>
        </StaggerItem>

      </StaggerList>
    </div>
  );
}
