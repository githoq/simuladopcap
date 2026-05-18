import { shuffle, uuid } from "./utils";
import { DISCIPLINE_ORDER } from "./constants";
import type { Question, ExamQuestion, Exam, ExamConfig } from "../types";

export function generateExam(
  config: ExamConfig,
  questions: Question[],
  usedIds: string[]
): Exam {
  const usedSet = new Set(usedIds);
  const selected: ExamQuestion[] = [];
  const warnings: Exam["warnings"] = [];

  DISCIPLINE_ORDER.forEach((disc) => {
    const requested = config.disciplineConfig[disc] ?? 0;
    if (requested <= 0) return;
    const available = questions.filter(
      (q) => q.disciplina === disc && !usedSet.has(q.id)
    );
    const shuffled = shuffle(available);
    const picked = shuffled.slice(0, requested);
    if (picked.length < requested) {
      warnings.push({ disc, requested, available: picked.length });
    }
    selected.push(...picked.map((q) => ({ ...q, numero_simulado: 0 })));
  });

  const numbered = selected.map((q, i) => ({ ...q, numero_simulado: i + 1 }));

  return {
    id: uuid(),
    config,
    mode: config.mode,
    questions: numbered,
    answers: {},
    startTime: Date.now(),
    timeLimit: config.timeMinutes * 60,
    warnings,
  };
}

export function calcResults(exam: Exam) {
  const stats: Record<string, { correct: number; wrong: number; total: number; unanswered: number }> = {};

  exam.questions.forEach((q) => {
    if (!stats[q.disciplina]) {
      stats[q.disciplina] = { correct: 0, wrong: 0, total: 0, unanswered: 0 };
    }
    const s = stats[q.disciplina];
    s.total++;
    const ua = exam.answers[q.numero_simulado];
    if (ua === undefined || ua === null) {
      s.unanswered++;
    } else if (ua === q.correta) {
      s.correct++;
    } else {
      s.wrong++;
    }
  });

  const total = exam.questions.length;
  const score = Object.values(stats).reduce((a, s) => a + s.correct, 0);
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const timeSpent = Math.floor((Date.now() - exam.startTime) / 1000);

  return {
    examId: exam.id,
    date: Date.now(),
    mode: exam.mode,
    score,
    total,
    percent,
    timeSpent,
    answers: exam.answers,
    questions: exam.questions,
    disciplineStats: stats,
  };
}
