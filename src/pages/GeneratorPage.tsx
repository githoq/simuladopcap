import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layers, Play, Info } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { fadeUp, timing } from "../lib/motion";
import { generateExam } from "../lib/exam";
import { DISCIPLINE_ORDER, DISC_COLORS } from "../lib/constants";
import { cn } from "../lib/utils";
import type { Question, Exam } from "../types";

interface GeneratorPageProps {
  questions: Question[];
  usedIds: string[];
  onStartExam: (exam: Exam) => void;
}

export default function GeneratorPage({ questions, usedIds, onStartExam }: GeneratorPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"prova" | "treino">("prova");
  const [time, setTime] = useState(120);
  const [cfg, setCfg] = useState<Record<string, number>>(
    Object.fromEntries(DISCIPLINE_ORDER.map((d) => [d, 0]))
  );

  const avail = useMemo(() => {
    const r: Record<string, number> = {};
    DISCIPLINE_ORDER.forEach((d) => {
      r[d] = questions.filter((q) => q.disciplina === d && !usedIds.includes(q.id)).length;
    });
    return r;
  }, [questions, usedIds]);

  const allAvail = useMemo(() => {
    const r: Record<string, number> = {};
    DISCIPLINE_ORDER.forEach((d) => {
      r[d] = questions.filter((q) => q.disciplina === d).length;
    });
    return r;
  }, [questions]);

  const total = Object.values(cfg).reduce((a, b) => a + b, 0);

  const setDisc = (d: string, v: number) =>
    setCfg((p) => ({ ...p, [d]: Math.max(0, Math.min(avail[d] ?? 0, v)) }));

  const handleStart = () => {
    if (total === 0) return;
    const exam = generateExam({ disciplineConfig: cfg, mode, timeMinutes: time }, questions, usedIds);
    if (exam.warnings?.length) {
      const msg = exam.warnings.map((w) => `${w.disc}: ${w.available}/${w.requested}`).join("\n");
      if (!confirm(`Questões insuficientes:\n${msg}\n\nContinuar?`)) return;
    }
    onStartExam(exam);
    navigate("/ready");
  };

  return (
    <motion.div
      {...fadeUp}
      transition={timing.smooth}
      className="max-w-2xl mx-auto px-4 pb-24 pt-6 md:pb-8 md:pt-20 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">
          Configurar Simulado
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Escolha as disciplinas e configure a prova.
        </p>
      </div>

      {/* Mode */}
      <div className="rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle/60">
          <h2 className="text-sm font-semibold text-text-primary">Modo</h2>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {(["prova", "treino"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "py-4 px-4 rounded-xl border text-sm font-medium transition-all",
                mode === m
                  ? "bg-gold-subtle border-border-gold text-gold"
                  : "border-border-subtle text-text-secondary hover:border-border-gold/40 hover:text-text-primary"
              )}
            >
              <div className="font-semibold capitalize">{m === "prova" ? "Prova cronometrada" : "Modo treino"}</div>
              <div className="text-xs mt-1 opacity-70">
                {m === "prova" ? "Com limite de tempo" : "Ver resposta ao responder"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time (prova mode) */}
      {mode === "prova" && (
        <div className="rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden">
          <div className="px-5 py-4 border-b border-border-subtle/60">
            <h2 className="text-sm font-semibold text-text-primary">Tempo limite</h2>
          </div>
          <div className="p-4 flex items-center gap-3">
            {[60, 90, 120, 180, 240].map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-mono font-medium border transition-all",
                  time === t
                    ? "bg-gold-subtle border-border-gold text-gold"
                    : "border-border-subtle text-text-secondary hover:border-border-faint hover:text-text-primary"
                )}
              >
                {t < 60 ? `${t}m` : `${t / 60}h`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disciplines */}
      <div className="rounded-2xl bg-bg-elevated border border-border-subtle overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle/60">
          <h2 className="text-sm font-semibold text-text-primary">Disciplinas</h2>
          <Badge variant="gold" size="sm">{total} questões</Badge>
        </div>
        <div className="divide-y divide-border-subtle/40">
          {DISCIPLINE_ORDER.map((disc, i) => {
            const color = DISC_COLORS[i];
            const val = cfg[disc] ?? 0;
            const max = avail[disc] ?? 0;
            const allMax = allAvail[disc] ?? 0;
            return (
              <div key={disc} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{disc}</div>
                  <div className="text-xs text-text-tertiary">{max} disponíveis / {allMax} total</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setDisc(disc, val - 1)}
                    className="w-7 h-7 rounded-lg bg-bg-overlay border border-border-subtle text-text-secondary hover:border-border-gold/40 hover:text-gold transition-all text-lg leading-none flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-mono text-sm font-semibold text-text-primary tabular-nums">
                    {val}
                  </span>
                  <button
                    onClick={() => setDisc(disc, val + 1)}
                    disabled={val >= max}
                    className="w-7 h-7 rounded-lg bg-bg-overlay border border-border-subtle text-text-secondary hover:border-border-gold/40 hover:text-gold transition-all text-lg leading-none flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          className="flex-1"
          onClick={() => setCfg(Object.fromEntries(DISCIPLINE_ORDER.map((d) => [d, 0])))}
        >
          Limpar
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-2"
          disabled={total === 0}
          icon={<Play className="w-4 h-4" />}
          onClick={handleStart}
        >
          Iniciar com {total} questões
        </Button>
      </div>
    </motion.div>
  );
}
