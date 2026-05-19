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

/** A4 exam booklet — editorial FCC format */
export function exportExamPDF(exam: Exam): void {

  const css = `
    @page {
      size: A4 portrait;
      margin: 20mm 16mm 20mm 16mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, "Times New Roman", Times, serif;
      font-size: 11pt;
      color: #000;
      background: #fff;
      line-height: 1.42;
    }

    /* ── Compact editorial header ──────────────────────── */
    .exam-header {
      border-bottom: 0.75pt solid #000;
      padding-bottom: 5pt;
      margin-bottom: 12pt;
    }
    .h-title {
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.8pt;
    }
    .h-sub  { font-size: 9pt;  color: #222; margin-top: 1pt; }
    .h-info { font-size: 8pt;  color: #555; margin-top: 1pt; }

    /* ── Discipline block header ────────────────────────── */
    .disc-title {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.6pt;
      border-bottom: 0.5pt solid #000;
      padding-bottom: 2pt;
      margin: 16pt 0 8pt 0;
      page-break-after: avoid;
    }

    /* ── Question wrapper ───────────────────────────────── */
    .question {
      margin-bottom: 10pt;
      page-break-inside: auto;
    }

    /* ── Question number — OWN LINE, before everything ──── */
    .q-num {
      font-size: 11pt;
      font-weight: bold;
      line-height: 1.3;
      margin-bottom: 3pt;
    }

    /* ── Support text — plain editorial, after number ───── */
    .q-apoio {
      margin-bottom: 5pt;
    }
    .q-apoio-body {
      font-size: 10pt;
      line-height: 1.42;
      font-style: italic;
    }
    .q-apoio-body p { margin-bottom: 5pt; }
    .q-apoio-body p:last-child { margin-bottom: 0; }
    .q-apoio-body .apoio-title,
    .q-apoio-body center {
      text-align: center;
      font-style: normal;
      font-weight: bold;
      margin-bottom: 4pt;
    }
    .q-apoio-body .apoio-attrib {
      text-align: right;
      font-size: 9pt;
      color: #444;
      margin-top: 3pt;
    }
    .q-apoio-body .fcc-excerpt {
      display: block;
      margin: 4pt 0;
      padding-left: 10pt;
      border-left: 0.5pt solid #888;
    }
    .q-apoio-body .fcc-verse {
      font-style: italic;
      display: block;
    }
    .q-apoio-body u {
      text-decoration-line: underline;
      text-decoration-thickness: from-font;
      text-underline-offset: 1px;
      text-decoration-skip-ink: none;
    }
    .q-apoio-body em, .q-apoio-body i  { font-style: italic; }
    .q-apoio-body strong, .q-apoio-body b { font-weight: bold; }
    .q-apoio-body mark { background: transparent; font-weight: bold; }

    /* ── Image ──────────────────────────────────────────── */
    .q-img {
      display: block;
      max-width: 100%;
      max-height: 200pt;
      margin: 5pt auto 6pt;
      page-break-inside: avoid;
    }

    /* ── Question stem — block, no hanging indent ───────── */
    .q-text {
      font-size: 11pt;
      line-height: 1.42;
      margin-bottom: 5pt;
    }
    .q-text p { margin-bottom: 4pt; }
    .q-text p:last-child { margin-bottom: 0; }
    .q-text u {
      text-decoration-line: underline;
      text-decoration-thickness: from-font;
      text-underline-offset: 1px;
      text-decoration-skip-ink: none;
    }
    .q-text em, .q-text i  { font-style: italic; }
    .q-text strong, .q-text b { font-weight: bold; }
    .q-text mark { background: transparent; font-weight: bold; }

    /* ── Alternatives ───────────────────────────────────── */
    .alts { margin-top: 3pt; }
    .alt-row {
      display: block;
      margin-bottom: 1.5pt;
      page-break-inside: avoid;
      font-size: 11pt;
      line-height: 1.42;
    }
    .alt-ltr { display: inline; margin-right: 2pt; }
    .alt-txt { display: inline; }
    .alt-txt u {
      text-decoration-line: underline;
      text-decoration-thickness: from-font;
      text-underline-offset: 1px;
      text-decoration-skip-ink: none;
    }
    .alt-txt em, .alt-txt i  { font-style: italic; }
    .alt-txt strong, .alt-txt b { font-weight: bold; }
    .alt-txt mark { background: transparent; font-weight: bold; }

    /* ── Answer key ─────────────────────────────────────── */
    .gab-section { page-break-before: always; }
    .gab-title {
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.6pt;
      border-bottom: 0.5pt solid #000;
      padding-bottom: 2pt;
      margin-bottom: 8pt;
    }
    .gab-cols {
      column-count: 5;
      column-gap: 0;
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5pt;
      line-height: 1.65;
    }
    .gab-row { display: block; break-inside: avoid; white-space: nowrap; }
    .gab-n   { display: inline-block; width: 20pt; text-align: right; }
    .gab-a   { display: inline; margin-left: 5pt; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `;

  // ── Group questions by discipline (preserve exam order) ───────────
  type QGroup = { disc: string; qs: (typeof exam.questions) };
  const groups: QGroup[] = [];
  for (const q of exam.questions) {
    const last = groups[groups.length - 1];
    if (!last || last.disc !== q.disciplina) {
      groups.push({ disc: q.disciplina, qs: [q] });
    } else {
      last.qs.push(q);
    }
  }

  // ── Build body HTML ───────────────────────────────────────────────
  const bodyHTML = groups.map(({ disc, qs }) => {
    const header = `<div class="disc-title">${disc.toUpperCase()}</div>`;

    // Deduplicate apoio: show only on first occurrence within each group
    let prevApoioKey = "";
    const qsHTML = qs.map((q) => {
      const apoioKey = (q.texto_apoio ?? "").trim();
      const showApoio = Boolean(apoioKey) && apoioKey !== prevApoioKey;
      if (apoioKey) prevApoioKey = apoioKey;

      // ── Structure: NUMBER → APOIO → IMAGE → STEM → ALTS ─────────
      // Number is ALWAYS first, on its own line, isolated.
      const numHTML = `<div class="q-num">${q.numero_simulado})</div>`;

      const apoioHTML = showApoio
        ? `<div class="q-apoio"><div class="q-apoio-body">${stripHtml(q.texto_apoio ?? "")}</div></div>`
        : "";

      const imgHTML = q.imagem
        ? `<div style="text-align:center;margin:5pt 0"><img class="q-img" src="${q.imagem}" /></div>`
        : "";

      // Stem = question text only. Number is separate above.
      const stemHTML = `<div class="q-text">${stripHtml(q.pergunta)}</div>`;

      // Lowercase a) b) c) d) e) — FCC standard
      const altsHTML = q.alternativas.map((a, i) =>
        `<div class="alt-row"><span class="alt-ltr">${String.fromCharCode(97 + i)})</span><span class="alt-txt">${stripHtml(stripAltPrefix(a))}</span></div>`
      ).join("");

      return `<div class="question">${numHTML}${apoioHTML}${imgHTML}${stemHTML}<div class="alts">${altsHTML}</div></div>`;
    }).join("");

    return `${header}${qsHTML}`;
  }).join("");

  // ── Compact answer key ────────────────────────────────────────────
  const gabHTML = exam.questions.map((q) =>
    `<span class="gab-row"><span class="gab-n">${q.numero_simulado}</span><span class="gab-a">${LETTERS[q.correta] ?? "?"}</span></span>`
  ).join("");

  // ── Minimal institutional header ──────────────────────────────────
  const examDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  });
  const modeLabel = exam.mode === "prova" ? "Simulado de Prova" : "Simulado de Treino";
  const timeLabel = exam.mode === "prova" ? ` &middot; ${exam.timeLimit / 60} min` : "";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>PC-AP Simulados &mdash; ${modeLabel}</title>
  <style>${css}</style>
</head>
<body>
  <div class="exam-header">
    <div class="h-title">PC-AP Simulados</div>
    <div class="h-sub">Pol&iacute;cia Civil do Amap&aacute; &mdash; ${modeLabel}</div>
    <div class="h-info">${examDate}${timeLabel} &nbsp;&middot;&nbsp; ${exam.questions.length} quest&otilde;es</div>
  </div>

  ${bodyHTML}

  <div class="gab-section">
    <div class="gab-title">Gabarito</div>
    <div class="gab-cols">${gabHTML}</div>
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
