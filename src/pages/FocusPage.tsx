/**
 * Focus Mode — /focus
 *
 * Design: Kindle/Notion reading mode.
 * - Centered single column, maximum reading width 680px
 * - No navigation chrome, no sidebars
 * - Auto-hiding minimal HUD (appears on hover/touch)
 * - Typography-first: institutional serif, optimal line length
 * - Ambient: very subtle gradient, nothing distracting
 * - Keyboard navigation: ← → arrows, Esc to exit
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { QuestionCard } from "../components/question/QuestionCard";
import { fmtTime, cn } from "../lib/utils";
import { calcResults } from "../lib/exam";
import type { Exam, ExamResult } from "../types";

interface FocusPageProps {
  exam: Exam | null;
  onFinish: (result: ExamResult) => void;
}

export default function FocusPage({ exam, onFinish }: FocusPageProps) {
  const navigate   = useNavigate();
  const [cur, setCur]     = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>(exam?.answers ?? {});
  const [tLeft, setTLeft] = useState(exam?.timeLimit ?? 0);
  const [hudVisible, setHudVisible] = useState(true);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clockRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Auto-hide HUD after 2.5 s of inactivity ──────────────────────
  const showHud = useCallback(() => {
    setHudVisible(true);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => setHudVisible(false), 2500);
  }, []);

  useEffect(() => {
    showHud();
    const events = ["mousemove", "touchstart", "keydown"];
    events.forEach((e) => window.addEventListener(e, showHud));
    return () => {
      events.forEach((e) => window.removeEventListener(e, showHud));
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    };
  }, [showHud]);

  // ── Countdown timer ───────────────────────────────────────────────
  useEffect(() => {
    if (!exam || exam.mode === "treino") return;
    clockRef.current = setInterval(() =>
      setTLeft((t) => { if (t <= 1) { clearInterval(clockRef.current!); return 0; } return t - 1; }),
      1000
    );
    return () => clearInterval(clockRef.current!);
  }, [exam]);

  // ── Keyboard nav ──────────────────────────────────────────────────
  useEffect(() => {
    if (!exam) return;
    const total = exam.questions.length;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown")  setCur((c) => Math.min(total - 1, c + 1));
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")    setCur((c) => Math.max(0, c - 1));
      if (e.key === "Escape") navigate("/exam");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [exam, navigate]);

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base gap-4">
        <p className="text-text-secondary text-sm font-sans">Nenhum simulado ativo.</p>
        <button onClick={() => navigate("/generator")} className="text-gold text-sm hover:underline font-sans">
          Criar simulado
        </button>
      </div>
    );
  }

  const q       = exam.questions[cur];
  const total   = exam.questions.length;
  const answered = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const pct     = Math.round((answered / total) * 100);
  const isTreino = exam.mode === "treino";

  const finish = useCallback(() => {
    clearInterval(clockRef.current!);
    const result = calcResults({ ...exam, answers });
    onFinish(result);
    navigate("/results");
  }, [exam, answers, onFinish, navigate]);

  return (
    <div className="min-h-screen bg-bg-base" style={{ background: "#0B0F14" }}>
      {/* ── Ultra-thin progress line — always visible ─────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-px bg-border-subtle">
        <motion.div
          className="h-full"
          style={{ background: "#c8a75d" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* ── Minimal HUD — auto-hides ─────────────────────────────── */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3"
            style={{ background: "linear-gradient(to bottom, rgba(11,15,20,0.92) 0%, transparent 100%)" }}
          >
            {/* Exit */}
            <button
              onClick={() => navigate("/exam")}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors duration-150 font-sans"
            >
              <X className="w-3.5 h-3.5" />
              Sair do foco
            </button>

            {/* Center — question counter */}
            <span className="text-xs text-text-muted font-mono font-sans tabular-nums">
              {cur + 1} / {total}
            </span>

            {/* Right — timer + finish */}
            <div className="flex items-center gap-3">
              {!isTreino && (
                <span className={cn(
                  "text-xs font-mono font-sans tabular-nums",
                  tLeft < 300 ? "text-wrong" : tLeft < 600 ? "text-amber-400" : "text-text-muted"
                )}>
                  {fmtTime(tLeft)}
                </span>
              )}
              <button
                onClick={() => {
                  if (answered < total && !confirm(`${total - answered} sem resposta. Finalizar mesmo assim?`)) return;
                  finish();
                }}
                className="text-xs font-sans text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-faint px-2.5 py-1 rounded-md transition-colors duration-150"
              >
                Finalizar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main reading area — Kindle-like centered column ──────── */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-12 pb-16 px-4">
        <div className="w-full" style={{ maxWidth: "660px" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id + cur}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <QuestionCard
                question={q}
                numero={cur + 1}
                total={total}
                userAnswer={answers[q.numero_simulado] ?? null}
                isTreino={isTreino}
              isExam={true}
                showResult={false}
                onAnswer={(num, idx) => setAnswers((a) => ({ ...a, [num]: idx }))}
                onPrev={cur > 0          ? () => setCur((c) => c - 1) : undefined}
                onNext={cur < total - 1  ? () => setCur((c) => c + 1) : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Minimal bottom nav dots ───────────────────────────────── */}
      <AnimatePresence>
        {hudVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4"
          >
            {/* Prev */}
            <button
              onClick={() => setCur((c) => Math.max(0, c - 1))}
              disabled={cur === 0}
              className="w-7 h-7 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-secondary hover:border-border-faint transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Position dots — max 9 visible */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(total, 9) }).map((_, i) => {
                const realIdx = Math.min(
                  Math.max(0, cur - 4),
                  Math.max(0, total - 9)
                ) + i;
                const ua  = answers[exam.questions[realIdx]?.numero_simulado];
                const ans = ua !== null && ua !== undefined;
                const isCurDot = realIdx === cur;
                return (
                  <button
                    key={realIdx}
                    onClick={() => setCur(realIdx)}
                    className={cn(
                      "rounded-full transition-all duration-200",
                      isCurDot
                        ? "w-4 h-1.5 bg-gold"
                        : ans
                          ? "w-1.5 h-1.5 bg-correct/50"
                          : "w-1.5 h-1.5 bg-border-soft hover:bg-text-muted"
                    )}
                  />
                );
              })}
              {total > 9 && (
                <span className="text-[10px] text-text-muted font-mono font-sans ml-1">
                  +{total - 9}
                </span>
              )}
            </div>

            {/* Next */}
            <button
              onClick={() => setCur((c) => Math.min(total - 1, c + 1))}
              disabled={cur === total - 1}
              className="w-7 h-7 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-secondary hover:border-border-faint transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
