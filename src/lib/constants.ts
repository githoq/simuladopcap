export const DISCIPLINE_ORDER = [
  "Língua Portuguesa",
  "História e Geografia do Amapá",
  "Raciocínio Lógico-Matemático",
  "Noções de Informática",
  "Direitos Humanos",
  "Direito Administrativo",
  "Direito Constitucional",
  "Direito Penal",
  "Direito Processual Penal",
] as const;

export const DISC_SHORT = [
  "Português", "Hist./Geo. AP", "Rac. Lógico", "Informática",
  "Dir. Humanos", "Dir. Adm.", "Dir. Const.", "Dir. Penal", "Proc. Penal",
];

export const DISC_COLORS = [
  "#c8a75d","#8fa5bf","#5a8a6a","#c07040",
  "#b04060","#4a6890","#7a60a0","#905060","#4a8878",
];

export const LETTERS = ["A","B","C","D","E"] as const;

export const SK = {
  USED:   "pcsim_v2_used",
  HIST:   "pcsim_v2_history",
  CUR:    "pcsim_v2_current",
  DB_VER: "pcsim_db_version",
} as const;

export const BLOCO_FILES = Array.from({ length: 17 }, (_, i) =>
  `/questions/portugues/bloco_${String(i + 1).padStart(2, "0")}.json`
);
