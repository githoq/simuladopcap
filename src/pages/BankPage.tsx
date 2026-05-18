import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Filter, BookOpen } from "lucide-react";
import { fadeUp, timing } from "../lib/motion";
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
    questions.filter((q) => {
      if (fDisc !== "all" && q.disciplina !== fDisc) return false;
      if (fUsed === "used" && !usedIds.includes(q.id)) return false;
      if (fUsed === "unused" && usedIds.includes(q.id)) return false;
      if (search && !q.pergunta?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [questions, fDisc, fUsed, search, usedIds]
  );

  return (
    <motion.div {...fadeUp} transition={timing.smooth}
      className="max-w-3xl mx-auto px-4 pb-24 pt-6 md:pb-8 md:pt-20 space-y-4"
    >
      <div>
        <h1 className="text-2xl font-display font-semibold text-text-primary tracking-tight">Banco de Questões</h1>
        <p className="text-text-secondary text-sm mt-1">{questions.length} questões disponíveis</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar questões..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm placeholder-text-tertiary focus:outline-none focus:border-border-gold transition-colors"
          />
        </div>
        <select
          value={fDisc}
          onChange={(e) => setFDisc(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary text-sm focus:outline-none focus:border-border-gold transition-colors"
        >
          <option value="all">Todas as disciplinas</option>
          {DISCIPLINE_ORDER.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={fUsed}
          onChange={(e) => setFUsed(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary text-sm focus:outline-none focus:border-border-gold transition-colors"
        >
          <option value="all">Todas</option>
          <option value="unused">Não usadas</option>
          <option value="used">Já usadas</option>
        </select>
      </div>

      <p className="text-xs text-text-tertiary">{filtered.length} questões encontradas</p>

      {/* Question list */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((q) => {
          const isExp = expanded === q.id;
          const isUsed = usedIds.includes(q.id);
          return (
            <motion.div
              key={q.id}
              layout
              className={cn(
                "rounded-2xl border overflow-hidden transition-all cursor-pointer",
                isExp ? "border-border-gold/40" : "border-border-subtle hover:border-border-faint",
                "bg-bg-elevated"
              )}
              onClick={() => setExpanded(isExp ? null : q.id)}
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${isUsed ? "bg-text-tertiary" : "bg-gold"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs text-text-tertiary">{q.disciplina}</span>
                    {q.ano && <span className="text-xs text-text-tertiary">· {q.ano}</span>}
                  </div>
                  <div
                    className="text-sm text-text-secondary line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(q.pergunta) }}
                  />
                </div>
                <BookOpen className={cn("w-3.5 h-3.5 shrink-0 mt-1", isExp ? "text-gold" : "text-text-tertiary")} />
              </div>

              {isExp && (
                <div className="border-t border-border-subtle/60 px-4 py-4 space-y-2">
                  {q.alternativas.map((alt, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2.5 py-2 px-3 rounded-lg text-sm",
                        i === q.correta ? "bg-correct-bg text-correct-DEFAULT" : "text-text-secondary"
                      )}
                    >
                      <span className="font-bold shrink-0">{String.fromCharCode(65 + i)}</span>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(alt) }} />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        {filtered.length > 50 && (
          <p className="text-xs text-text-tertiary text-center py-2">Mostrando 50 de {filtered.length}. Use os filtros para refinar.</p>
        )}
      </div>
    </motion.div>
  );
}
