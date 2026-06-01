/**
 * QuestionCard — FCC institutional exam rendering.
 * Compact, academic. Shows discipline chip in header for context.
 */

import { useState, useCallback, memo, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, ChevronLeft, ChevronRight, Eye, EyeOff, ExternalLink } from "lucide-react";
import { ApoioBlock } from "./ApoioBlock";
import { AlternativeRow } from "./AlternativeRow";
import type { AltState } from "./AlternativeRow";
import { Button } from "../ui/Button";
import { sanitizeHTML } from "../../lib/sanitize";
import { getRenderer } from "./FCCRenderer";
import { cn } from "../../lib/utils";
import { DISCIPLINE_ORDER, DISC_COLORS, DISC_SHORT } from "../../lib/constants";
import type { ExamQuestion } from "../../types";

export interface QuestionCardProps {
  question:    ExamQuestion;
  numero:      number;
  total:       number;
  userAnswer?: number | null;
  isFlagged?:  boolean;
  isTreino?:   boolean;
  isExam?:     boolean;
  showResult?: boolean;
  onAnswer?:   (numero: number, idx: number) => void;
  onFlag?:     (numero: number) => void;
  onNext?:     () => void;
  onPrev?:     () => void;
  onSkip?:     () => void;
}

// Resolve discipline color + short label
function getDiscInfo(disciplina: string) {
  const idx = DISCIPLINE_ORDER.indexOf(disciplina as typeof DISCIPLINE_ORDER[number]);
  if (idx < 0) return { color: "#6B7280", label: disciplina.split(" ").slice(-1)[0] };
  return { color: DISC_COLORS[idx], label: DISC_SHORT[idx] };
}

export const QuestionCard = memo(function QuestionCard({
  question, numero, total, userAnswer, isFlagged = false,
  isTreino = false, isExam = false, showResult = false,
  onAnswer, onFlag, onNext, onPrev, onSkip,
}: QuestionCardProps) {
  const [localAnswer, setLocalAnswer] = useState<number | null>(
    userAnswer !== undefined ? (userAnswer ?? null) : null
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const answered = localAnswer !== null;
  const isLast   = numero === total;
  const renderer = getRenderer(question.banca);
  const disc     = getDiscInfo(question.disciplina);

  const handleAnswer = useCallback((idx: number) => {
    if (answered && !isTreino) return;
    setLocalAnswer(idx);
    onAnswer?.(question.numero_simulado, idx);
  }, [answered, isTreino, onAnswer, question.numero_simulado]);

  const getAltState = (idx: number): AltState => {
    if (showResult || (isTreino && answered)) {
      if (idx === question.correta) return "correct";
      if (idx === localAnswer && idx !== question.correta) return "wrong";
      return "idle";
    }
    return idx === localAnswer ? "selected" : "idle";
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px -6px rgba(0,0,0,0.4)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            {/* Question counter */}
            <span className="text-[10px] text-text-muted font-mono tabular-nums">
              {String(numero).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
            {/* Discipline chip */}
            <span
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold uppercase tracking-wide"
              style={{
                color: disc.color,
                background: `${disc.color}18`,
                border: `1px solid ${disc.color}30`,
              }}
            >
              {disc.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onFlag && (
              <button
                onClick={() => onFlag(question.numero_simulado)}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded transition-colors duration-150",
                  isFlagged ? "text-gold" : "text-text-muted hover:text-text-secondary"
                )}
              >
                <Flag className="w-3 h-3" fill={isFlagged ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <div className="px-4 py-3 space-y-2">
          {question.texto_apoio && <ApoioBlock question={question} isExam={isExam} />}

          {question.imagem && (
            <div className="rounded border border-border-subtle overflow-hidden">
              <img
                src={question.imagem}
                alt="Imagem da questão"
                className="w-full max-h-64 object-contain bg-bg-surface"
                loading="lazy"
              />
            </div>
          )}

          <div>{renderer.renderPergunta(question.pergunta)}</div>

          <div className="flex flex-col gap-y-1 pt-0.5">
            {question.alternativas.map((alt, idx) => (
              <AlternativeRow
                key={idx}
                index={idx}
                content={alt}
                state={getAltState(idx)}
                disabled={answered && !isTreino}
                onClick={() => handleAnswer(idx)}
                isCorrect={idx === question.correta}
                banca={question.banca}
              />
            ))}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05]">
          <div className="flex items-center gap-1">
            {onPrev && (
              <Button variant="ghost" size="sm" onClick={onPrev} disabled={numero === 1}
                icon={<ChevronLeft className="w-3 h-3" />}
              >
                <span className="hidden sm:inline text-xs">Anterior</span>
              </Button>
            )}
            {onSkip && (
              <Button variant="ghost" size="sm" onClick={onSkip}>
                <span className="text-xs">Pular</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {(showResult || (isTreino && answered)) && (
              <Button
                variant="ghost" size="sm"
                onClick={() => setShowExplanation((v: boolean) => !v)}
                icon={showExplanation ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              >
                <span className="hidden sm:inline text-xs">Gabarito</span>
              </Button>
            )}
            {onNext && (
              <Button
                variant={answered ? "primary" : "secondary"}
                size="sm"
                onClick={onNext}
                iconRight={!isLast ? <ChevronRight className="w-3 h-3" /> : undefined}
              >
                <span className="text-xs">{isLast ? "Finalizar" : "Próxima"}</span>
              </Button>
            )}
          </div>
        </div>

        {question.linkTec && (
          <div className="flex justify-end px-4 pb-2">
            <a
              href={question.linkTec}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e: MouseEvent) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-white/[0.22] hover:text-white/[0.5] transition-colors duration-150 font-sans"
            >
              <ExternalLink className="w-2.5 h-2.5" aria-hidden />
              <span>Ver questão original</span>
            </a>
          </div>
        )}
      </div>

      {/* ── Gabarito expandido ─────────────────────────────────────── */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="mt-1.5 overflow-hidden"
          >
            <div className="rounded border border-emerald-500/20 bg-emerald-500/[0.04] px-3 py-2">
              <p className="text-[10px] font-medium text-emerald-400/70 uppercase tracking-wide mb-1 font-sans">
                Gabarito
              </p>
              <p className="text-sm font-sans">
                <strong className="font-semibold text-emerald-300">
                  {String.fromCharCode(65 + question.correta)}
                </strong>
                {" — "}
                <span className="fcc-alt-text text-text-primary"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(question.alternativas[question.correta] ?? ""),
                  }}
                />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
