export interface Question {
  id: string;
  cabecalho?: string;
  disciplina: string;
  assunto?: string;
  ano?: number;
  banca?: string;
  cargo?: string;
  dificuldade?: string;
  texto_apoio_titulo?: string;
  texto_apoio?: string;
  pergunta: string;
  alternativas: string[];
  correta: number;
  imagem?: string;
  tags?: string[];
}

export interface ExamConfig {
  disciplineConfig: Record<string, number>;
  mode: "prova" | "treino";
  timeMinutes: number;
}

export interface ExamQuestion extends Question {
  numero_simulado: number;
}

export interface Exam {
  id: string;
  config: ExamConfig;
  mode: "prova" | "treino";
  questions: ExamQuestion[];
  answers: Record<number, number | null>;
  startTime: number;
  timeLimit: number;
  warnings?: Array<{ disc: string; requested: number; available: number }>;
}

export interface DisciplineStat {
  correct: number;
  wrong: number;
  total: number;
  unanswered: number;
}

export interface ExamResult {
  examId: string;
  date: number;
  mode: "prova" | "treino";
  score: number;
  total: number;
  percent: number;
  timeSpent: number;
  answers: Record<number, number | null>;
  questions: ExamQuestion[];
  disciplineStats: Record<string, DisciplineStat>;
}

export interface ProgressEntry {
  id: string;
  date: number;
  mode: "prova" | "treino";
  score: number;
  total: number;
  percent: number;
  timeSpent: number;
  disciplineStats: Record<string, DisciplineStat>;
}

export type ToastType = "success" | "error" | "info" | "warning";
export interface ToastData { msg: string; type: ToastType; }

export interface DBInfo {
  total: number;
  disciplines: Record<string, number>;
  lastUpdated: number;
}
