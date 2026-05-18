import { useState, useEffect, useCallback } from "react";
import type { Question, DBInfo } from "../types";
import { BLOCO_FILES } from "../lib/constants";

interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  progress: number;
  error: string | null;
  dbInfo: DBInfo | null;
  reload: () => void;
}

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dbInfo, setDbInfo] = useState<DBInfo | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const all: Question[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < BLOCO_FILES.length; i++) {
        try {
          const res = await fetch(BLOCO_FILES[i]);
          if (!res.ok) continue;
          const data: Question[] = await res.json();
          data.forEach((q) => {
            if (q.id && !seen.has(q.id)) {
              seen.add(q.id);
              all.push(q);
            }
          });
        } catch {}
        setProgress(Math.round(((i + 1) / BLOCO_FILES.length) * 100));
      }

      const valid = all.filter(
        (q) =>
          q.disciplina &&
          q.pergunta &&
          Array.isArray(q.alternativas) &&
          q.alternativas.length >= 2
      );

      const disciplines: Record<string, number> = {};
      valid.forEach((q) => {
        disciplines[q.disciplina] = (disciplines[q.disciplina] ?? 0) + 1;
      });

      setQuestions(valid);
      setDbInfo({ total: valid.length, disciplines, lastUpdated: Date.now() });
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { questions, loading, progress, error, dbInfo, reload: load };
}
