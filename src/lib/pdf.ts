/**
 * PDF Export — Institutional exam booklet quality.
 *
 * Design goal: indistinguishable from a real FCC exam booklet.
 *
 * - A4 single-column layout
 * - Georgia/Times New Roman serif throughout
 * - Realistic margins (25mm × 20mm)
 * - Authentic academic text density
 * - No UI decorations: no rounded cards, no shadows, no colors
 * - Official compact spacing
 */

import type { Exam, ExamResult } from "../types";
import { LETTERS, DISCIPLINE_ORDER } from "./constants";
import { sanitizeHTML } from "./sanitize";

function stripHtml(html: string): string {
  return sanitizeHTML(html ?? "");
}

function stripAltPrefix(a: string): string {
  return (a ?? "")
    .replace(/^<[^>]+>\s*<u>[a-e]<\/u>\)\s*<\/[^>]+>/i, "")
    .replace(/^<u>[a-e]<\/u>\)\s*/i, "")
    .replace(/^[a-e]\)\s*/i, "")
    .trim();
}

/** Single-column A4 exam booklet */
export function exportExamPDF(exam: Exam): void {
  // ── Official exam CSS ─────────────────────────────────────────────
  const css = `
    @page {
      size: A4 portrait;
      margin: 25mm 20mm 22mm 20mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, "Times New Roman", Times, serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      line-height: 1.50;
      font-kerning: normal;
      font-variant-ligatures: none;
      -webkit-font-smoothing: none;
    }

    /* ── Header ─────────────────────────────────────────── */
    .exam-header {
      text-align: center;
      /* border-bottom: 0.5pt solid #333;
      padding-bottom: 6pt;
      margin-bottom: 14pt;
    }
    .exam-header h1 {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
    .exam-header h2 {
      font-size: 11pt;
      font-weight: normal;
      margin-top: 3pt;
    }
    .exam-header p {
      font-size: 9pt;
      color: #333;
      margin-top: 4pt;
    }

    /* ── Question ───────────────────────────────────────── */
    .question {
      margin-bottom: 16pt;
      page-break-inside: auto;
    }

    .q-head {
      display: block;
      margin-bottom: 5pt;
    }
    .q-num {
      font-size: 11pt;
      font-weight: bold;
      min-width: 20pt;
    }
    .q-meta {
      display: none;
    }

    /* ── Support text (apoio) ───────────────────────────── */
    .q-apoio {
      margin-top: 4pt;
      margin-bottom: 6pt;
      page-break-inside: avoid;
    }
    .q-apoio-label {
      display: none;
    }
    .q-apoio-body {
      font-size: 10pt;
      line-height: 1.48;
      font-style: italic;
    }
    .q-apoio-body p { margin-bottom: 6pt; }
    .q-apoio-body p:last-child { margin-bottom: 0; }
    .q-apoio-body .apoio-title,
    .q-apoio-body center { text-align: center; font-style: normal; font-weight: bold; margin-bottom: 5pt; }
    .q-apoio-body .apoio-attrib { text-align: right; font-size: 9pt; color: #444; margin-top: 4pt; }
    .q-apoio-body .fcc-excerpt { display: block; margin: 5pt 0; padding-left: 8pt; border-left: 1pt solid #888; }
    .q-apoio-body .fcc-verse { font-style: italic; display: block; }
    .q-apoio-body u { text-decoration: underline; }
    .q-apoio-body em, .q-apoio-body i { font-style: italic; }
    .q-apoio-body strong, .q-apoio-body b { font-weight: bold; }
    .q-apoio-body mark { background: transparent; font-weight: bold; }

    /* ── Image ──────────────────────────────────────────── */
    .q-img {
      display: block;
      max-width: 100%;
      max-height: 200pt;
      margin: 6pt auto 8pt;
      page-break-inside: avoid;
    }

    /* ── Question stem ──────────────────────────────────── */
    .q-text {
      font-size: 11pt;
      line-height: 1.50;
      margin-bottom: 8pt;
    }
    .q-text u { text-decoration: underline; text-decoration-skip-ink: none; text-decoration-thickness: from-font; text-underline-offset: 0.5px; }
    .q-text em, .q-text i { font-style: italic; }
    .q-text strong, .q-text b { font-weight: bold; }
    .q-text mark { background: transparent; font-weight: bold; }

    /* ── Alternatives ───────────────────────────────────── */
    .alts { margin-top: 4pt; }
    /* Alternatives: editorial paragraph flow, NOT flex rows */
    .alt-row {
      display: block;
      margin-bottom: 2pt;
      page-break-inside: avoid;
      font-size: 11pt;
      line-height: 1.50;
    }
    .alt-ltr {
      display: inline;
      font-weight: bold;
      margin-right: 2pt;
    }
    .alt-txt { display: inline; }
    .alt-txt u { text-decoration: underline; text-decoration-skip-ink: none; text-decoration-thickness: from-font; text-underline-offset: 0.5px; }
    .alt-txt em, .alt-txt i { font-style: italic; }
    .alt-txt strong, .alt-txt b { font-weight: bold; }
    .alt-txt u { text-decoration: underline; text-decoration-skip-ink: none; text-decoration-thickness: from-font; text-underline-offset: 0.5px; }
    .alt-txt em, .alt-txt i { font-style: italic; }
    .alt-txt strong, .alt-txt b { font-weight: bold; }
    .alt-txt mark { background: transparent; font-weight: bold; }

    /* ── Divider between questions ──────────────────────── */
    .q-divider { margin-bottom: 14pt; }

    /* ── Answer key ─────────────────────────────────────── */
    .gab-section {
      page-break-before: always;
      margin-top: 0;
    }
    .gab-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      text-align: center;
      margin-bottom: 14pt;
      /* border-bottom: 1pt solid #000;
      padding-bottom: 6pt;
    }
    .gab-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 3pt;
    }
    .gab-item {
      border: 0.5pt solid #888;
      text-align: center;
      padding: 2pt 0;
    }
    .gab-n { font-size: 7pt; color: #555; display: block; }
    .gab-a { font-size: 10pt; font-weight: bold; display: block; }

    /* ── Print ──────────────────────────────────────────── */
    @media print {
      body { print-color-adjust: exact; }
    }
  `;

  // ── Build questions HTML ──────────────────────────────────────────
  const questionsHTML = exam.questions.map((q, qi) => {
    const apoioHTML = q.texto_apoio ? `
      <div class="q-apoio">
        <div class="q-apoio-label">${q.texto_apoio_titulo || "Texto"}</div>
        <div class="q-apoio-body">${stripHtml(q.texto_apoio)}</div>
      </div>` : "";

    const imgHTML = q.imagem
      ? `<div style="text-align:center;margin:6pt 0"><img class="q-img" src="${q.imagem}" /></div>`
      : "";

    const altsHTML = q.alternativas.map((a, i) => `
      <div class="alt-row">
        <span class="alt-ltr">${LETTERS[i] ?? String.fromCharCode(65 + i)})</span>
        <span class="alt-txt">${stripHtml(stripAltPrefix(a))}</span>
      </div>`
    ).join("");

    const isLast = qi === exam.questions.length - 1;

    return `
      <div class="question">
        <div class="q-head">
          <span class="q-num">${q.numero_simulado}.</span>
          <span class="q-meta">${q.disciplina}${q.banca ? ` · ${q.banca}` : ""}${q.ano ? ` · ${q.ano}` : ""}</span>
        </div>
        ${apoioHTML}${imgHTML}
        <div class="q-text">${stripHtml(q.pergunta)}</div>
        <div class="alts">${altsHTML}</div>
      </div>
      ${!isLast ? '<div class="q-divider"></div>' : ""}
    `;
  }).join("");

  // ── Answer key ────────────────────────────────────────────────────
  const gabHTML = exam.questions.map((q) => `
    <div class="gab-item">
      <span class="gab-n">${q.numero_simulado}</span>
      <span class="gab-a">${LETTERS[q.correta] ?? "?"}</span>
    </div>`
  ).join("");

  // ── Header ────────────────────────────────────────────────────────
  const examDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });
  const modeLabel = exam.mode === "prova" ? "Simulado de Prova" : "Simulado de Treino";
  const discs = [...new Set(exam.questions.map((q) => q.disciplina))].join(" · ");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>PC-AP Simulados — ${modeLabel}</title>
  <style>${css}</style>
</head>
<body>
  <div class="exam-header">
    <h1>PC-AP Simulados</h1>
    <h2>Polícia Civil do Amapá — ${modeLabel}</h2>
    <p>${discs}</p>
    <p>${examDate} &nbsp;·&nbsp; ${exam.questions.length} questões${exam.mode === "prova" ? ` &nbsp;·&nbsp; ${exam.timeLimit / 60} minutos` : ""}</p>
  </div>

  ${questionsHTML}

  <div class="gab-section">
    <div class="gab-title">Gabarito</div>
    <div class="gab-grid">${gabHTML}</div>
  </div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 900);
  }
}

/** Results PDF — also institutional */
export function exportResultsPDF(results: ExamResult): void {
  const discRows = DISCIPLINE_ORDER
    .filter((d) => results.disciplineStats[d])
    .map((d) => {
      const s = results.disciplineStats[d];
      const p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      return { d, s, p };
    });

  const css = `
    @page { size: A4; margin: 25mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia,"Times New Roman",serif; font-size: 11pt; color: #000; line-height: 1.50; }
    h1 { font-size: 14pt; font-weight: bold; /* border-bottom: 1.5pt solid #000; padding-bottom: 6pt; margin-bottom: 14pt; }
    h2 { font-size: 11pt; font-weight: bold; margin: 14pt 0 6pt; /* border-bottom: 0.5pt solid #ccc; padding-bottom: 3pt; }
    .score { font-size: 32pt; font-weight: bold; margin: 10pt 0 4pt; }
    .sub { font-size: 11pt; color: #333; margin-bottom: 14pt; }
    .disc-row { display: flex; justify-content: space-between; padding: 3pt 0; /* border-bottom: 0.5pt solid #eee; font-size: 10pt; }
    .qi { margin: 8pt 0; padding: 5pt 0 5pt 8pt; border-left: 2pt solid #ccc; page-break-inside: avoid; }
    .qi.ok { border-color: #006600; }
    .qi.err { border-color: #cc0000; }
    .qi.skip { border-color: #888; }
    .qi p { font-size: 9.5pt; margin-bottom: 3pt; }
    .qi .label { font-weight: bold; font-size: 9pt; }
    .correct-mark { color: #006600; }
    .wrong-mark   { color: #cc0000; }
  `;

  const date = new Date(results.date).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });

  const discTable = discRows.map((r) =>
    `<div class="disc-row"><span>${r.d}</span><span>${r.s.correct}/${r.s.total} (${r.p}%)</span></div>`
  ).join("");

  const questionsReview = results.questions.map((q) => {
    const ua = results.answers[q.numero_simulado];
    const ok = ua === q.correta;
    const skip = ua === undefined || ua === null;
    const cls = skip ? "skip" : ok ? "ok" : "err";
    const label = skip ? "Não respondida" : ok ? "Correta" : "Incorreta";
    return `
      <div class="qi ${cls}">
        <p class="label">${q.numero_simulado}. [${q.disciplina}] — <span class="${ok?"correct-mark":skip?"":"wrong-mark"}">${label}</span></p>
        <p>${(q.pergunta ?? "").replace(/<[^>]*>/g, "").slice(0, 180)}${q.pergunta?.length > 180 ? "…" : ""}</p>
        ${q.alternativas.map((a, i) => {
          const cls2 = i === q.correta ? "correct-mark" : (i === ua && !ok ? "wrong-mark" : "");
          return `<p class="${cls2}" style="font-size:9pt">${String.fromCharCode(65+i)}) ${(a??"").replace(/<[^>]*>/g,"").slice(0,120)}${i===q.correta?" ✓":""}</p>`;
        }).join("")}
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Resultado</title><style>${css}</style></head>
<body>
  <h1>PC-AP Simulados — Resultado</h1>
  <div class="score">${results.percent}%</div>
  <div class="sub">${results.score} de ${results.total} questões corretas &nbsp;·&nbsp; ${date}</div>
  <h2>Desempenho por disciplina</h2>
  ${discTable}
  <h2>Revisão das questões</h2>
  ${questionsReview}
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 800); }
}
