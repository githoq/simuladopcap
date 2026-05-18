import { useState, useCallback } from "react";
import { store } from "../lib/utils";
import { SK } from "../lib/constants";
import type { ProgressEntry, ExamResult } from "../types";

export function useProgress() {
  const [history, setHistory] = useState<ProgressEntry[]>(() =>
    store.load<ProgressEntry[]>(SK.HIST, [])
  );
  const [usedIds, setUsedIds] = useState<string[]>(() =>
    store.load<string[]>(SK.USED, [])
  );

  const addResult = useCallback((result: ExamResult) => {
    // Add to history
    const entry: ProgressEntry = {
      id: result.examId,
      date: result.date,
      mode: result.mode,
      score: result.score,
      total: result.total,
      percent: result.percent,
      timeSpent: result.timeSpent,
      disciplineStats: result.disciplineStats,
    };
    setHistory((h) => {
      const next = [entry, ...h].slice(0, 200);
      store.save(SK.HIST, next);
      return next;
    });

    // Mark questions as used
    if (result.mode === "prova") {
      const newIds = result.questions.map((q) => q.id);
      setUsedIds((ids) => {
        const next = [...new Set([...ids, ...newIds])];
        store.save(SK.USED, next);
        return next;
      });
    }
  }, []);

  const resetHistory = useCallback(() => {
    store.del(SK.HIST);
    store.del(SK.USED);
    setHistory([]);
    setUsedIds([]);
  }, []);

  const streak = (() => {
    if (!history.length) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    let day = today.getTime();
    const byDay = new Map<number, boolean>();
    history.forEach((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      byDay.set(d.getTime(), true);
    });
    while (byDay.has(day)) {
      count++;
      day -= 86400000;
    }
    return count;
  })();

  return { history, usedIds, addResult, resetHistory, streak };
}
