/**
 * GeneratorPage — Premium configurator.
 * Sticky CTA bar, refined steppers, gold-accent mode selector.
 */
import { useState, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Minus, Plus, Trash2, Timer, Settings2, BookOpen } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { generateExam } from "../lib/exam";
import { DISCIPLINE_ORDER, DISC_COLORS, DISC_SHORT } from "../lib/constants";
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

  const usedSet = useMemo(() => new Set(usedIds), [usedIds]);

  const avail = useMemo(() => {
    const r: Record<string, number> = {};
    DISCIPLINE_ORDER.forEach((d) => {
      r[d] = questions.filter((q) => q.disciplina === d && !usedSet.has(q.id)).length;
    });
    return r;
  }, [questions, usedSet]);

  const allAvail = useMemo(() => {
    const r: Record<string, number> = {};
    DISCIPLINE_ORDER.forEach((d) => {
      r[d] = questions.filter((q) => q.disciplina === d).length;
    });
    return r;
  }, [questions]);

  const total: number = (Object.values(cfg) as number[]).reduce((a, b) => a + b, 0);

  const setDisc = (d: string, v: number) =>
    setCfg((p: Record<string, number>) => ({ ...p, [d]: Math.max(0, Math.min(avail[d] ?? 0, v)) }));

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
    <div className="min-h-screen relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="workspace" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-36 pt-24 md:pb-24">
        <StaggerList className="space-y-6">

          {/* Header */}
          <StaggerItem>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mb-1.5">
              Configurador
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tightest text-gradient-muted">
              Configurar simulado
            </h1>
            <p className="text-text-tertiary text-sm mt-2 font-sans tracking-tight max-w-md">
              Escolha o modo, defina o tempo e selecione as disciplinas para gerar uma prova personalizada.
            </p>
          </StaggerItem>

          {/* Mode selector */}
          <StaggerItem>
            <Section icon={Settings2} title="Modo de execução">
              <div className="grid grid-cols-2 gap-2 p-3">
                {(["prova", "treino"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "group relative overflow-hidden p-4 rounded-xl text-left transition-all duration-300",
                      mode === m ? "" : "hover:bg-white/[0.02]"
                    )}
                    style={
                      mode === m
                        ? {
                            background: "linear-gradient(180deg, rgba(200,167,93,0.12) 0%, rgba(200,167,93,0.02) 100%)",
                            border: "1px solid rgba(200,167,93,0.30)",
                            boxShadow: "inset 0 1px 0 rgba(200,167,93,0.10), 0 0 20px -6px rgba(200,167,93,0.25)",
                          }
                        : {
                            background: "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn("w-1.5 h-1.5 rounded-full", mode === m ? "bg-gold shadow-[0_0_8px_rgba(200,167,93,0.6)]" : "bg-white/20")} />
                      <div className={cn(
                        "font-semibold text-sm font-sans tracking-tight",
                        mode === m ? "text-gold" : "text-text-primary"
                      )}>
                        {m === "prova" ? "Prova cronometrada" : "Modo treino"}
                      </div>
                    </div>
                    <div className="text-xs font-sans text-text-tertiary">
                      {m === "prova" ? "Com limite de tempo · sem feedback imediato" : "Sem cronômetro · feedback ao responder"}
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          </StaggerItem>

          {/* Time selector (only for prova mode) */}
          {mode === "prova" && (
            <StaggerItem>
              <Section icon={Timer} title="Tempo limite">
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {[60, 90, 120, 180, 240].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTime(t)}
                      className={cn(
                        "flex-1 min-w-[68px] py-3 px-3 rounded-xl text-sm font-mono font-medium transition-all duration-200 tabular-nums",
                        time === t ? "" : "hover:bg-white/[0.02]"
                      )}
                      style={
                        time === t
                          ? {
                              background: "linear-gradient(180deg, rgba(200,167,93,0.14) 0%, rgba(200,167,93,0.02) 100%)",
                              border: "1px solid rgba(200,167,93,0.30)",
                              color: "#e4cc95",
                              boxShadow: "inset 0 1px 0 rgba(200,167,93,0.12)",
                            }
                          : {
                              background: "rgba(255,255,255,0.015)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.6)",
                            }
                      }
                    >
                      {t < 60 ? `${t}m` : `${t / 60}h`}
                    </button>
                  ))}
                </div>
              </Section>
            </StaggerItem>
          )}

          {/* Disciplines */}
          <StaggerItem>
            <Section icon={BookOpen} title="Disciplinas" trailing={
              <Badge variant={total > 0 ? "gold" : "neutral"} size="sm">
                {total} {total === 1 ? "questão" : "questões"}
              </Badge>
            }>
              <div>
                {DISCIPLINE_ORDER.map((disc, i) => {
                  const color = DISC_COLORS[i];
                  const shortLabel = DISC_SHORT[i];
                  const val = cfg[disc] ?? 0;
                  const max = avail[disc] ?? 0;
                  const allMax = allAvail[disc] ?? 0;
                  const active = val > 0;
                  return (
                    <div
                      key={disc}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 transition-colors duration-150",
                        active && "bg-white/[0.02]"
                      )}
                    >
                      {/* Color dot with glow when active */}
                      <div
                        className="w-2 h-2 rounded-full shrink-0 transition-shadow duration-200"
                        style={{
                          background: color,
                          boxShadow: active ? `0 0 6px ${color}99` : "none",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-sans truncate tracking-tight leading-tight",
                          active ? "text-text-primary" : "text-text-secondary"
                        )}>
                          <span className="hidden sm:inline">{disc}</span>
                          <span className="sm:hidden">{shortLabel}</span>
                        </div>
                        <div className="text-[11px] text-text-tertiary font-sans mt-0.5">
                          {max > 0 ? <><span style={{ color }}>{max}</span> disponíveis</> : <span className="text-rose-400/70">Esgotadas</span>}
                          <span className="text-text-muted"> · {allMax} total</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          onClick={() => setDisc(disc, val - 1)}
                          disabled={val === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-secondary disabled:opacity-25 disabled:cursor-not-allowed enabled:hover:bg-white/[0.07] enabled:hover:text-text-primary transition-colors duration-150"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className={cn(
                          "w-8 text-center font-mono text-sm font-semibold tabular-nums",
                          active ? "text-gold" : "text-text-muted"
                        )}>
                          {val}
                        </span>
                        <button
                          onClick={() => setDisc(disc, val + 1)}
                          disabled={val >= max}
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 disabled:opacity-25 disabled:cursor-not-allowed",
                            "text-text-secondary enabled:hover:bg-white/[0.07] enabled:hover:text-gold"
                          )}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </StaggerItem>

          {/* Spacer for sticky bar */}
          <div className="h-4" />
        </StaggerList>
      </div>

      {/* Sticky CTA Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-0 md:bottom-0 left-0 right-0 z-30 pb-safe"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 64px)" }}
      >
        <div className="md:hidden h-0" />
        <div
          className="mx-3 sm:mx-auto sm:max-w-2xl rounded-2xl p-3 flex items-center gap-3 mb-3"
          style={{
            background: "linear-gradient(180deg, rgba(15,20,27,0.92) 0%, rgba(11,15,20,0.96) 100%)",
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 48px -16px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <Button
            variant="ghost" size="md"
            onClick={() => setCfg(Object.fromEntries(DISCIPLINE_ORDER.map((d) => [d, 0])))}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            disabled={total === 0}
          >
            <span className="hidden sm:inline">Limpar</span>
          </Button>
          <div className="flex-1 text-center px-2">
            {total > 0 ? (
              <div className="text-xs font-sans tracking-tight">
                <span className="text-text-primary font-semibold tabular-nums">{total}</span>
                <span className="text-text-tertiary"> {total === 1 ? "questão selecionada" : "questões selecionadas"}</span>
              </div>
            ) : (
              <div className="text-xs text-text-muted font-sans tracking-tight">Selecione disciplinas para começar</div>
            )}
          </div>
          <Button
            variant="gold" size="lg"
            disabled={total === 0}
            icon={<Play className="w-3.5 h-3.5" />}
            onClick={handleStart}
            className="!h-11"
          >
            Iniciar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Section primitive ──────────────────────────────────────────────── */
function Section({
  title, icon: Icon, trailing, children,
}: { title: string; icon: ReactNode; trailing?: ReactNode; children: ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 16px -6px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
            <Icon className="w-3.5 h-3.5 text-text-secondary" />
          </div>
          <h2 className="text-sm font-semibold text-text-primary font-sans tracking-tight">{title}</h2>
        </div>
        {trailing}
      </div>
      {children}
    </div>
  );
}
