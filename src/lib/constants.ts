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

// Arquivos de Língua Portuguesa (blocos 01–17)
const PORTUGUES_FILES = Array.from({ length: 17 }, (_, i) =>
  `/questions/portugues/bloco_${String(i + 1).padStart(2, "0")}.json`
);

// Arquivos das demais disciplinas (extraídos dos PDFs TecConcursos)
const OUTRAS_DISCIPLINAS_FILES = [
  "/questions/raciocinio/bloco_01.json",
  "/questions/raciocinio/bloco_02.json",
  "/questions/raciocinio/bloco_03.json",
  "/questions/raciocinio/bloco_04.json",
  "/questions/raciocinio/bloco_05.json",
  "/questions/raciocinio/bloco_06.json",
  "/questions/raciocinio/bloco_07.json",
  "/questions/raciocinio/bloco_08.json",
  "/questions/historia_ap/bloco_01.json",
  "/questions/historia_ap/bloco_02.json",
  "/questions/historia_ap/bloco_03.json",
  "/questions/informatica/bloco_01.json",
  "/questions/informatica/bloco_02.json",
  "/questions/informatica/bloco_03.json",
  "/questions/informatica/bloco_04.json",
  "/questions/direitos_humanos/bloco_01.json",
  "/questions/direitos_humanos/bloco_02.json",
  "/questions/direitos_humanos/bloco_03.json",
  "/questions/administrativo/bloco_01.json",
  "/questions/administrativo/bloco_02.json",
  "/questions/administrativo/bloco_03.json",
  "/questions/administrativo/bloco_04.json",
  "/questions/administrativo/bloco_05.json",
  "/questions/administrativo/bloco_06.json",
  "/questions/administrativo/bloco_07.json",
  "/questions/administrativo/bloco_08.json",
  "/questions/administrativo/bloco_09.json",
  "/questions/administrativo/bloco_10.json",
  "/questions/administrativo/bloco_11.json",
  "/questions/administrativo/bloco_12.json",
  "/questions/administrativo/bloco_13.json",
  "/questions/administrativo/bloco_14.json",
  "/questions/administrativo/bloco_15.json",
  "/questions/constitucional/bloco_01.json",
  "/questions/constitucional/bloco_02.json",
  "/questions/constitucional/bloco_03.json",
  "/questions/penal/bloco_01.json",
  "/questions/penal/bloco_02.json",
  "/questions/penal/bloco_03.json",
  "/questions/penal/bloco_04.json",
  "/questions/penal/bloco_05.json",
  "/questions/penal/bloco_06.json",
  "/questions/processo_penal/bloco_01.json",
  "/questions/processo_penal/bloco_02.json",
  "/questions/processo_penal/bloco_03.json",
  "/questions/processo_penal/bloco_04.json"
];

export const BLOCO_FILES = [...PORTUGUES_FILES, ...OUTRAS_DISCIPLINAS_FILES];
