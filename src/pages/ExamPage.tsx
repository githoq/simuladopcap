import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, Flag, CheckSquare, AlertCircle } from "lucide-react";
import { QuestionCard } from "../components/question/QuestionCard";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { cn, fmtTime } from "../lib/utils";
import { calcResults } from "../lib/exam";
import type { Exam, ExamResult } from "../types";

interface ExamPageProps {
  exam: Exam | null;
  onFinish: (result: ExamResult) => void;
}

export default function ExamPage({ exam, onFinish }: ExamPageProps) {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | null>>(exam?.answers ?? {});
  const [flagged, setFlagged] = useState(new Set<number>());
  const [tLeft, setTLeft] = useState(exam?.timeLimit ?? 0);
  const [showNav, setShowNav] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!exam || exam.mode === "treino") return;
    timerRef.current = setInterval(() => {
      setTLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleFinish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [exam]);

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="w-12 h-12 text-text-tertiary mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">Nenhum simulado ativo</h2>
        <p className="text-text-secondary text-sm mb-6">Configure e inicie um simulado primeiro.</p>
        <Button variant="primary" onClick={() => navigate("/generator")}>Criar simulado</Button>
      </div>
    );
  }

  const q = exam.questions[cur];
  const total = exam.questions.length;
  const answered = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const isTreino = exam.mode === "treino";
  const tcol = tLeft < 300 ? "text-wrong-DEFAULT" : tLeft < 600 ? "text-yellow-400" : "text-correct-DEFAULT";

  const handleAnswer = (num: number, idx: number) => {
    setAnswers((a) => ({ ...a, [num]: idx }));
  };

  const toggleFlag = (num: number) => {
    setFlagged((f) => {
      const n = new Set(f);
      n.has(num) ? n.delete(num) : n.add(num);
      return n;
    });
  };

  const handleFinish = useCallback(() => {
    clearInterval(timerRef.current!);
    setIsFinishing(true);          // ← desabilita toda interação imediatamente
    setShowNav(false);             // ← fecha o nav panel
    const result = calcResults({ ...exam, answers });
    onFinish(result);
    navigate("/results");
  }, [exam, answers, onFinish, navigate]);

  return (
    <div className={cn("min-h-screen bg-bg-base", isFinishing && "pointer-events-none")}>
      {/* Sticky header — sem backdrop-blur para evitar residual no unmount */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-bg-base border-b border-border-subtle/60">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Progress */}
          <div className="flex-1">
            <ProgressBar value={answered} max={total} height="xs" />
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-tertiary">{answered}/{total} respondidas</span>
              <span className="text-[10px] text-text-tertiary">{total - answered} restantes</span>
            </div>
          </div>

          {/* Timer */}
          {!isTreino && (
            <div className={cn("flex items-center gap-1.5 font-mono text-sm font-medium tabular-nums", tcol)}>
              <Clock className="w-3.5 h-3.5" />
              {fmtTime(tLeft)}
            </div>
          )}

          {/* Nav toggle */}
          <button
            onClick={() => setShowNav((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Questões</span>
          </button>

          {/* Finish */}
          <Button
            variant="gold"
            size="sm"
            onClick={() => {
              if (answered < total && !confirm(`Ainda há ${total - answered} questão(ões) sem resposta. Finalizar mesmo assim?`)) return;
              handleFinish();
            }}
          >
            Finalizar
          </Button>
        </div>
      </div>

      {/* Question nav panel */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-0 right-0 z-20 bg-bg-overlay border-b border-border-subtle shadow-elevated"
          >
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {exam.questions.map((qq, i) => {
                  const ua = answers[qq.numero_simulado];
                  const ans = ua !== undefined && ua !== null;
                  const flag = flagged.has(qq.numero_simulado);
                  return (
                    <button
                      key={i}
                      onClick={() => { setCur(i); setShowNav(false); }}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all",
                        i === cur ? "bg-gold text-bg-base" :
                        flag ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                        ans ? "bg-correct-DEFAULT/15 text-correct-DEFAULT border border-correct-DEFAULT/20" :
                        "bg-bg-elevated text-text-tertiary hover:bg-bg-overlay hover:text-text-secondary border border-border-subtle"
                      )}
                    >
                      {qq.numero_simulado}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-8">
        <AnimatePresence mode="wait">
          <QuestionCard
            key={q.id + cur}
            question={q}
            numero={cur + 1}
            total={total}
            userAnswer={answers[q.numero_simulado] ?? null}
            isFlagged={flagged.has(q.numero_simulado)}
            isTreino={isTreino}
            isExam={true}
            showResult={false}
            onAnswer={handleAnswer}
            onFlag={toggleFlag}
            onPrev={cur > 0 ? () => setCur((c) => c - 1) : undefined}
            onNext={cur < total - 1 ? () => setCur((c) => c + 1) : undefined}
            onSkip={cur < total - 1 ? () => setCur((c) => c + 1) : undefined}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
