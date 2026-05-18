# 🛡️ PC-AP Simulados

Plataforma de simulados para o concurso da **Polícia Civil do Amapá (FCC)**.

## 🚀 Instalação local

```bash
npm install
npm run dev
```

## ☁️ Deploy Vercel

1. Push para o GitHub
2. Importe no [vercel.com](https://vercel.com) → Deploy automático

## ☁️ Deploy Netlify

Build command: `npm run build` | Publish dir: `dist`

---

## 📂 Adicionar questões ao banco

Edite `public/questions/database.json` para adicionar novos arquivos:

```json
{
  "databaseVersion": "1.1.0",
  "updatedAt": "2026-06-01",
  "files": [
    "penal/bloco_01.json",
    "penal/bloco_02.json"
  ]
}
```

Crie o arquivo JSON correspondente com o formato:

```json
[
  {
    "id": "fcc_penal_2024_050",
    "disciplina": "Noções de Direito Penal",
    "assunto": "Crimes contra o patrimônio",
    "banca": "FCC",
    "ano": 2024,
    "orgao": "PC-AP",
    "pergunta": "Texto da questão...",
    "alternativas": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
    "correta": 0,
    "linkTec": ""
  }
]
```

**Regras:**
- `id` deve ser único e permanente
- Atualize `databaseVersion` ao adicionar novos arquivos
- O progresso dos usuários é preservado automaticamente

## 📁 Estrutura

```
public/questions/
├── database.json          ← manifest (versão + lista de arquivos)
├── portugues/
│   └── bloco_01.json
├── penal/
│   └── bloco_01.json
└── ...
```
