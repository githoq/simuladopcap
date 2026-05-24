/**
 * BankPage — Premium question bank browser.
 */
import { useState, useMemo, type ChangeEvent, type FocusEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, X, Database } from "lucide-react";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { StaggerList, StaggerItem } from "../components/motion/StaggerList";
import { sanitizeHTML } from "../lib/sanitize";
import { DISCIPLINE_ORDER } from "../lib/constants";
import { cn } from "../lib/utils";
import type { Question } from "../types";

interface BankPageProps {
  questions: Question[];
  usedIds: string[];
}

export default function BankPage({ questions, usedIds }: BankPageProps) {
  const [search, setSearch] = useState("");
  const [fDisc, setFDisc] = useState("all");
  const [fUsed, setFUsed] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() =>
    questions.filter((q: Question) => {
      if (fDisc !== "all" && q.disciplina !== fDisc) return false;
      if (fUsed === "used" && !usedIds.includes(q.id)) return false;
      if (fUsed === "unused" && usedIds.includes(q.id)) return false;
      if (search && !q.pergunta?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [questions, fDisc, fUsed, search, usedIds]
  );

  return (
    <div className="min-h-screen relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="workspace" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pb-24 pt-24 md:pb-12">
        <StaggerList className="space-y-5">

          <StaggerItem>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mb-1.5">
              Catálogo
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-semibold tracking-tightest text-gradient-muted">
              Banco de Questões
            </h1>
            <p className="text-text-tertiary text-sm mt-1.5 font-sans tracking-tight">
              {questions.length} questões FCC originais · {usedIds.length} já estudadas
            </p>
          </StaggerItem>

          {/* Filters */}
          <StaggerItem>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                <input
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  placeholder="Buscar questões..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl text-text-primary text-sm placeholder-text-tertiary font-sans tracking-tight transition-all duration-200"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onFocus={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.border = "1px solid rgba(200,167,93,0.40)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(200,167,93,0.10)"; }}
                  onBlur={(e: FocusEvent<HTMLInputElement>) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-text-muted hover:bg-white/[0.06] hover:text-text-primary transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <SelectField value={fDisc} onChange={setFDisc} options={[
                { v: "all", l: "Todas as disciplinas" },
                ...DISCIPLINE_ORDER.map((d) => ({ v: d, l: d })),
              ]} />
              <SelectField value={fUsed} onChange={setFUsed} options={[
                { v: "all", l: "Todas" },
                { v: "unused", l: "Não usadas" },
                { v: "used", l: "Já usadas" },
              ]} />
            </div>
          </StaggerItem>

          <StaggerItem>
            <p className="text-xs text-text-tertiary font-sans tabular-nums tracking-tight">
              {filtered.length} questões encontradas
            </p>
          </StaggerItem>

          {/* Question list */}
          <StaggerItem>
            <div className="space-y-2">
              {filtered.slice(0, 50).map((q: Question, i: number) => {
                const isExp = expanded === q.id;
                const isUsed = usedIds.includes(q.id);
                return (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.4) }}
                    onClick={() => setExpanded(isExp ? null : q.id)}
                    className={cn(
                      "rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
                      isExp ? "border-gradient-gold" : "hover:bg-white/[0.015]"
                    )}
                    style={{
                      background: isExp
                        ? "linear-gradient(180deg, rgba(200,167,93,0.04) 0%, rgba(255,255,255,0.005) 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                      border: isExp ? "1px solid rgba(200,167,93,0.30)" : "1px solid rgba(255,255,255,0.06)",
                      boxShadow: isExp ? "0 0 24px -8px rgba(200,167,93,0.25)" : "none",
                    }}
                  >
                    <div className="flex items-start gap-3 px-4 py-3.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{
                          background: isUsed ? "rgba(255,255,255,0.25)" : "#c8a75d",
                          boxShadow: isUsed ? "none" : "0 0 6px rgba(200,167,93,0.5)",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] text-text-tertiary font-sans tracking-tight font-medium">{q.disciplina}</span>
                          {q.ano && <span className="text-[10px] text-text-muted font-sans">· {q.ano}</span>}
                          {isUsed && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-sans font-medium text-text-muted"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}>
                              usada
                            </span>
                          )}
                        </div>
                        <div
                          className="text-sm text-text-secondary line-clamp-2 fcc-pergunta"
                          style={{ fontSize: "13px", lineHeight: 1.55 }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHTML(q.pergunta) }}
                        />
                      </div>
                      <motion.div
                        animate={{ rotate: isExp ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0 mt-1"
                      >
                        <ChevronDown className={cn("w-3.5 h-3.5", isExp ? "text-gold" : "text-text-muted")} />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExp && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/[0.04] px-4 py-4 space-y-1.5">
                            {q.alternativas.map((alt: string, i: number) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-start gap-2.5 py-1.5 px-3 rounded-lg text-sm",
                                  i === q.correta
                                    ? "bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.20)]"
                                    : ""
                                )}
                              >
                                <span
                                  className={cn(
                                    "shrink-0 w-5 h-5 rounded text-[11px] font-semibold font-sans flex items-center justify-center mt-0.5",
                                    i === q.correta
                                      ? "bg-[#22c55e]/20 text-[#22c55e]"
                                      : "bg-white/[0.04] text-text-muted"
                                  )}
                                >
                                  {String.fromCharCode(65 + i)}
                                </span>
                                <span
                                  className={cn(
                                    "fcc-alt-text flex-1",
                                    i === q.correta ? "text-[#86efac]" : "text-text-secondary"
                                  )}
                                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(alt) }}
                                />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              {filtered.length > 50 && (
                <p className="text-xs text-text-tertiary text-center py-3 font-sans">
                  Mostrando 50 de {filtered.length}. Use os filtros para refinar.
                </p>
              )}
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <Database className="w-8 h-8 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-tertiary font-sans">Nenhuma questão encontrada com esses filtros.</p>
                </div>
              )}
            </div>
          </StaggerItem>
        </StaggerList>
      </div>
    </div>
  );
}

function SelectField({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className="appearance-none pl-3.5 pr-9 py-2.5 rounded-xl text-text-secondary text-sm font-sans tracking-tight cursor-pointer transition-all duration-200 w-full sm:w-auto"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {options.map((o) => (
          <option key={o.v} value={o.v} style={{ background: "#0F141B" }}>{o.l}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
    </div>
  );
}
