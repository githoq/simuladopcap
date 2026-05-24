/**
 * ResultsPage — Cinematic exam results with animated score reveal.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy, Clock, RotateCcw, ChevronDown,
  CheckCircle, XCircle, Download, Award, Target,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { QuestionCard } from "../components/question/QuestionCard";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { fmtTime, cn } from "../lib/utils";
import { DISCIPLINE_ORDER, DISC_COLORS } from "../lib/constants";
import { exportResultsPDF } from "../lib/pdf";
import type { ExamResult } from "../types";

function AnimatedScore({ target }: { target: number }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (v: number) => Math.round(v));
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const unsub = display.on("change", setShown);
    setTimeout(() => motionVal.set(target), 400);
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
      <div className="min-h-screen relative flex flex-col items-center justify-center gap-4" style={{ background: "#06080B" }}>
        <AmbientBackground variant="workspace" />
        <p className="text-text-secondary relative z-10">Nenhum resultado disponível.</p>
        <Button variant="gold" onClick={() => navigate("/")} className="relative z-10">Início</Button>
      </div>
    );
  }

  const pct = result.percent;
  const grade = pct >= 70 ? "Aprovado" : pct >= 50 ? "Regular" : "Abaixo da média";
  const gradeColor = pct >= 70 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const gradeGlow  = pct >= 70 ? "rgba(34,197,94,0.35)" : pct >= 50 ? "rgba(245,158,11,0.30)" : "rgba(239,68,68,0.25)";
  const gradeBg    = pct >= 70 ? "rgba(34,197,94,0.06)" : pct >= 50 ? "rgba(245,158,11,0.06)" : "rgba(239,68,68,0.05)";

  const discRows = DISCIPLINE_ORDER
    .filter((d) => result.disciplineStats[d])
    .map((d) => {
      const s = result.disciplineStats[d];
      const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      return { disc: d, short: d.length > 16 ? d.slice(0, 14) + "…" : d, ...s, pct: p, color: DISC_COLORS[DISCIPLINE_ORDER.indexOf(d)] };
    });

  const barData = discRows.map((r) => ({ name: r.short, acertos: r.correct, erros: r.wrong }));

  return (
    <div className="min-h-screen relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="hero" />

      {/* Massive grade-colored halo */}
      <div
        aria-hidden
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none blur-[140px]"
        style={{ background: `radial-gradient(${gradeGlow}, transparent 70%)` }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24 pt-24 md:pb-12">
        <StaggerList className="space-y-5">

          {/* Score Hero — cinematic reveal */}
          <StaggerItem>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-3xl overflow-hidden p-10 text-center"
              style={{
                background: `linear-gradient(180deg, ${gradeBg} 0%, rgba(11,15,20,0.92) 70%)`,
                border: `1px solid ${gradeColor}33`,
                boxShadow:
                  `inset 0 1px 0 ${gradeColor}20, 0 24px 64px -16px ${gradeGlow}`,
              }}
            >
              {/* Top hairline */}
              <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${gradeColor}80, transparent)` }} />

              {/* Trophy with halo */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative inline-block mb-6"
              >
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-60"
                  style={{ background: `radial-gradient(circle, ${gradeColor}, transparent 70%)` }}
                />
                <div
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${gradeColor}30, ${gradeColor}08)`,
                    border: `1px solid ${gradeColor}50`,
                  }}
                >
                  <Trophy className="w-7 h-7" style={{ color: gradeColor }} />
                </div>
              </motion.div>

              {/* Score number */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="font-mono font-semibold tracking-tightest leading-none mb-3"
                style={{
                  fontSize: "clamp(4rem, 14vw, 7rem)",
                  color: gradeColor,
                  textShadow: `0 0 60px ${gradeGlow}`,
                }}
              >
                <AnimatedScore target={pct} />%
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <p className="text-text-secondary text-base mt-3 font-sans tracking-tight">
                  <span className="text-text-primary font-semibold tabular-nums">{result.score}</span> de <span className="tabular-nums">{result.total}</span> questões corretas
                </p>
                <div
                  className="inline-block mt-4 text-xs font-semibold px-3.5 py-1.5 rounded-full font-sans tracking-tight"
                  style={{
                    color: gradeColor,
                    background: `${gradeColor}10`,
                    border: `1px solid ${gradeColor}40`,
                    boxShadow: `0 0 16px -4px ${gradeGlow}`,
                  }}
                >
                  {grade}
                </div>
                <div className="mt-6 max-w-xs mx-auto">
                  <ProgressBar value={pct} height="md" color={`linear-gradient(90deg, ${gradeColor}aa, ${gradeColor})`} />
                </div>
              </motion.div>
            </motion.div>
          </StaggerItem>

          {/* Stats row */}
          <StaggerItem>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle, label: "Corretas", value: result.score,                          color: "#22c55e", glow: "rgba(34,197,94,0.20)" },
                { icon: XCircle,     label: "Erradas",  value: result.total - result.score,           color: "#ef4444", glow: "rgba(239,68,68,0.20)" },
                { icon: Clock,       label: "Tempo",    value: fmtTime(result.timeSpent),             color: "#c8a75d", glow: "rgba(200,167,93,0.20)" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -2 }}
                    className="relative rounded-2xl p-4 text-center overflow-hidden"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-40"
                      style={{ background: `radial-gradient(circle, ${s.glow}, transparent 70%)` }}
                    />
                    <Icon className="w-4 h-4 mx-auto mb-2 relative" style={{ color: s.color }} />
                    <div className="text-2xl font-bold font-mono tabular-nums relative" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mt-1 relative font-sans">{s.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </StaggerItem>

          {/* Discipline breakdown */}
          {discRows.length > 0 && (
            <StaggerItem>
              <div className="rounded-2xl overflow-hidden" style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>
                <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 border-b border-white/[0.04]">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
                    <Target className="w-3.5 h-3.5 text-text-secondary" />
                  </div>
                  <h2 className="text-sm font-semibold text-text-primary font-sans tracking-tight">Por disciplina</h2>
                </div>
                <div className="p-5 space-y-3.5">
                  {discRows.map((r, i) => (
                    <motion.div
                      key={r.disc}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <div className="flex justify-between text-xs mb-1.5 font-sans tracking-tight">
                        <span className="text-text-secondary">{r.disc}</span>
                        <span className={cn(
                          "font-mono font-semibold tabular-nums",
                          r.pct >= 70 ? "text-[#22c55e]" : r.pct >= 50 ? "text-yellow-400" : "text-[#ef4444]"
                        )}>{r.correct}/{r.total} · {r.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              r.pct >= 70 ? "linear-gradient(90deg, #16a34a, #22c55e)"
                                : r.pct >= 50 ? "linear-gradient(90deg, #d97706, #f59e0b)"
                                : "linear-gradient(90deg, #dc2626, #ef4444)",
                            boxShadow:
                              r.pct >= 70 ? "0 0 8px rgba(34,197,94,0.3)"
                                : r.pct >= 50 ? "0 0 8px rgba(245,158,11,0.3)"
                                : "0 0 8px rgba(239,68,68,0.3)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${r.pct}%` }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}

          {/* Bar chart */}
          {barData.length > 1 && (
            <StaggerItem>
              <div className="rounded-2xl overflow-hidden" style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div className="px-5 pt-5 pb-3 border-b border-white/[0.04]">
                  <h2 className="text-sm font-semibold text-text-primary font-sans tracking-tight">Acertos vs. Erros</h2>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={Math.max(120, barData.length * 28)}>
                    <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip
                        contentStyle={{
                          background: "linear-gradient(180deg, rgba(20,26,34,0.95), rgba(11,15,20,0.98))",
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: 12,
                          fontSize: 12,
                          backdropFilter: "blur(12px)",
                        }}
                        cursor={{ fill: "rgba(255,255,255,0.02)" }}
                      />
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
              onClick={() => setShowReview((v: boolean) => !v)}
              className="w-full group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
                  <Award className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" />
                </div>
                <span className="text-sm font-semibold text-text-primary font-sans tracking-tight">Revisar questão por questão</span>
              </div>
              <motion.div animate={{ rotate: showReview ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4 text-text-tertiary" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
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
                      onPrev={reviewIdx > 0 ? () => setReviewIdx((q: number) => q - 1) : undefined}
                      onNext={reviewIdx < result.questions.length - 1 ? () => setReviewIdx((q: number) => q + 1) : undefined}
                    />
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </StaggerItem>

          {/* Actions */}
          <StaggerItem>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Button
                variant="secondary" size="lg"
                onClick={() => exportResultsPDF(result)}
                icon={<Download className="w-4 h-4" />}
              >
                Exportar PDF
              </Button>
              <Button
                variant="secondary" size="lg"
                onClick={() => navigate("/generator")}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Novo simulado
              </Button>
              <Button variant="primary" size="lg" onClick={() => navigate("/")}>
                Início
              </Button>
            </div>
          </StaggerItem>

        </StaggerList>
      </div>
    </div>
  );
}
