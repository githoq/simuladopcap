/**
 * QuestionCard — FCC institutional exam rendering.
 *
 * Calibrated against real FCC printed exam booklets.
 * Compact, dense, academic — not a SaaS card.
 *
 * Spacing:
 *   - Card padding:  px-4 py-3 (was px-5 py-4)
 *   - Header:        px-4 py-2.5
 *   - Alt gap:       gap-y-1 (was space-y-1.5)
 *   - Body gap:      space-y-3 (was space-y-4)
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, ChevronLeft, ChevronRight, Eye, EyeOff, ExternalLink } from "lucide-react";
import { ApoioBlock } from "./ApoioBlock";
import { AlternativeRow } from "./AlternativeRow";
import type { AltState } from "./AlternativeRow";
import { Button } from "../ui/Button";
import { getRenderer } from "./FCCRenderer";
import { cn } from "../../lib/utils";
import { DISCIPLINE_ORDER } from "../../lib/constants";
import type { ExamQuestion } from "../../types";

interface QuestionCardProps {
  question:    ExamQuestion;
  numero:      number;
  total:       number;
  userAnswer?: number | null;
  isFlagged?:  boolean;
  isTreino?:   boolean;
  showResult?: boolean;
  onAnswer?:   (numero: number, idx: number) => void;
  onFlag?:     (numero: number) => void;
  onNext?:     () => void;
  onPrev?:     () => void;
  onSkip?:     () => void;
}

export function QuestionCard({
  question, numero, total, userAnswer, isFlagged = false,
  isTreino = false, showResult = false,
  onAnswer, onFlag, onNext, onPrev, onSkip,
}: QuestionCardProps) {
  const [localAnswer, setLocalAnswer] = useState<number | null>(
    userAnswer !== undefined ? (userAnswer ?? null) : null
  );
  const [showExplanation, setShowExplanation] = useState(false);

  const answered = localAnswer !== null;
  const isLast   = numero === total;
  const renderer = getRenderer(question.banca);


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
      // ── Restrained entry — no blur, no exaggerated Y ──────────────
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -6 }}
      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      <div className="rounded-sm border border-white/[0.02] bg-white/[0.006] overflow-hidden">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            {/* Question counter only — no metadata */}
            <span className="text-[10px] text-text-muted font-mono font-sans tabular-nums">
              {String(numero).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onFlag && (
              <button
                onClick={() => onFlag(question.numero_simulado)}
                className={cn(
                  "w-5 h-5 flex items-center justify-center rounded",
                  "transition-colors duration-150",
                  isFlagged
                    ? "text-gold"
                    : "text-text-muted hover:text-text-secondary"
                )}
              >
                <Flag className="w-3 h-3" fill={isFlagged ? "currentColor" : "none"} />
              </button>
            )}
          </div>
        </div>

        {/* ── Body — compact institutional spacing ──────────────────── */}
        <div className="px-4 py-2 space-y-2">

          {question.texto_apoio && (
            <ApoioBlock question={question} />
          )}

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

          {/* Question stem — institutional serif */}
          <div>{renderer.renderPergunta(question.pergunta)}</div>

          {/* Alternatives — compact gap */}
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

        {/* ── Footer ───────────────────────────────────────────────── */}
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
                onClick={() => setShowExplanation((v) => !v)}
                icon={showExplanation
                  ? <EyeOff className="w-3 h-3" />
                  : <Eye className="w-3 h-3" />
                }
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

        {/* ── Link TecConcursos — extremamente discreto ─────────────── */}
        {question.linkTec && (
          <div className="flex justify-end px-4 pb-2">
            <a
              href={question.linkTec}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] text-white/[0.28] hover:text-white/[0.55] transition-colors duration-150 font-sans select-none"
            >
              <ExternalLink className="w-2.5 h-2.5" aria-hidden />
              <span>Ver questão original</span>
            </a>
          </div>
        )}
      </div>

      {/* ── Explanation ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.20, ease: [0.4, 0, 0.2, 1] }}
            className="mt-1.5 overflow-hidden"
          >
            <div className="rounded border border-white/[0.07] bg-white/[0.025] px-3 py-2">
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-1 font-sans">
                Gabarito
              </p>
              <p className="text-sm font-sans">
                <strong className="font-semibold text-text-secondary">
                  {String.fromCharCode(65 + question.correta)}
                </strong>
                {" — "}
                <span className="fcc-alt-text text-text-primary"
                  dangerouslySetInnerHTML={{
                    __html: question.alternativas[question.correta] ?? "",
                  }}
                />
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
