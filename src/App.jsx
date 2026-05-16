import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* CONSTANTS */
const DISCIPLINE_ORDER = [
  "Língua Portuguesa","História e Geografia do Amapá","Raciocínio Lógico-Matemático",
  "Noções de Informática","Direitos Humanos","Direito Administrativo",
  "Direito Constitucional","Direito Penal","Direito Processual Penal",
];
const DISC_SHORT = ["Português","Hist./Geo. AP","Rac. Lógico","Informática","Dir. Humanos","Dir. Adm.","Dir. Const.","Dir. Penal","Proc. Penal"];
const DISC_COLORS=["#c8a75d","#8fa5bf","#5a8a6a","#c07040","#b04060","#4a6890","#7a60a0","#905060","#4a8878"];
const SK = { USED:"pcsim_v2_used", HIST:"pcsim_v2_history", CUR:"pcsim_v2_current", DB_VER:"pcsim_db_version" };
const LETTERS = ["A","B","C","D","E"];

/* UTILITIES */
const uuid = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=(Math.random()*16)|0;return(c==="x"?r:(r&0x3)|0x8).toString(16);});
const shuffle = arr => {const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const fmtTime = s => {const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;};
const store = {
  save:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  load:(k,d=null)=>{try{const i=localStorage.getItem(k);return i?JSON.parse(i):d;}catch{return d;}},
  del:(k)=>{try{localStorage.removeItem(k);}catch{}},
};

/* HTML SANITIZER — safe render of formatted question text */
/**
 * sanitizeHTML — whitelist-based sanitizer that PRESERVES semantic HTML.
 * Allows: em, strong, b, i, u, s, sup, sub, br, p, span, div, center,
 *         blockquote, ul, ol, li, table, thead, tbody, tr, td, th, mark
 * Allows attributes: class, style (filtered)
 * Allowed style properties: text-align, font-style, font-weight,
 *         text-decoration, margin-left, padding-left, font-size
 * Strips: script, iframe, on* handlers, javascript: URIs, unknown tags
 */
const SAFE_TAGS = new Set(['em','strong','b','i','u','s','sup','sub','br','p',
  'span','div','center','blockquote','ul','ol','li','table','thead','tbody',
  'tr','td','th','mark']);
const SAFE_STYLE_PROPS = new Set(['text-align','font-style','font-weight',
  'text-decoration','text-decoration-line','margin-left','padding-left',
  'font-size','color','background-color','text-indent']);

function sanitizeStyle(styleStr){
  if(!styleStr) return '';
  const safe = [];
  styleStr.split(';').forEach(decl=>{
    const [prop,...rest] = decl.split(':');
    if(!prop||!rest.length) return;
    const p = prop.trim().toLowerCase();
    const v = rest.join(':').trim();
    if(!SAFE_STYLE_PROPS.has(p)) return;
    // block any url(), expression(), javascript:
    if(/url\(|expression|javascript:/i.test(v)) return;
    safe.push(`${p}:${v}`);
  });
  return safe.join(';');
}

function sanitizeHTML(html){
  if(!html||typeof html!=='string') return '';
  // 1. Remove script/iframe blocks
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi,'')
    .replace(/<iframe[\s\S]*?>/gi,'')
    .replace(/javascript:/gi,'#');
  // 2. Filter every tag through whitelist; sanitize attributes
  s = s.replace(/<(\/?)(\w+)([^>]*)>/g,(match,slash,tag,attrs)=>{
    const tagL = tag.toLowerCase();
    if(!SAFE_TAGS.has(tagL)) return ''; // strip unknown tag
    if(slash) return `</${tagL}>`;
    // Process allowed attributes: class, style, align
    const out = [];
    // class
    const cm = attrs.match(/\bclass=["']([^"']*)["']/i);
    if(cm) out.push(`class="${cm[1].replace(/[<>"]/g,'')}"`);
    // style — sanitize properties
    const sm = attrs.match(/\bstyle=["']([^"']*)["']/i);
    if(sm){
      const safeStyle = sanitizeStyle(sm[1]);
      if(safeStyle) out.push(`style="${safeStyle}"`);
    }
    // align (legacy HTML)
    const am = attrs.match(/\balign=["']?(\w+)["']?/i);
    if(am && /^(left|right|center|justify)$/i.test(am[1])) out.push(`align="${am[1].toLowerCase()}"`);
    return `<${tagL}${out.length?' '+out.join(' '):''}>`;
  });
  return s;
}

/* Render HTML with proper line-break and paragraph conversion */
/**
 * renderHTML — minimal-transformation renderer.
 * Pipeline: input -> [optional \n->br for non-prewrap context] -> sanitize -> return.
 * Default opts: { prewrap: false }
 *   - prewrap=true:  CSS handles \n via white-space:pre-wrap. NO transformation.
 *   - prewrap=false: convert raw \n to <br> ONLY if input has no block-level tags.
 */
function renderHTML(html,opts){
  if(!html||typeof html!=='string') return '';
  let s = html;
  const prewrap = opts && opts.prewrap;
  if(!prewrap){
    const hasBlock = /<(p|br|div|center|blockquote|table|ul|ol|li)\b/i.test(s);
    if(!hasBlock){
      s = s.replace(/\n\n+/g,'<br><br>').replace(/\n/g,'<br>');
    }
    // If hasBlock=true, leave \n alone — they're cosmetic whitespace inside HTML structure.
  }
  return sanitizeHTML(s);
}

/* DATABASE LOADER */
async function loadQuestionDatabase(onProgress) {
  const res = await fetch("/questions/database.json",{cache:"no-cache"});
  if(!res.ok) throw new Error("database.json não encontrado em /questions/");
  const db = await res.json();
  const files = db.files||[];
  if(!files.length) throw new Error("Nenhum arquivo listado em database.json");
  const all=[];
  for(let i=0;i<files.length;i++){
    try{const r=await fetch(`/questions/${files[i]}`);if(r.ok){const d=await r.json();if(Array.isArray(d))all.push(...d);}
    }catch(e){console.warn(`Erro: ${files[i]}`,e.message);}
    onProgress(Math.round(((i+1)/files.length)*100));
  }
  const seen=new Set();
  const unique=all.filter(q=>{if(!q.id||seen.has(q.id))return false;seen.add(q.id);return true;});
  const valid=unique.filter(q=>q.disciplina&&q.pergunta&&Array.isArray(q.alternativas)&&q.alternativas.length>=2);
  return{questions:valid,version:db.databaseVersion||"1.0.0",updatedAt:db.updatedAt||"",totalFiles:files.length};
}

/* EXAM GENERATOR */
function generateExam(config,questions,usedIds){
  const usedSet=new Set(usedIds);const examQ=[];const warnings=[];
  for(const disc of DISCIPLINE_ORDER){
    const count=config.disciplineConfig[disc]||0;if(!count)continue;
    const available=questions.filter(q=>q.disciplina===disc&&!usedSet.has(q.id));
    if(!available.length){if(count>0)warnings.push({disc,requested:count,available:0});continue;}
    const selected=shuffle(available).slice(0,Math.min(count,available.length));
    if(selected.length<count)warnings.push({disc,requested:count,available:selected.length});
    examQ.push(...shuffle(selected));
  }
  return{id:uuid(),questions:examQ.map((q,i)=>({...q,numero_simulado:i+1})),mode:config.mode||"prova",timeMinutes:config.timeMinutes||120,createdAt:new Date().toISOString(),config,warnings};
}

/* PDF EXPORT — PROVA */
function exportExamPDF(exam){
  /* ── Build questions section ── */
  let questionsHTML="";let lastDisc=null;
  const pdfRender=(html)=>{
    if(!html||typeof html!=='string') return '';
    let s = html;
    // PDF uses HTML rendering — preserve structure.
    // Convert \n to <br> ONLY where there's no block-level structure.
    const hasBlock = /<(p|br|div|center|blockquote|table|ul|ol|li)\b/i.test(s);
    if(!hasBlock){
      s = s.replace(/\n\n+/g,'<br><br>').replace(/\n/g,'<br>');
    }
    // No further transformation — sanitization happens at PDF embed time if needed
    return s;
  };
  const stripPdfLetter=(a)=>{
    let s=(a||'').trim();
    s=s.replace(/^[a-eA-E]\)\s*/,'');
    s=s.replace(/^(<(?:em|strong|i|b|u)>)\s*[a-eA-E]\)\s*/i,'$1');
    s=s.replace(/^<(?:em|strong|i|b|u)>\s*[a-eA-E]\)\s*<\/(?:em|strong|i|b|u)>\s*/i,'');
    return s.trim();
  };
  exam.questions.forEach(q=>{
    if(q.disciplina!==lastDisc){
      questionsHTML+=`<div class="disc-hd">${q.disciplina.toUpperCase()}</div>`;
      lastDisc=q.disciplina;
    }
    const imgSrc=q.imagem?(q.imagem.startsWith('http')?q.imagem:q.imagem):'';
    const imgHTML=imgSrc?`<div class="q-img-wrap"><img src="${imgSrc}" alt="Figura" class="q-img" /></div>`:'';
    const apoioHTML=q.texto_apoio?`<div class="q-apoio">
      ${q.texto_apoio_titulo?`<div class="q-apoio-title">${q.texto_apoio_titulo}</div>`:''}
      <div class="q-apoio-body">${pdfRender(q.texto_apoio)}</div>
    </div>`:'';
    const alts=q.alternativas.map((a,i)=>`
      <div class="alt-row">
        <span class="alt-ltr">${LETTERS[i]}</span>
        <span class="alt-txt">${pdfRender(stripPdfLetter(a))}</span>
      </div>`).join("");
    const dividerHTML=q.texto_apoio?'<div class="q-apoio-divider"></div>':'';
    questionsHTML+=`<div class="question">
      <div class="q-header">
        <span class="q-num">Questão ${q.numero_simulado}</span>
      </div>
      ${apoioHTML}
      ${dividerHTML}
      ${imgHTML}
      <div class="q-text">${pdfRender(q.pergunta||'')}</div>
      <div class="alts">${alts}</div>
    </div>`;
  });

  /* ── Build cartão resposta (answer bubbles) ── */
  const half=Math.ceil(exam.questions.length/2);
  const leftQs=exam.questions.slice(0,half);
  const rightQs=exam.questions.slice(half);
  const buildCol=qs=>qs.map(q=>`
    <div class="ans-row">
      <span class="ans-num">${String(q.numero_simulado).padStart(2,"0")}</span>
      ${LETTERS.slice(0,q.alternativas.length).map(l=>`<span class="bubble">${l}</span>`).join("")}
    </div>`).join("");
  const cartaoHTML=`
    <div class="cartao-cols">
      <div class="cartao-col">${buildCol(leftQs)}</div>
      <div class="cartao-divider"></div>
      <div class="cartao-col">${buildCol(rightQs)}</div>
    </div>`;

  /* ── Build gabarito grid ── */
  const gabRows=exam.questions.map(q=>`
    <div class="gab-cell">
      <div class="gab-num">${q.numero_simulado}</div>
      <div class="gab-ans">${LETTERS[q.correta]||"?"}</div>
    </div>`).join("");

  /* ── Discipline summary ── */
  const discSummary=[...new Set(exam.questions.map(q=>q.disciplina))].map(d=>{
    const cnt=exam.questions.filter(q=>q.disciplina===d).length;
    return `<div class="disc-item"><span class="disc-name">${d}</span><span class="disc-cnt">${cnt}Q</span></div>`;
  }).join("");

  const hoje=new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"});

  const html=`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Simulado PC-AP — ${exam.questions.length} Questões</title>
<style>
/* ── RESET & PAGE ── */
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4 portrait;margin:12mm 13mm 14mm 13mm}
body{font-family:"Times New Roman",Times,serif;font-size:10.5pt;color:#1a1a1a;background:#fff;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}

/* ── COVER HEADER ── */
/* ── COVER HEADER (estilo prova oficial FCC, impressão limpa) ── */
.cover-header{margin-bottom:16pt;padding-bottom:10pt;border-bottom:1.5pt solid #000}
.cover-top{padding:4pt 0 8pt;display:flex;align-items:center;gap:14pt}
.cover-shield-img{width:56pt;height:auto;object-fit:contain;flex-shrink:0}
.cover-titles{flex:1;text-align:center}
.cover-titles h1{font-size:13pt;font-weight:bold;letter-spacing:.3px;text-transform:uppercase;margin:0;line-height:1.25}
.cover-titles .subtitle{font-size:9.5pt;font-weight:normal;margin-top:4pt;color:#333;letter-spacing:.2px}
.cover-titles .institution{font-size:8pt;font-weight:bold;letter-spacing:1.5px;color:#666;text-transform:uppercase;margin-top:6pt}
.cover-meta{display:grid;grid-template-columns:repeat(3,1fr);font-size:8.5pt;margin-top:6pt;padding-top:6pt;border-top:.5pt solid #999}
.cover-meta-item{padding:0 8pt;text-align:center}
.cover-meta-item:not(:last-child){border-right:.5pt solid #ccc}
.cover-meta-item .lbl{font-size:7pt;text-transform:uppercase;letter-spacing:.8px;color:#666;display:block;margin-bottom:2pt}
.cover-meta-item .val{font-weight:bold;font-size:10pt;color:#000}

/* ── CANDIDATE FIELDS ── */
.candidate-fields{margin-bottom:14pt;border:1px solid #ccc;padding:8pt 12pt}
.field-row{display:flex;gap:16pt;margin-bottom:6pt}
.field-row:last-child{margin-bottom:0}
.field{flex:1;border-bottom:1px solid #000;padding-bottom:14pt;position:relative}
.field label{font-size:8pt;text-transform:uppercase;letter-spacing:.5px;color:#555;position:absolute;top:0}

/* ── INSTRUCTIONS ── */
.instructions{border:1px solid #999;padding:8pt 12pt;margin-bottom:14pt;background:#f9f9f9}
.instructions h3{font-size:9.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5pt}
.instructions ol{margin-left:16pt;font-size:9pt;line-height:1.7}

/* ── DISC SUMMARY ── */
.disc-summary{margin-bottom:14pt}
.disc-summary-title{font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#555;margin-bottom:5pt}
.disc-summary-grid{display:flex;flex-wrap:wrap;gap:4pt}
.disc-item{display:flex;align-items:center;gap:5pt;padding:3pt 8pt;border:1px solid #ddd;border-radius:3pt;font-size:8pt}
.disc-name{color:#333}.disc-cnt{font-weight:bold;color:#000}

/* ── DISCIPLINE HEADER ── */
.disc-hd{background:#fff;color:#e2e8f0;padding:5pt 12pt;font-size:9.5pt;font-weight:bold;letter-spacing:1.5px;margin:18pt 0 10pt;text-transform:uppercase;page-break-after:avoid;border-left:2pt solid #333}

/* ── QUESTION ── */
/* ── QUESTÃO: regras de paginação inteligente ── */
.question{
  margin-bottom:11pt;padding-bottom:8pt;border-bottom:1px dotted #ccc;
  /* NÃO usar page-break-inside:avoid aqui — questões longas
     inevitavelmente quebrarão; controlamos onde ocorre a quebra */
  break-inside:auto;page-break-inside:auto;
}
.question:last-child{border-bottom:none}
/* Cabeçalho NUNCA fica sozinho na página */
.q-header{
  display:block;margin-bottom:4pt;
  break-after:avoid;page-break-after:avoid;
}
/* Pergunta não começa em página nova separada do apoio */
.q-text{
  break-before:avoid;page-break-before:avoid;
  break-inside:avoid;page-break-inside:avoid;
}
/* Alternativas ficam com a pergunta */
.alts{
  break-before:avoid;page-break-before:avoid;
  break-inside:avoid;page-break-inside:avoid;
}
/* Cada alternativa individual não quebra */
.alt-row{break-inside:avoid;page-break-inside:avoid}
/* Apoio longo pode quebrar, mas com orfãos/viúvas controlados */
.q-apoio{orphans:3;widows:3}
.q-num{font-weight:bold;font-size:10.5pt;color:#000;display:inline-block}
.q-sub{font-size:8.5pt;color:#555;font-style:italic}
.q-apoio{background:#fafafa;border-left:2pt solid #333;padding:10pt 14pt;margin-bottom:0;border-radius:0 4pt 4pt 0;page-break-inside:avoid}
.q-apoio-title{text-align:center;font-weight:bold;font-size:10.5pt;margin-bottom:7pt;color:#1a2b3c}
.q-apoio-body{font-size:10pt;line-height:1.55;color:#1a1a1a;word-wrap:break-word}
.q-apoio-body p{margin:0 0 6pt;line-height:1.55}
.q-apoio-body p.fcc-excerpt{margin-top:8pt;padding:5pt 8pt;border-top:.5pt solid #999;border-left:1.5pt solid #c8a75d;background:#fffbf0}
.q-apoio-body p.fcc-excerpt u{text-decoration:underline;text-underline-offset:2pt}
.q-apoio-body p:last-child{margin-bottom:0}
.q-apoio-body mark{background:#fde68a;color:#1a1108;padding:0 2pt;border-radius:1pt}
.q-apoio-body em,.q-apoio-body i{font-style:italic}
.q-apoio-body strong,.q-apoio-body b{font-weight:bold;background:#fff4ce;padding:0 1.5pt;border-radius:0}
.q-apoio-body center.apoio-title,.q-apoio-body .apoio-title{display:block;text-align:center;margin:0 auto 6pt}
.q-apoio-body .apoio-attrib{display:block;text-align:right;margin-top:4pt;font-size:.92em;color:#555;font-style:italic}
.q-apoio-body .apoio-title strong,.q-apoio-body center.apoio-title strong{background:transparent!important;font-weight:bold;font-size:1.05em;padding:0!important;color:#000}
.q-apoio-body u{text-decoration:underline;text-underline-offset:2px}
.q-apoio-body br{display:block;margin-bottom:0.1em}
.q-apoio-body p{margin-bottom:0.4em}
.q-apoio-body br+br{margin-bottom:0.35em}
.q-apoio-divider{height:1px;background:linear-gradient(to right,#4a7fa5 0%,transparent 80%);margin:10pt 0 8pt}
.q-img{display:block;max-width:100%;height:auto;margin:8pt auto 10pt;border-radius:4pt;page-break-inside:avoid}
.q-img-wrap{text-align:center;margin:6pt 0 10pt;page-break-inside:avoid}
.q-text{line-height:1.55;text-align:justify;margin-bottom:5pt;font-size:10pt;color:#111}
.q-text em,.q-text i{font-style:italic}
.q-text strong,.q-text b{font-weight:bold}
.q-text u{text-decoration:underline}
.q-text br{display:block;margin-bottom:0.12em}
.q-text p{margin-bottom:0.45em}
.alts{margin-left:4pt}
.alt-row{display:flex;gap:5pt;margin-bottom:1.5pt;line-height:1.4;page-break-inside:avoid}
.alt-ltr{font-weight:bold;font-size:10pt;min-width:13pt;flex-shrink:0}
.alt-txt{font-size:10pt;line-height:1.55}
.alt-txt em,.alt-txt i{font-style:italic}
.alt-txt u{text-decoration:underline;text-underline-offset:2px}
.alt-txt strong,.alt-txt b{font-weight:bold}
.alt-txt br{display:block;margin-bottom:0.08em}

/* ── PAGE BREAKS ── */
.pg-break{page-break-before:always}

/* ── CARTÃO RESPOSTA ── */
.cartao-header{text-align:center;border:2px solid #000;padding:10pt;margin-bottom:14pt}
.cartao-header h2{font-size:13pt;font-weight:bold;text-transform:uppercase;letter-spacing:.5px}
.cartao-header p{font-size:9pt;margin-top:3pt;color:#444}
.cartao-fields{display:flex;gap:20pt;margin-bottom:12pt}
.cartao-field{flex:1;border-bottom:1.5px solid #000;padding-bottom:14pt;position:relative}
.cartao-field label{font-size:8pt;text-transform:uppercase;letter-spacing:.5px;color:#555}
.cartao-instructions{font-size:8.5pt;color:#444;margin-bottom:12pt;line-height:1.6;border:1px solid #ccc;padding:6pt 10pt;background:#f9f9f9}
.cartao-cols{display:flex;gap:0}
.cartao-col{flex:1}
.cartao-divider{width:1px;background:#000;margin:0 12pt}
.ans-row{display:flex;align-items:center;gap:5pt;margin-bottom:5pt;padding:2pt 4pt}
.ans-row:nth-child(even){background:#f5f5f5}
.ans-num{font-weight:bold;font-size:9pt;min-width:22pt;text-align:right;color:#333}
.bubble{display:inline-flex;align-items:center;justify-content:center;width:15pt;height:15pt;border:1.5px solid #333;border-radius:50%;font-size:7.5pt;font-weight:bold;cursor:default;font-family:Arial,sans-serif}

/* ── GABARITO ── */
.gab-header{text-align:center;border:2px solid #000;padding:12pt;margin-bottom:16pt}
.gab-header h2{font-size:14pt;font-weight:bold;text-transform:uppercase;letter-spacing:1px}
.gab-header p{font-size:9.5pt;margin-top:4pt;color:#444}
.gab-warning{border:2px dashed #c00;padding:8pt 12pt;text-align:center;margin-bottom:14pt;color:#c00;font-weight:bold;font-size:10pt;background:#fff8f8}
.gab-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:5pt;margin-bottom:14pt}
.gab-cell{border:1.5px solid #ccc;text-align:center;padding:5pt 2pt;border-radius:3pt}
.gab-num{font-size:7.5pt;color:#777;display:block}
.gab-ans{font-weight:bold;font-size:12pt;color:#000}
.gab-disc-breakdown{margin-top:16pt}
.gab-disc-breakdown h3{font-size:9pt;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8pt;border-bottom:1px solid #ccc;padding-bottom:4pt}
.gab-disc-row{display:flex;justify-content:space-between;font-size:9pt;padding:3pt 0;border-bottom:1px dotted #eee}

/* ── FOOTER ── */
.page-footer{text-align:right;font-size:7.5pt;color:#888;margin-top:14pt;border-top:1px solid #eee;padding-top:5pt}

@media print{
  body{margin:0}
  .no-print{display:none!important}
  .pg-break{page-break-before:always}
  .disc-hd{page-break-after:avoid}
  .question{page-break-inside:avoid}
  .ans-row{page-break-inside:avoid}
  .gab-cell{page-break-inside:avoid}
}
</style>
</head>
<body>

<!-- ══════════ PÁGINA 1 — CAPA + QUESTÕES ══════════ -->
<div class="cover-header">
  <div class="cover-top">
    <img class="cover-shield-img" src="/shield.png" alt="PC-AP" />
    <div class="cover-titles">
      <div class="institution">Polícia Civil do Estado do Amapá</div>
      <h1>Concurso Público — Simulado</h1>
      <div class="subtitle">Banca Examinadora: Fundação Carlos Chagas (FCC)</div>
    </div>
    <div style="width:56pt"></div>
  </div>
  <div class="cover-meta">
    <div class="cover-meta-item"><span class="lbl">Data de aplicação</span><span class="val">${hoje}</span></div>
    <div class="cover-meta-item"><span class="lbl">Total de questões</span><span class="val">${exam.questions.length}</span></div>
    <div class="cover-meta-item"><span class="lbl">Tempo de prova</span><span class="val">${exam.timeMinutes} min</span></div>
  </div>
</div>

<div class="candidate-fields">
  <div class="field-row">
    <div class="field"><label>Nome completo</label></div>
  </div>
  <div class="field-row">
    <div class="field"><label>Assinatura</label></div>
    <div class="field" style="max-width:120pt"><label>CPF</label></div>
  </div>
</div>

<div class="instructions">
  <h3>Instruções Gerais</h3>
  <ol>
    <li>Leia atentamente cada questão antes de responder.</li>
    <li>Assinale apenas <strong>uma</strong> alternativa por questão no Cartão Resposta.</li>
    <li>Utilize caneta esferográfica de tinta azul ou preta.</li>
    <li>Questões em branco ou com mais de uma alternativa marcada serão anuladas.</li>
    <li>Não é permitido o uso de corretivo. Rasuras invalidam a questão.</li>
    <li>O gabarito oficial está na última página — mantenha-o separado durante a prova.</li>
  </ol>
</div>

<div class="disc-summary">
  <div class="disc-summary-title">Disciplinas desta prova</div>
  <div class="disc-summary-grid">${discSummary}</div>
</div>

${questionsHTML}

<!-- ══════════ CARTÃO RESPOSTA ══════════ -->
<div class="pg-break">
  <div class="cartao-header">
    <h2>Cartão de Respostas</h2>
    <p>Polícia Civil do Amapá — Simulado FCC · ${exam.questions.length} questões · ${hoje}</p>
  </div>

  <div class="cartao-fields">
    <div class="cartao-field"><label>Nome completo</label></div>
    <div class="cartao-field" style="max-width:130pt"><label>Assinatura</label></div>
  </div>

  <div class="cartao-instructions">
    <strong>Como marcar:</strong> Preencha completamente a letra correspondente à sua resposta com caneta azul ou preta. Não use corretivo. Rasuras ou marcações duplas anulam a questão.
  </div>

  ${cartaoHTML}
  <div class="page-footer">Cartão de Respostas — PC-AP Simulados · ${hoje}</div>
</div>

<!-- ══════════ GABARITO (ÚLTIMA PÁGINA) ══════════ -->
<div class="pg-break">
  <div class="gab-header">
    <h2>⚠ Gabarito Oficial</h2>
    <p>Polícia Civil do Amapá — Simulado FCC · ${exam.questions.length} questões · ${hoje}</p>
  </div>

  <div class="gab-warning">
    ATENÇÃO: Esta página contém as respostas. Separe-a fisicamente antes de iniciar a prova.
  </div>

  <div class="gab-grid">${gabRows}</div>

  <div class="gab-disc-breakdown">
    <h3>Distribuição por Disciplina</h3>
    ${[...new Set(exam.questions.map(q=>q.disciplina))].map(d=>{
      const qs=exam.questions.filter(q=>q.disciplina===d);
      const firstQ=qs[0].numero_simulado;const lastQ=qs[qs.length-1].numero_simulado;
      return `<div class="gab-disc-row"><span>${d}</span><span>Q${firstQ}–Q${lastQ} · ${qs.length} questões</span></div>`;
    }).join("")}
  </div>

  <div class="page-footer">Gabarito Oficial — PC-AP Simulados · Não divulgue antes do fim da prova</div>
</div>

</body>
</html>`;

  const w=window.open("","_blank");
  if(w){
    w.document.write(html);
    w.document.close();
    w.addEventListener("load",()=>setTimeout(()=>w.print(),600));
    setTimeout(()=>w.print(),1200);
  }
}

/* PDF EXPORT — RESULTADO */
function exportResultsPDF(results){
  const sc=results.percent>=70?"#006600":results.percent>=50?"#cc6600":"#cc0000";
  const dr=Object.entries(results.disciplineStats).map(([d,s])=>`<div class="dr"><span>${d}</span><span>${s.correct}/${s.total} (${Math.round(s.correct/s.total*100)}%)</span></div>`).join("");
  const gg=results.questions.map(q=>{const ua=results.answers[q.numero_simulado];const ok=ua===q.correta;return`<div class="gi" style="border-color:${ua===undefined?"#888":ok?"#006600":"#cc0000"}"><div style="font-size:8pt;color:#666">${q.numero_simulado}</div><div style="font-weight:bold">${LETTERS[q.correta]||"?"}</div></div>`;}).join("");
  const rv=results.questions.map(q=>{const ua=results.answers[q.numero_simulado];const ok=ua===q.correta;const bl=ua===undefined||ua===null;return`<div class="qi ${bl?"qb":ok?"qc":"qw"}"><p><b>Q${q.numero_simulado}</b> [${q.disciplina}] — ${bl?"NÃO RESPONDIDA":ok?"✓ CORRETO":"✗ INCORRETA"}</p><p style="font-size:10pt;margin:6px 0">${(q.pergunta||"").slice(0,200)}</p>${q.alternativas.map((a,i)=>`<p class="${i===q.correta?"ac":i===ua&&!ok?"aw":""}" style="font-size:9pt">${a}${i===q.correta?" ✓":""}</p>`).join("")}</div>`;}).join("");
  const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Resultado PC-AP</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Times New Roman",serif;font-size:11pt;color:#000}.pg{padding:20mm}
.hd{border:2px solid #000;padding:16px;text-align:center;margin-bottom:20px}.sc{font-size:48pt;font-weight:bold;color:${sc}}
.st{display:flex;gap:30px;justify-content:center;margin:16px 0;font-size:13pt}.dr{display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0;font-size:10pt}
.qi{border:1px solid #ddd;border-radius:4px;padding:10px;margin:8px 0;page-break-inside:avoid}.qc{border-left:4px solid #006600}.qw{border-left:4px solid #cc0000}.qb{border-left:4px solid #888}
.ac{color:#006600;font-weight:bold}.aw{color:#cc0000}.gg{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:16px}
.gi{border:1px solid #ccc;padding:5px 3px;text-align:center;font-size:9pt}h2{margin:20px 0 10px;font-size:12pt;border-bottom:1px solid #000;padding-bottom:4px}
@media print{body{margin:0}}</style></head><body><div class="pg">
<div class="hd"><h1 style="font-size:14pt">POLÍCIA CIVIL DO AMAPÁ — RESULTADO DO SIMULADO</h1>
<p style="margin-top:6px;font-size:10pt">Data: ${new Date(results.date).toLocaleDateString("pt-BR")} | ${results.total} questões</p>
<div class="sc">${results.percent}%</div>
<div class="st"><span>✓ <b>${results.correct}</b> Acertos</span><span>✗ <b>${results.wrong}</b> Erros</span><span>— <b>${results.blank}</b> Em branco</span><span>⏱ ${fmtTime(results.timeSpent)}</span></div></div>
<h2>DESEMPENHO POR DISCIPLINA</h2>${dr}
<div style="page-break-before:always"><h2>GABARITO</h2><div class="gg">${gg}</div><h2 style="margin-top:24px">REVISÃO</h2>${rv}</div>
</div></body></html>`;
  const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),800);}
}

/* SHARED UI */
const GOLD="#c8a75d";
const S={
  card:{borderRadius:14,background:"linear-gradient(145deg,#0c1828 0%,#0e1e34 100%)",border:"1px solid rgba(200,167,93,0.16)",backdropFilter:"blur(12px)",boxShadow:"0 4px 24px rgba(0,0,0,0.5),0 1px 0 rgba(200,167,93,0.07) inset"},
  btn:(v="primary")=>({padding:"10px 20px",borderRadius:10,border:"none",fontWeight:700,cursor:"pointer",fontSize:13,transition:"all 0.2s",
    ...(v==="primary"?{background:"linear-gradient(135deg,#a8873d,#c8a75d,#dfc07a)",color:"#04060c",boxShadow:"0 4px 16px rgba(200,167,93,0.3)"}:{}),
    ...(v==="outline"?{background:"rgba(200,167,93,0.06)",color:"#dfc07a",border:"1px solid rgba(200,167,93,0.22)"}:{}),
    ...(v==="ghost"?{background:"rgba(255,255,255,0.08)",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.1)"}:{}),
    ...(v==="danger"?{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"1px solid rgba(239,68,68,0.3)"}:{}),
  }),
  tag:(c="#c8a75d")=>({padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${c}22`,color:c,border:`1px solid ${c}44`}),
};
function Badge({children,color="#c8a75d"}){return <span style={S.tag(color)}>{children}</span>;}
function Chip({label,value,icon,color="#c8a75d"}){return(<div style={{...S.card,padding:"16px 18px",display:"flex",flexDirection:"column",gap:6}}><div style={{fontSize:22}}>{icon}</div><div style={{fontSize:26,fontWeight:900,color,fontFamily:"'Courier New',monospace"}}>{value}</div><div style={{fontSize:10,color:"#475569",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>{label}</div></div>);}
function ProgressBar({value,color="#c8a75d",height=6}){return(<div style={{height,borderRadius:height/2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,value))}%`,background:color,borderRadius:height/2,transition:"width 0.6s ease"}}/></div>);}

/* LOADING SCREEN */
/* ═══════════════════════════════════════════════════════════════
   QUESTION CARD — TecConcursos style rendering
═══════════════════════════════════════════════════════════════ */
function QuestionCard({q, numero, interactive=false, userAnswer=null, onAnswer=null, showResult=false, compact=false}){
  const di=DISCIPLINE_ORDER.indexOf(q.disciplina);
  const dc=DISC_COLORS[di>=0?di:0]||"#64b5f6";

  /* Build header text */
  const hdr=q.cabecalho||(([q.banca,q.orgao,q.cargo,q.ano].filter(Boolean).join(' — '))||null);

  /* Strip HTML tags for plain-text preview */
  const stripTags=s=>(s||"").replace(/<[^>]*>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");

  /* Alt text: remove leading "A) " prefix if already embedded in JSON */
  const cleanAlt=(a,i)=>{
    if(!a) return '';
    let s=a.trim();
    // Strip plain letter prefix: "a) text" → "text"
    s=s.replace(/^[a-eA-E]\)\s*/,'');
    // Strip inside HTML: "<em>a) text" → "<em>text"
    s=s.replace(/^(<(?:em|strong|i|b|u)>)\s*[a-eA-E]\)\s*/i,'$1');
    // Strip standalone prefix: "<em>a) </em>text" → "text"
    s=s.replace(/^<(?:em|strong|i|b|u)>\s*[a-eA-E]\)\s*<\/(?:em|strong|i|b|u)>\s*/i,'');
    // NOTE: NO full-em→full-u conversion.
    // Underlines are applied at DATA level via pdfplumber (<u>word</u> in JSON).
    // <em> in alts renders as italic (faithful to PDF italic formatting).
    return s.trim();
  };

  const qNum=numero||q.numero_original;

  /* ── alternative rendering ── */
  const renderAlt=(alt,idx)=>{
    const isSelected=userAnswer===idx;
    const isCorrect=q.correta===idx;
    let bg="rgba(255,255,255,0.025)",bc="rgba(255,255,255,0.08)",col="#92aac8",lBg="rgba(200,167,93,0.08)",lCol="#c8a75d";
    if(isSelected){bg="rgba(200,167,93,0.08)";bc="rgba(200,167,93,0.45)";col="#edf2f7";lBg="rgba(200,167,93,0.2)";lCol="#dfc07a";}
    if(showResult&&isCorrect){bg="rgba(52,211,153,0.08)";bc="rgba(52,211,153,0.4)";col="#34d399";lBg="rgba(52,211,153,0.2)";lCol="#34d399";}
    if(showResult&&isSelected&&!isCorrect){bg="rgba(248,113,113,0.08)";bc="rgba(248,113,113,0.4)";col="#f87171";lBg="rgba(248,113,113,0.2)";lCol="#f87171";}
    return(
      <div key={idx}
        onClick={interactive&&onAnswer?()=>onAnswer(idx):undefined}
        style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",borderRadius:10,border:`1px solid ${bc}`,background:bg,color:col,cursor:interactive?"pointer":"default",transition:"all 0.18s",marginBottom:6}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:lBg,color:lCol,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,flexShrink:0,border:`1.5px solid ${bc}`,fontFamily:"Arial,sans-serif"}}>
          {LETTERS[idx]}
        </div>
        <div className="fcc-html fcc-alt-text"
          dangerouslySetInnerHTML={{__html:renderHTML(cleanAlt(alt,idx))}}/>
        {showResult&&isCorrect&&<span style={{color:"#34d399",fontSize:16,flexShrink:0,paddingTop:4}}>✓</span>}
        {showResult&&isSelected&&!isCorrect&&<span style={{color:"#f87171",fontSize:16,flexShrink:0,paddingTop:4}}>✗</span>}
      </div>
    );
  };

  return(
    <div style={{borderRadius:14,background:"linear-gradient(145deg,#080f1c,#0a1627)",border:"1px solid rgba(200,167,93,0.14)",overflow:"hidden"}}>

      {/* ── Header bar (FCC meta) ── */}
      {hdr&&(
        <div style={{background:"linear-gradient(90deg,rgba(8,16,32,0.95),rgba(12,22,44,0.7))",borderBottom:"1px solid rgba(200,167,93,0.12)",padding:"7px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10.5,color:"#c8a75d",fontFamily:"'JetBrains Mono',monospace",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {qNum&&<strong style={{color:"#c8a75d",marginRight:6}}>#{qNum}</strong>}{hdr}
          </span>
          {q.linkTec&&(
            <a href={q.linkTec} target="_blank" rel="noreferrer" style={{color:"#c8a75d",fontSize:13,textDecoration:"none",flexShrink:0}} title="Abrir no TEC Concursos">🔗</a>
          )}
        </div>
      )}

      <div style={{padding:"16px 18px"}}>

        {/* ── Discipline / meta badges ── */}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
          <Badge color={dc}>{q.disciplina}</Badge>
          {q.ano&&<Badge color="#334155">{q.banca||"FCC"} · {q.ano}</Badge>}
        </div>

        {/* ── Texto de Apoio ── */}
        {q.texto_apoio&&(
          <div className="fcc-apoio-wrap">
            {q.texto_apoio_titulo&&(()=>{
              // Não exibir se o titulo já aparece como apoio-title no corpo do apoio
              const t=q.texto_apoio_titulo.replace(/<[^>]+>/g,'').trim();
              const bodyHasSameTitle=q.texto_apoio&&
                q.texto_apoio.includes('apoio-title')&&
                q.texto_apoio.replace(/<[^>]+>/g,'').includes(t.substring(0,Math.min(t.length,25)));
              if(bodyHasSameTitle)return null;
              return<div className="fcc-html fcc-apoio-titulo"
                dangerouslySetInnerHTML={{__html:renderHTML(q.texto_apoio_titulo)}}/>;
            })()}
            <div className="fcc-html fcc-apoio-body"
              dangerouslySetInnerHTML={{__html:renderHTML(q.texto_apoio)}}/>
          </div>
        )}

        {/* ── Divider between apoio and pergunta ── */}
        {q.texto_apoio&&<div className="fcc-apoio-pergunta-divider"/>}

        {/* ── Image (between apoio and pergunta) ── */}
        {q.imagem&&(
          <div className="fcc-q-img-wrap">
            <img
              src={q.imagem.startsWith('http')||q.imagem.startsWith('/')?q.imagem:`/assets/questions/${q.imagem}`}
              alt="Figura da questão"
              className="fcc-q-img"
              style={{maxHeight:500}}
              onError={e=>{e.target.parentElement.style.display="none";}}
            />
          </div>
        )}

        {/* ── Pergunta principal ── */}
        <div className="fcc-pergunta-wrap">
          <div className="fcc-html fcc-pergunta"
            dangerouslySetInnerHTML={{__html:renderHTML(q.pergunta)}}/>
        </div>

        {/* ── Alternatives ── */}
        <div style={{marginBottom:4}}>
          {q.alternativas.map((alt,idx)=>renderAlt(alt,idx))}
        </div>

        {/* ── TEC Concursos button ── */}
        {q.linkTec&&(
          <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
            <a href={q.linkTec} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:10,background:"rgba(56,189,248,0.08)",border:"1px solid rgba(56,189,248,0.25)",color:"#c8a75d",textDecoration:"none",fontSize:12,fontWeight:700,transition:"all 0.2s"}}>
              <span style={{fontSize:14}}>🔗</span>
              <span>Abrir no TEC Concursos</span>
              <span style={{fontSize:10,opacity:.7}}>↗</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}

function LoadingScreen({progress,error}){
  return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,background:"radial-gradient(ellipse at 20% 20%,#0d1930 0%,#080c1a 50%,#04060e 100%)"}}>
    <img src="/shield.png" alt="PC-AP" style={{width:90,height:"auto",objectFit:"contain",marginBottom:12}} />
    <div style={{fontSize:11,fontWeight:900,letterSpacing:4,color:"#c8a75d",fontFamily:"'Courier New',monospace"}}>PC-AP SIMULADOS</div>
    {error?(<div style={{maxWidth:480,textAlign:"center"}}>
      <div style={{color:"#f87171",fontSize:14,fontWeight:700,marginBottom:8}}>⚠ Erro ao carregar banco de questões</div>
      <div style={{color:"#7fa8c9",fontSize:12,fontFamily:"monospace",padding:"12px",borderRadius:8,background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)"}}>{error}</div>
      <div style={{marginTop:16,color:"#536880",fontSize:11}}>Verifique se <code style={{color:"#c8a75d"}}>public/questions/database.json</code> existe.</div>
    </div>):(<>
      <div style={{maxWidth:280,width:"100%",height:4,borderRadius:2,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#a8873d,#c8a75d,#dfc07a)",borderRadius:2,transition:"width 0.3s"}}/>
      </div>
      <div style={{fontSize:11,color:"#475569",fontFamily:"monospace"}}>Carregando banco de questões... {progress}%</div>
    </>)}
  </div>);
}

/* NAVBAR */
function NavBar({view,setView,qCount,resetHistory}){
  const items=[{id:"home",icon:"⬡",label:"Dashboard"},{id:"bank",icon:"◈",label:"Banco"},{id:"generator",icon:"⚡",label:"Simulado"},{id:"history",icon:"◎",label:"Histórico"}];
  return(<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,height:58,className:"nav-root",display:"flex",alignItems:"center",padding:"0 16px",gap:4}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginRight:12,flexShrink:0}}>
      <img src="/shield.png" alt="PC-AP" style={{width:38,height:38,objectFit:"contain",borderRadius:6,flexShrink:0}} />
      <div><div style={{fontSize:9,fontWeight:700,letterSpacing:4,color:"#c8a75d",fontFamily:"'JetBrains Mono','Courier New',monospace"}}>PC-AP</div><div style={{fontSize:8,color:"#475569",letterSpacing:1}}>SIMULADOS</div></div>
    </div>
    <div style={{display:"flex",gap:2,flex:1}}>
      {items.map(n=>(<button key={n.id} onClick={()=>setView(n.id)} style={{padding:"6px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,transition:"all 0.2s",background:view===n.id?"rgba(200,167,93,0.08)":"transparent",color:view===n.id?"#64b5f6":"#475569",display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:14}}>{n.icon}</span><span>{n.label}</span></button>))}
    </div>
    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
      <div style={{padding:"4px 10px",borderRadius:20,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.2)",fontSize:10,color:"#c8a75d",fontWeight:700,fontFamily:"monospace"}}>{qCount} Q</div>
      <button onClick={()=>{if(confirm("Resetar anti-repetição? As questões poderão ser usadas novamente."))resetHistory();}} style={{...S.btn("danger"),padding:"5px 10px",fontSize:10}}>↺ Reset</button>
    </div>
  </nav>);
}

/* HOME VIEW */
function HomeView({stats,history,setView,currentExam,dbInfo,dbUpdated,favorites}){
  const last=history.slice(0,5);
  const avg=history.length?Math.round(history.reduce((s,e)=>s+e.percent,0)/history.length):0;
  return(<div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px"}}>
    {dbUpdated&&(<div style={{marginBottom:16,padding:"12px 18px",borderRadius:12,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:18}}>🔄</span>
      <div><div style={{fontSize:13,fontWeight:700,color:"#34d399"}}>Banco atualizado para v{dbInfo?.version}</div><div style={{fontSize:11,color:"#475569"}}>Novas questões disponíveis. Progresso e histórico preservados.</div></div>
    </div>)}
    <div style={{borderRadius:20,padding:"32px 28px",marginBottom:24,position:"relative",overflow:"hidden",background:"linear-gradient(135deg,rgba(6,10,20,0.97),rgba(10,18,36,0.95),rgba(6,10,20,0.97))",border:"1px solid rgba(200,167,93,0.2)",boxShadow:"0 0 60px rgba(56,189,248,0.05)"}}>
      <div style={{position:"absolute",right:-10,top:-10,fontSize:160,opacity:0.04,transform:"rotate(-10deg)",pointerEvents:"none"}}><img src="/shield.png" alt="" style={{width:"100%",height:"auto",opacity:0.15,objectFit:"contain"}} /></div>
      <div style={{position:"absolute",bottom:-20,left:-10,fontSize:120,opacity:0.03,pointerEvents:"none"}}>⚖️</div>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <Badge color="#38bdf8">POLÍCIA CIVIL DO AMAPÁ</Badge>
          <Badge color="#34d399">● SISTEMA ONLINE</Badge>
          {dbInfo&&<Badge color="#475569">banco v{dbInfo.version} · {dbInfo.updatedAt}</Badge>}
          {currentExam&&<Badge color="#fbbf24">▶ SIMULADO EM ANDAMENTO</Badge>}
        </div>
        <h1 style={{fontSize:"clamp(20px,4vw,34px)",fontWeight:900,margin:"0 0 22px",fontFamily:"'Courier New',monospace",background:"linear-gradient(90deg,#e2e8f0,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>PLATAFORMA DE SIMULADOS</h1>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>setView("generator")} style={{...S.btn("primary"),fontSize:13,padding:"11px 22px"}}>⚡ Gerar Simulado</button>
          <button onClick={()=>setView("bank")} style={{...S.btn("outline"),fontSize:13,padding:"11px 22px"}}>◈ Ver Banco de Questões</button>
          {currentExam&&<button onClick={()=>setView("exam")} style={{padding:"11px 22px",borderRadius:10,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:"linear-gradient(135deg,#f59e0b,#f97316)",color:"#fff",animation:"pulse 2s infinite"}}>▶ Continuar Prova</button>}
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:14,marginBottom:24}}>
      <Chip icon="◈" label="No Banco" value={stats.total} color="#38bdf8"/>
      <Chip icon="✓" label="Realizadas" value={stats.used} color="#34d399"/>
      <Chip icon="%" label="Concluído" value={`${stats.percent}%`} color="#fbbf24"/>
      <Chip icon="◎" label="Simulados" value={history.length} color="#64b5f6"/>
      {history.length>0&&<Chip icon="★" label="Média Geral" value={`${avg}%`} color={avg>=70?"#34d399":avg>=50?"#fbbf24":"#f87171"}/>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
      <div style={{...S.card,padding:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"#c8a75d",letterSpacing:3,fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>PROGRESSO POR DISCIPLINA</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {DISCIPLINE_ORDER.map((d,i)=>{const ds=stats.byDisc[d]||{total:0,used:0};const pct=ds.total>0?Math.round(ds.used/ds.total*100):0;return(<div key={d}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:"#536880"}}>{DISC_SHORT[i]}</span><span style={{fontSize:10,color:DISC_COLORS[i],fontWeight:700,fontFamily:"monospace"}}>{ds.used}/{ds.total}</span></div><ProgressBar value={pct} color={DISC_COLORS[i]} height={5}/></div>);})}
        </div>
      </div>
      <div style={{...S.card,padding:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"#c8a75d",letterSpacing:3,fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>ÚLTIMOS SIMULADOS</div>
        {last.length===0?(<div style={{textAlign:"center",padding:"30px 0",color:"#536880"}}><div style={{fontSize:48,marginBottom:10,opacity:.5}}>◎</div><div style={{fontSize:12}}>Nenhum simulado realizado</div><button onClick={()=>setView("generator")} style={{...S.btn("outline"),marginTop:14,fontSize:11,padding:"7px 14px"}}>Criar primeiro simulado</button></div>):(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {last.map((e,i)=>{const sc=e.percent>=70?"#34d399":e.percent>=50?"#fbbf24":"#f87171";return(<div key={i} style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,fontWeight:700,color:"#cbd5e1"}}>Simulado #{history.length-i}</div><div style={{fontSize:10,color:"#475569"}}>{new Date(e.date).toLocaleDateString("pt-BR")} • {e.total}Q • {fmtTime(e.timeSpent)}</div></div><div style={{fontFamily:"monospace",fontSize:20,fontWeight:900,color:sc}}>{e.percent}%</div></div>);})}
            <button onClick={()=>setView("history")} style={{...S.btn("ghost"),fontSize:11,padding:"7px 14px",marginTop:4}}>Ver histórico completo →</button>
          </div>
        )}
      </div>
    </div>
    <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 10px rgba(245,158,11,0)}}`}</style>
  </div>);
}

/* BANK VIEW */
function BankView({questions,usedIds,dbInfo}){
  const [search,setSearch]=useState("");const [fDisc,setFDisc]=useState("all");const [fUsed,setFUsed]=useState("all");const [fAno,setFAno]=useState("all");const [page,setPage]=useState(0);const [expanded,setExpanded]=useState(null);const PS=15;
  const anos=useMemo(()=>{const s=new Set(questions.map(q=>q.ano).filter(Boolean));return[...s].sort((a,b)=>b-a);},[questions]);
  const filtered=useMemo(()=>questions.filter(q=>{if(fDisc!=="all"&&q.disciplina!==fDisc)return false;if(fUsed==="used"&&!usedIds.includes(q.id))return false;if(fUsed==="unused"&&usedIds.includes(q.id))return false;if(fAno!=="all"&&String(q.ano)!==fAno)return false;if(search&&!q.pergunta?.toLowerCase().includes(search.toLowerCase())&&!q.assunto?.toLowerCase().includes(search.toLowerCase()))return false;return true;}),[questions,fDisc,fUsed,fAno,search,usedIds]);
  const pages=Math.ceil(filtered.length/PS);const paged=filtered.slice(page*PS,(page+1)*PS);
  const sel={padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"#0a0e1a",color:"#e2e8f0",fontSize:12};
  return(<div style={{maxWidth:1050,margin:"0 auto",padding:"24px 16px"}}>
    <div style={{marginBottom:20}}><h2 style={{fontSize:22,fontWeight:900,margin:"0 0 4px",fontFamily:"monospace"}}>◈ BANCO DE QUESTÕES</h2><p style={{color:"#7fa8c9",fontSize:12}}>{questions.length} questões carregadas • {filtered.length} exibidas{dbInfo&&` • banco v${dbInfo.version} (${dbInfo.updatedAt})`}</p></div>
    <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
      <input placeholder="🔍 Buscar..." value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} style={{flex:1,minWidth:200,padding:"8px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
      <select value={fDisc} onChange={e=>{setFDisc(e.target.value);setPage(0);}} style={sel}><option value="all">Todas as disciplinas</option>{DISCIPLINE_ORDER.map(d=><option key={d} value={d}>{d}</option>)}</select>
      <select value={fAno} onChange={e=>{setFAno(e.target.value);setPage(0);}} style={sel}><option value="all">Todos os anos</option>{anos.map(a=><option key={a} value={String(a)}>{a}</option>)}</select>
      <select value={fUsed} onChange={e=>{setFUsed(e.target.value);setPage(0);}} style={sel}><option value="all">Todas</option><option value="unused">Disponíveis</option><option value="used">Utilizadas</option></select>
    </div>
    {paged.length===0?(<div style={{textAlign:"center",padding:"60px 0",color:"#536880"}}><div style={{fontSize:60,opacity:.4}}>◈</div><div style={{fontSize:14,marginTop:12}}>Nenhuma questão encontrada</div></div>):(
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {paged.map(q=>{
          const used=usedIds.includes(q.id);
          const isExp=expanded===q.id;
          const di=DISCIPLINE_ORDER.indexOf(q.disciplina);
          const dc=DISC_COLORS[di>=0?di:0]||"#64b5f6";
          const preview=(q.pergunta||"").replace(/<[^>]*>/g,"").slice(0,160);
          return(
            <div key={q.id} style={{opacity:used?.7:1,transition:"opacity 0.2s"}}>
              {!isExp?(
                /* ── Collapsed preview ── */
                <div style={{...S.card,padding:"12px 16px",cursor:"pointer",borderColor:"rgba(255,255,255,0.06)"}}
                  onClick={()=>setExpanded(q.id)}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                        <Badge color={dc}>{q.disciplina}</Badge>
                             {q.ano&&<Badge color="#334155">{q.banca||"FCC"} · {q.ano}</Badge>}
                        {used&&<Badge color="#f59e0b">✓ Usada</Badge>}
                      </div>
                      <p style={{fontSize:12,color:"#8fb5cc",margin:0,lineHeight:1.6}}>{preview}{preview.length>=160?"...":""}</p>
                    </div>
                    <span style={{color:"#536880",fontSize:12,flexShrink:0,marginTop:2}}>▼</span>
                  </div>
                </div>
              ):(
                /* ── Expanded full QuestionCard ── */
                <div style={{border:"1px solid rgba(200,167,93,0.18)",borderRadius:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 16px",background:"rgba(200,167,93,0.04)",borderBottom:"1px solid rgba(200,167,93,0.08)",borderRadius:"14px 14px 0 0"}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {used&&<Badge color="#f59e0b">✓ Já utilizada em simulado</Badge>}
                      <span style={{fontSize:9,color:"#c8a75d",fontFamily:"'JetBrains Mono',monospace"}}>ID: {q.id}</span>
                    </div>
                    <button onClick={()=>setExpanded(null)} style={{...S.btn("ghost"),padding:"3px 12px",fontSize:11}}>▲ Fechar</button>
                  </div>
                  <QuestionCard q={q} numero={q.numero_original}/>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )}
    {pages>1&&(<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:20}}><button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{...S.btn("ghost"),padding:"6px 14px",fontSize:13}}>‹</button><span style={{fontSize:12,color:"#536880",fontFamily:"monospace"}}>{page+1} / {pages}</span><button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} style={{...S.btn("ghost"),padding:"6px 14px",fontSize:13}}>›</button></div>)}
  </div>);
}

/* GENERATOR VIEW */
function GeneratorView({questions,usedIds,startExam,notify}){
  const [cfg,setCfg]=useState({disciplineConfig:Object.fromEntries(DISCIPLINE_ORDER.map(d=>[d,0])),mode:"prova",timeMinutes:120});
  const total=Object.values(cfg.disciplineConfig).reduce((a,b)=>a+b,0);
  const avail=useMemo(()=>{const r={};DISCIPLINE_ORDER.forEach(d=>{r[d]=questions.filter(q=>q.disciplina===d&&!usedIds.includes(q.id)).length;});return r;},[questions,usedIds]);
  const allAvail=useMemo(()=>{const r={};DISCIPLINE_ORDER.forEach(d=>{r[d]=questions.filter(q=>q.disciplina===d).length;});return r;},[questions]);
  const presets=[
    {label:"PC-AP Oficial 60Q",icon:"🛡️",vals:{"Língua Portuguesa":10,"História e Geografia do Amapá":5,"Raciocínio Lógico-Matemático":5,"Noções de Informática":5,"Direitos Humanos":5,"Direito Administrativo":7,"Direito Constitucional":7,"Direito Penal":8,"Direito Processual Penal":8}},
    {label:"Só Direito 30Q",icon:"⚖️",vals:{"Direitos Humanos":4,"Direito Administrativo":8,"Direito Constitucional":8,"Direito Penal":6,"Direito Processual Penal":4}},
    {label:"Língua Portuguesa",icon:"📝",vals:{"Língua Portuguesa":10}},
    {label:"Rápido 20Q",icon:"⚡",vals:{"Língua Portuguesa":5,"Direito Constitucional":5,"Direito Penal":5,"Direito Processual Penal":5}},
  ];
  const setDisc=(d,v)=>setCfg(p=>({...p,disciplineConfig:{...p.disciplineConfig,[d]:Math.max(0,Math.min(avail[d]||0,v))}}));
  const [previewExam,setPreviewExam]=useState(null);
  const handle=()=>{
    if(!total){notify("Configure pelo menos uma disciplina","error");return;}
    const exam=generateExam(cfg,questions,usedIds);
    if(!exam.questions.length){notify("Todas as questões foram utilizadas! Resete o histórico.","error");return;}
    if(exam.warnings?.length){const msg=exam.warnings.map(w=>`${w.disc}: ${w.available}/${w.requested}`).join("\n");if(!confirm(`Questões insuficientes:\n${msg}\n\nContinuar?`))return;}
    setPreviewExam(exam);
  };
  return(<div style={{maxWidth:800,margin:"0 auto",padding:"24px 16px"}}>
    <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 6px",fontFamily:"monospace"}}>⚡ GERAR SIMULADO</h2>
    <p style={{color:"#8fb5cc",fontSize:13,marginBottom:24}}>Questões organizadas na ordem oficial das disciplinas do concurso.</p>
    <div style={{...S.card,padding:18,marginBottom:20}}>
      <div style={{fontSize:10,fontWeight:700,color:"#c8a75d",letterSpacing:3,fontFamily:"'JetBrains Mono',monospace",marginBottom:12}}>MODELOS RÁPIDOS</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {presets.map(p=><button key={p.label} onClick={()=>setCfg(prev=>({...prev,disciplineConfig:{...Object.fromEntries(DISCIPLINE_ORDER.map(d=>[d,0])),...p.vals}}))} style={{...S.btn("outline"),padding:"7px 14px",fontSize:12}}>{p.icon} {p.label}</button>)}
        <button onClick={()=>setCfg(p=>({...p,disciplineConfig:Object.fromEntries(DISCIPLINE_ORDER.map(d=>[d,0]))}))} style={{...S.btn("ghost"),padding:"7px 14px",fontSize:12}}>↺ Limpar</button>
      </div>
    </div>
    <div style={{...S.card,padding:20,marginBottom:20}}>
      <div style={{fontSize:10,fontWeight:700,color:"#c8a75d",letterSpacing:3,fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>QUESTÕES POR DISCIPLINA</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {DISCIPLINE_ORDER.map((d,i)=>{const v=cfg.disciplineConfig[d]||0;const av=avail[d]||0;const tot=allAvail[d]||0;const active=v>0;return(
          <div key={d} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:active?"rgba(200,167,93,0.07)":"rgba(255,255,255,0.02)",border:`1px solid ${active?"rgba(200,167,93,0.2)":"rgba(255,255,255,0.05)"}`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:DISC_COLORS[i],flexShrink:0}}/>
            <span style={{flex:1,fontSize:12,fontWeight:600,color:active?"#e2e8f0":"#475569"}}>{d}</span>
            <span style={{fontSize:10,color:"#c8a75d",fontFamily:"'JetBrains Mono',monospace",minWidth:70,textAlign:"right"}}>{av}/{tot} livre</span>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <button onClick={()=>setDisc(d,v-1)} style={{width:22,height:22,borderRadius:5,border:"none",background:"rgba(255,255,255,0.06)",color:"#94a3b8",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>−</button>
              <input type="number" min={0} max={av} value={v} onChange={e=>setDisc(d,parseInt(e.target.value)||0)} style={{width:44,textAlign:"center",padding:"4px",borderRadius:6,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#e2e8f0",fontSize:12,outline:"none"}}/>
              <button onClick={()=>setDisc(d,v+1)} disabled={v>=av} style={{width:22,height:22,borderRadius:5,border:"none",background:"rgba(255,255,255,0.06)",color:v>=av?"#334155":"#94a3b8",cursor:v>=av?"not-allowed":"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
            </div>
            {av===0&&tot>0&&<span style={{fontSize:9,color:"#f59e0b"}}>★ Esgotado</span>}
            {tot===0&&<span style={{fontSize:9,color:"#536880"}}>Sem questões</span>}
          </div>);})}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderRadius:10,background:"rgba(200,167,93,0.08)",border:"1px solid rgba(200,167,93,0.18)",marginTop:4}}>
          <span style={{fontSize:12,fontWeight:700,color:"#dfc07a",fontFamily:"monospace"}}>TOTAL DE QUESTÕES</span>
          <span style={{fontSize:28,fontWeight:900,color:"#c8a75d",fontFamily:"monospace"}}>{total}</span>
        </div>
      </div>
    </div>
    <div style={{...S.card,padding:20,marginBottom:20}}>
      <div style={{fontSize:10,fontWeight:700,color:"#c8a75d",letterSpacing:3,fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>CONFIGURAÇÕES</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div><div style={{fontSize:10,color:"#475569",fontWeight:700,marginBottom:10,letterSpacing:1}}>MODO</div>
          <div style={{display:"flex",gap:8}}>
            {[{v:"prova",icon:"🏆",l:"PROVA",d:"Gabarito no final"},{v:"treino",icon:"📖",l:"TREINO",d:"Feedback imediato"}].map(m=>(
              <button key={m.v} onClick={()=>setCfg(p=>({...p,mode:m.v}))} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",textAlign:"center",border:`1px solid ${cfg.mode===m.v?"rgba(200,167,93,0.4)":"rgba(255,255,255,0.07)"}`,background:cfg.mode===m.v?"rgba(200,167,93,0.08)":"rgba(255,255,255,0.02)",color:cfg.mode===m.v?"#64b5f6":"#475569"}}>
                <div style={{fontSize:20,marginBottom:4}}>{m.icon}</div><div style={{fontSize:10,fontWeight:700,letterSpacing:1}}>{m.l}</div><div style={{fontSize:9,marginTop:2,opacity:.7}}>{m.d}</div>
              </button>))}
          </div>
        </div>
        <div><div style={{fontSize:10,color:"#475569",fontWeight:700,marginBottom:10,letterSpacing:1}}>TEMPO (MIN)</div>
          <input type="number" min={10} max={360} value={cfg.timeMinutes} onChange={e=>setCfg(p=>({...p,timeMinutes:parseInt(e.target.value)||120}))} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#e2e8f0",fontSize:20,fontFamily:"monospace",fontWeight:700,outline:"none",textAlign:"center"}}/>
          <div style={{fontSize:10,color:"#536880",marginTop:6,textAlign:"center"}}>= {fmtTime(cfg.timeMinutes*60)} de prova</div>
        </div>
      </div>
    </div>
    {!previewExam?(
      <button onClick={handle} disabled={total===0} style={{width:"100%",padding:"16px",borderRadius:14,border:"none",fontWeight:800,fontSize:15,cursor:total===0?"not-allowed":"pointer",transition:"all 0.3s",fontFamily:"monospace",letterSpacing:1,background:total===0?"rgba(200,167,93,0.07)":"linear-gradient(135deg,#a8873d,#c8a75d,#dfc07a)",color:total===0?"#c8a755":"#fff",boxShadow:total>0?"0 8px 32px rgba(200,167,93,0.35)":"none"}}>
        {total===0?"— Configure as disciplinas acima —":`⚡ GERAR SIMULADO • ${total} QUESTÕES`}
      </button>
    ):(
      <div style={{borderRadius:16,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.3)",padding:"22px 24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <div style={{width:42,height:42,borderRadius:12,background:"rgba(52,211,153,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>✅</div>
          <div>
            <div style={{fontSize:15,fontWeight:900,color:"#34d399",fontFamily:"monospace"}}>SIMULADO GERADO!</div>
            <div style={{fontSize:12,color:"#475569",marginTop:2}}>{previewExam.questions.length} questões • {previewExam.timeMinutes} min • {previewExam.mode==="prova"?"Modo Prova":"Modo Treino"}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>{startExam(previewExam);setPreviewExam(null);}} style={{...S.btn("primary"),flex:1,minWidth:160,padding:"14px",fontSize:14,fontWeight:800}}>
            ▶ Iniciar Prova
          </button>
          <button onClick={()=>exportExamPDF(previewExam)} style={{...S.btn("outline"),flex:1,minWidth:160,padding:"14px",fontSize:14,fontWeight:800}}>
            📄 Baixar PDF da Prova
          </button>
          <button onClick={()=>setPreviewExam(null)} style={{...S.btn("ghost"),padding:"14px 18px",fontSize:13}}>
            ↩ Refazer
          </button>
        </div>
        <div style={{marginTop:12,fontSize:11,color:"#475569",lineHeight:1.6,borderTop:"1px solid rgba(52,211,153,0.15)",paddingTop:10}}>
          O PDF inclui: <strong style={{color:"#94a3b8"}}>capa profissional</strong> · <strong style={{color:"#94a3b8"}}>questões FCC</strong> · <strong style={{color:"#94a3b8"}}>cartão de respostas</strong> · <strong style={{color:"#94a3b8"}}>gabarito em página separada</strong>
        </div>
      </div>
    )}
  </div>);
}

/* EXAM VIEW */
function ExamView({exam,finishExam,setView}){
  const [answers,setAnswers]=useState({});const [cur,setCur]=useState(0);const [tLeft,setTLeft]=useState((exam?.timeMinutes||120)*60);const [tSpent,setTSpent]=useState(0);const [flagged,setFlagged]=useState(new Set());const [showConfirm,setShowConfirm]=useState(false);const [showGrid,setShowGrid]=useState(false);const timerRef=useRef();
  useEffect(()=>{
    const handler=(e)=>{
      if(!exam||showConfirm||showGrid)return;
      // Skip if user typing in input
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      // 1-5 → select alternatives A-E
      if(e.key>="1"&&e.key<="5"){
        const idx=parseInt(e.key)-1;
        const q=exam.questions[cur];if(!q)return;
        setAnswers(a=>({...a,[q.id]:idx}));
        e.preventDefault();
      }
      // ← / → → navigate questions
      else if(e.key==="ArrowRight"||e.key==="PageDown"){
        if(cur<exam.questions.length-1)setCur(cur+1);
        e.preventDefault();
      }
      else if(e.key==="ArrowLeft"||e.key==="PageUp"){
        if(cur>0)setCur(cur-1);
        e.preventDefault();
      }
      // F → flag/unflag
      else if(e.key==="f"||e.key==="F"){
        const q=exam.questions[cur];if(!q)return;
        setFlagged(s=>{const ns=new Set(s);ns.has(q.id)?ns.delete(q.id):ns.add(q.id);return ns;});
        e.preventDefault();
      }
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[exam,cur,showConfirm,showGrid]);

  useEffect(()=>{if(!exam)return;timerRef.current=setInterval(()=>{setTLeft(t=>{if(t<=1){clearInterval(timerRef.current);return 0;}return t-1;});setTSpent(s=>s+1);},1000);return()=>clearInterval(timerRef.current);},[exam]);
  useEffect(()=>{if(tLeft===0&&exam)finishExam(answers,tSpent);},[tLeft]);
  if(!exam)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",flexDirection:"column",gap:16}}><div style={{fontSize:48,opacity:.5}}>◎</div><p style={{color:"#475569"}}>Nenhum simulado ativo</p><button onClick={()=>setView("generator")} style={S.btn("primary")}>Criar Simulado</button></div>);
  const q=exam.questions[cur];const total=exam.questions.length;const answered=Object.keys(answers).filter(k=>answers[k]!==undefined&&answers[k]!==null).length;const isTreino=exam.mode==="treino";const pct=(answered/total)*100;const tcol=tLeft<300?"#f87171":tLeft<600?"#fbbf24":"#34d399";const di=DISCIPLINE_ORDER.indexOf(q?.disciplina);const dc=DISC_COLORS[di>=0?di:0];
  const answer=(num,idx)=>{setAnswers(p=>({...p,[num]:idx}));if(isTreino&&cur<total-1)setTimeout(()=>setCur(c=>c+1),700);};
  const toggleFlag=num=>setFlagged(p=>{const n=new Set(p);n.has(num)?n.delete(num):n.add(num);return n;});
  return(<div style={{minHeight:"100vh",background:"linear-gradient(160deg,#080c1a,#0c1228)",display:"flex",flexDirection:"column"}}>
    <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,12,26,0.97)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,255,255,0.05)",padding:"10px 20px"}}>
      <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><Badge color={isTreino?"#34d399":"#f87171"}>{isTreino?"📖 TREINO":"🏆 PROVA"}</Badge><span style={{fontSize:12,color:"#475569",fontFamily:"monospace"}}>{answered}/{total} respondidas</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${tcol}33`}}><span style={{fontSize:12}}>⏱</span><span style={{fontSize:22,fontWeight:900,color:tcol,fontFamily:"monospace"}}>{fmtTime(tLeft)}</span></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>exportExamPDF(exam)} style={{...S.btn("ghost"),padding:"6px 12px",fontSize:12,color:"#c8a75d",borderColor:"rgba(56,189,248,0.3)"}}>📄 PDF</button>
          <button onClick={()=>setShowGrid(!showGrid)} style={{...S.btn("ghost"),padding:"6px 12px",fontSize:12}}>⊞ Grade</button>
          <button onClick={()=>setShowConfirm(true)} style={{...S.btn("primary"),padding:"6px 16px",fontSize:12}}>✔ Finalizar</button>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"6px auto 0",height:3,background:"rgba(255,255,255,0.04)",borderRadius:2}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${dc},#c8a75d)`,borderRadius:2,transition:"width 0.4s"}}/></div>
    </div>
    <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px",flex:1,display:"flex",gap:20,width:"100%",boxSizing:"border-box"}}>
      <div style={{flex:1,minWidth:0,minHeight:0}}>
        {/* Flag button row */}
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
          <button onClick={()=>toggleFlag(q.numero_simulado)}
            style={{...S.btn(flagged.has(q.numero_simulado)?"outline":"ghost"),padding:"5px 14px",fontSize:11,...(flagged.has(q.numero_simulado)?{color:"#fbbf24",borderColor:"rgba(251,191,36,0.4)",background:"rgba(251,191,36,0.1)"}:{})}}>
            {flagged.has(q.numero_simulado)?"🚩 Marcada":"⚑ Marcar"}
          </button>
        </div>

        {/* Full TecConcursos-style question card */}
        <QuestionCard
          q={q}
          numero={q.numero_simulado}
          interactive={true}
          userAnswer={answers[q.numero_simulado]??null}
          onAnswer={(idx)=>answer(q.numero_simulado,idx)}
          showResult={isTreino&&answers[q.numero_simulado]!==undefined}
        />

        {/* Navigation */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setCur(c=>Math.max(0,c-1))} disabled={cur===0} style={{...S.btn("ghost"),opacity:cur===0?.4:1,padding:"9px 18px"}}>← Anterior</button>
            <div style={{display:"none",alignItems:"center",gap:6,fontSize:9,color:"#4a6078",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1}} className="kbd-hints">
              <kbd style={{padding:"2px 5px",borderRadius:3,background:"rgba(200,167,93,0.08)",border:"1px solid rgba(200,167,93,0.18)",color:"#c8a75d",fontSize:9}}>1–5</kbd>
              <span>alt</span>
              <kbd style={{padding:"2px 5px",borderRadius:3,background:"rgba(200,167,93,0.08)",border:"1px solid rgba(200,167,93,0.18)",color:"#c8a75d",fontSize:9}}>←→</kbd>
              <span>nav</span>
              <kbd style={{padding:"2px 5px",borderRadius:3,background:"rgba(200,167,93,0.08)",border:"1px solid rgba(200,167,93,0.18)",color:"#c8a75d",fontSize:9}}>F</kbd>
              <span>marcar</span>
            </div>
          </div>
          <span style={{fontSize:11,color:"#c8a75d",fontFamily:"'JetBrains Mono',monospace"}}>{cur+1} / {total}</span>
          <button onClick={()=>setCur(c=>Math.min(total-1,c+1))} disabled={cur===total-1} style={{...S.btn("ghost"),opacity:cur===total-1?.4:1,padding:"9px 18px"}}>Próxima →</button>
        </div>
      </div>
      {showGrid&&(<div style={{width:190,flexShrink:0}}>
        <div style={{...S.card,padding:14,position:"sticky",top:80}}>
          <div style={{fontSize:9,color:"#c8a75d",fontWeight:700,letterSpacing:2,fontFamily:"monospace",marginBottom:10}}>GRADE</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3}}>
            {exam.questions.map((q2,i)=>{const num=q2.numero_simulado;const isA=answers[num]!==undefined;const isF=flagged.has(num);const isC=i===cur;const di2=DISCIPLINE_ORDER.indexOf(q2.disciplina);const dc2=DISC_COLORS[di2>=0?di2:0];return(
              <button key={num} onClick={()=>{setCur(i);setShowGrid(false);}} style={{width:26,height:26,borderRadius:5,border:`1px solid ${isC?dc2:isA?"rgba(52,211,153,0.4)":"rgba(255,255,255,0.07)"}`,background:isC?`${dc2}33`:isA?"rgba(52,211,153,0.1)":"rgba(255,255,255,0.02)",color:isF?"#fbbf24":isC?dc2:isA?"#34d399":"#334155",cursor:"pointer",fontSize:isF?10:8,fontWeight:700,padding:0,fontFamily:"monospace"}}>
                {isF?"🚩":num}
              </button>);})}
          </div>
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5,fontSize:9,color:"#536880"}}>
            <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:2,background:"rgba(52,211,153,0.3)"}}/> Respondida</div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:2,background:"rgba(56,189,248,0.4)"}}/> Atual</div>
            <div style={{display:"flex",gap:5,alignItems:"center"}}>🚩 Marcada</div>
          </div>
        </div>
      </div>)}
    </div>
    {showConfirm&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:20}}>
      <div style={{...S.card,padding:32,maxWidth:380,width:"100%",textAlign:"center",borderColor:"rgba(200,167,93,0.22)"}}>
        <div style={{fontSize:52,marginBottom:16}}>🏁</div>
        <h3 style={{margin:"0 0 10px",fontSize:18,fontWeight:900,fontFamily:"monospace"}}>FINALIZAR SIMULADO?</h3>
        <p style={{color:"#536880",fontSize:13,margin:"0 0 6px"}}>{answered}/{total} questões respondidas</p>
        {answered<total&&<p style={{color:"#fbbf24",fontSize:12,margin:"0 0 20px"}}>⚠ {total-answered} questões não respondidas</p>}
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={()=>setShowConfirm(false)} style={{...S.btn("ghost"),flex:1,padding:"12px"}}>Continuar</button>
          <button onClick={()=>{clearInterval(timerRef.current);finishExam(answers,tSpent);}} style={{...S.btn("primary"),flex:1,padding:"12px"}}>Finalizar</button>
        </div>
      </div>
    </div>)}
  </div>);
}

/* RESULTS VIEW */
function ResultsView({results,setView}){
  const [tab,setTab]=useState("overview");
  if(!results)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 58px)",flexDirection:"column",gap:16}}><p style={{color:"#475569"}}>Nenhum resultado disponível</p><button onClick={()=>setView("home")} style={S.btn("outline")}>← Voltar</button></div>);
  const sc=results.percent>=70?"#34d399":results.percent>=50?"#fbbf24":"#f87171";const label=results.percent>=70?"APROVADO":results.percent>=50?"REGULAR":"REPROVADO";
  const discRows=DISCIPLINE_ORDER.filter(d=>results.disciplineStats[d]).map(d=>{const s=results.disciplineStats[d];const pct=s.total>0?Math.round(s.correct/s.total*100):0;return{d,s,pct,color:DISC_COLORS[DISCIPLINE_ORDER.indexOf(d)],short:DISC_SHORT[DISCIPLINE_ORDER.indexOf(d)]};});
  const chartData=discRows.map(r=>({name:r.short,acertos:r.s.correct,erros:r.s.wrong,pct:r.pct}));
  return(<div style={{maxWidth:1000,margin:"0 auto",padding:"24px 16px"}}>
    <div style={{borderRadius:20,padding:"28px",marginBottom:24,textAlign:"center",position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${sc}12,${sc}08)`,border:`1px solid ${sc}30`}}>
      <div style={{position:"relative"}}>
        <div style={{fontSize:"clamp(64px,12vw,96px)",fontWeight:900,color:sc,fontFamily:"monospace",lineHeight:1}}>{results.percent}%</div>
        <div style={{padding:"5px 18px",borderRadius:20,background:`${sc}22`,color:sc,fontWeight:900,fontSize:12,display:"inline-block",marginBottom:18,letterSpacing:3,fontFamily:"monospace"}}>{label}</div>
        <div style={{display:"flex",gap:24,justifyContent:"center",flexWrap:"wrap"}}>
          {[{v:results.correct,l:"ACERTOS",c:"#34d399"},{v:results.wrong,l:"ERROS",c:"#f87171"},{v:results.blank,l:"BRANCO",c:"#475569"},{v:fmtTime(results.timeSpent),l:"TEMPO",c:"#94a3b8"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:28,fontWeight:900,color:s.c,fontFamily:"monospace"}}>{s.v}</div><div style={{fontSize:9,color:"#475569",letterSpacing:2}}>{s.l}</div></div>))}
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:4,marginBottom:20,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
      {[{id:"overview",l:"📊 Visão Geral"},{id:"review",l:"🔍 Revisão"},{id:"chart",l:"📈 Gráfico"}].map(t=>(
        <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 16px",borderRadius:"8px 8px 0 0",border:"none",cursor:"pointer",fontSize:12,fontWeight:700,transition:"all 0.2s",background:tab===t.id?"rgba(200,167,93,0.08)":"transparent",color:tab===t.id?"#64b5f6":"#475569",borderBottom:tab===t.id?"2px solid #c8a75d":"2px solid transparent"}}>{t.l}</button>))}
    </div>
    {tab==="overview"&&(<div style={{display:"flex",flexDirection:"column",gap:10}}>
      {discRows.map(r=>(<div key={r.d} style={{...S.card,padding:"12px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:13,fontWeight:700,color:"#cbd5e1"}}>{r.d}</span><div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{fontSize:11,color:"#34d399",fontFamily:"monospace"}}>✓{r.s.correct}</span><span style={{fontSize:11,color:"#f87171",fontFamily:"monospace"}}>✗{r.s.wrong}</span><span style={{fontSize:16,fontWeight:900,color:r.pct>=70?"#34d399":r.pct>=50?"#fbbf24":"#f87171",fontFamily:"monospace"}}>{r.pct}%</span></div></div>
        <ProgressBar value={r.pct} color={r.pct>=70?"#34d399":r.pct>=50?"#fbbf24":"#f87171"} height={5}/>
      </div>))}
    </div>)}
    {tab==="chart"&&(<div style={{...S.card,padding:20}}><div style={{height:280}}><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{top:5,right:10,left:-20,bottom:50}}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/><XAxis dataKey="name" tick={{fill:"#475569",fontSize:9}} angle={-35} textAnchor="end" interval={0}/><YAxis tick={{fill:"#475569",fontSize:10}}/><Tooltip contentStyle={{background:"#0f1729",border:"1px solid rgba(200,167,93,0.2)",borderRadius:8,color:"#e2e8f0",fontSize:12}}/><Bar dataKey="acertos" name="Acertos" fill="#34d399" radius={[4,4,0,0]}/><Bar dataKey="erros" name="Erros" fill="#f87171" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></div>)}
    {tab==="review"&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {results.questions.map(q=>{const ua=results.answers[q.numero_simulado];const ok=ua===q.correta;const blank=ua===undefined||ua===null;const bc=blank?"#475569":ok?"#34d399":"#f87171";const di2=DISCIPLINE_ORDER.indexOf(q.disciplina);return(
        <div key={q.id||q.numero_simulado} style={{...S.card,padding:"12px 16px",borderLeft:`3px solid ${bc}`}}>
          <div style={{display:"flex",gap:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:`${bc}22`,display:"flex",alignItems:"center",justifyContent:"center",color:bc,fontSize:14,flexShrink:0}}>{blank?"—":ok?"✓":"✗"}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,marginBottom:5,flexWrap:"wrap"}}><span style={{fontSize:10,color:"#c8a75d",fontWeight:700,fontFamily:"monospace"}}>Q{q.numero_simulado}</span><Badge color={DISC_COLORS[di2>=0?di2:0]}>{q.disciplina}</Badge></div>
              <p style={{fontSize:12,color:"#94a3b8",margin:"0 0 7px",lineHeight:1.5}}>{q.pergunta?.slice(0,200)}{q.pergunta?.length>200?"...":""}</p>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><span style={{fontSize:11,color:"#34d399",fontWeight:700}}>Gabarito: {LETTERS[q.correta]||"?"}</span>{!blank&&!ok&&<span style={{fontSize:11,color:"#f87171",fontWeight:700}}>Sua resp.: {LETTERS[ua]||"?"}</span>}{blank&&<span style={{fontSize:11,color:"#475569"}}>Não respondida</span>}</div>
              {q.linkTec&&<a href={q.linkTec} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",gap:4,fontSize:10,color:"#c8a75d",textDecoration:"none",marginTop:6}}>🔗 TEC Concursos</a>}
            </div>
          </div>
        </div>);})}
    </div>)}
    <div style={{display:"flex",gap:10,marginTop:24,flexWrap:"wrap"}}>
      <button onClick={()=>setView("generator")} style={{...S.btn("primary"),flex:1,minWidth:140,padding:"13px"}}>⚡ Novo Simulado</button>
      <button onClick={()=>setView("home")} style={{...S.btn("ghost"),flex:1,minWidth:140,padding:"13px"}}>🏠 Dashboard</button>
      <button onClick={()=>exportResultsPDF(results)} style={{...S.btn("outline"),flex:1,minWidth:140,padding:"13px"}}>📄 Exportar PDF</button>
    </div>
  </div>);
}

/* HISTORY VIEW */
function HistoryView({history,setView,setExamResults}){
  if(!history.length)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 58px)",flexDirection:"column",gap:16,padding:40}}><div style={{fontSize:64,opacity:.2}}>◎</div><h3 style={{fontSize:18,fontWeight:700,color:"#94a3b8"}}>Sem histórico</h3><p style={{color:"#475569",textAlign:"center"}}>Realize simulados para ver seu histórico aqui.</p><button onClick={()=>setView("generator")} style={S.btn("primary")}>⚡ Criar Simulado</button></div>);
  const avg=Math.round(history.reduce((s,e)=>s+e.percent,0)/history.length);const best=Math.max(...history.map(e=>e.percent));
  return(<div style={{maxWidth:900,margin:"0 auto",padding:"24px 16px"}}>
    <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 6px",fontFamily:"monospace"}}>◎ HISTÓRICO</h2>
    <p style={{color:"#8fb5cc",fontSize:13,marginBottom:20}}>{history.length} simulados • Média: {avg}% • Melhor: {best}%</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
      <Chip icon="◎" label="Total Simulados" value={history.length} color="#64b5f6"/>
      <Chip icon="★" label="Média Geral" value={`${avg}%`} color={avg>=70?"#34d399":avg>=50?"#fbbf24":"#f87171"}/>
      <Chip icon="▲" label="Melhor Nota" value={`${best}%`} color="#38bdf8"/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {history.map((e,i)=>{const sc=e.percent>=70?"#34d399":e.percent>=50?"#fbbf24":"#f87171";return(
        <div key={i} style={{...S.card,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><span style={{fontSize:13,fontWeight:800,color:"#e2e8f0",fontFamily:"monospace"}}>#{history.length-i}</span><Badge color={sc}>{e.percent>=70?"APROVADO":e.percent>=50?"REGULAR":"REPROVADO"}</Badge></div>
            <div style={{fontSize:11,color:"#475569"}}>{new Date(e.date).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})} • {e.total}Q • {e.correct}✓ {e.wrong}✗ • {fmtTime(e.timeSpent)}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{fontFamily:"monospace",fontSize:32,fontWeight:900,color:sc}}>{e.percent}%</div><button onClick={()=>{setExamResults(e);setView("results");}} style={{...S.btn("outline"),padding:"7px 14px",fontSize:12}}>Ver →</button></div>
        </div>);})}
    </div>
  </div>);
}

/* MAIN APP */
export default function App(){
  const [view,setView]=useState("home");
  const [questions,setQuestions]=useState([]);
  const [usedIds,setUsedIds]=useState([]);
  const [history,setHistory]=useState([]);
  const [currentExam,setCurrentExam]=useState(null);
  const [examResults,setExamResults]=useState(null);
  const [toast,setToast]=useState(null);
  const [loading,setLoading]=useState(true);
  const [loadProg,setLoadProg]=useState(0);
  const [loadError,setLoadError]=useState(null);
  const [dbInfo,setDbInfo]=useState(null);
  const [dbUpdated,setDbUpdated]=useState(false);
  const [favorites,setFavorites]=useState(new Set());

  useEffect(()=>{
    setUsedIds(store.load(SK.USED,[]));
    setHistory(store.load(SK.HIST,[]));
    try{setFavorites(new Set(store.load(SK.favs,[])));}catch(e){}
    const cur=store.load(SK.CUR,null);if(cur)setCurrentExam(cur);
    loadQuestionDatabase(setLoadProg)
      .then(({questions:qs,version,updatedAt,totalFiles})=>{
        setQuestions(qs);
        const saved=store.load(SK.DB_VER,null);
        if(saved&&saved!==version)setDbUpdated(true);
        store.save(SK.DB_VER,version);
        setDbInfo({version,updatedAt,totalFiles});
        setLoading(false);
      })
      .catch(err=>{setLoadError(err.message);setLoading(false);});
  },[]);

  const notify=useCallback((msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3200);},[]);

  const startExam=useCallback(exam=>{const data={...exam,answers:{},startTime:Date.now()};setCurrentExam(data);store.save(SK.CUR,data);setView("exam");},[]);

  const toggleFavorite=useCallback((qid)=>{
    setFavorites(s=>{
      const ns=new Set(s);
      ns.has(qid)?ns.delete(qid):ns.add(qid);
      try{store.save(SK.favs,Array.from(ns));}catch(e){}
      return ns;
    });
  },[]);

  const finishExam=useCallback((answers,timeSpent)=>{
    if(!currentExam)return;
    let correct=0,wrong=0,blank=0;const disciplineStats={};
    currentExam.questions.forEach(q=>{
      const ua=answers[q.numero_simulado];const ok=ua!==undefined&&ua!==null&&ua===q.correta;
      if(ua===undefined||ua===null)blank++;else if(ok)correct++;else wrong++;
      if(!disciplineStats[q.disciplina])disciplineStats[q.disciplina]={correct:0,wrong:0,blank:0,total:0};
      disciplineStats[q.disciplina].total++;
      if(ua===undefined||ua===null)disciplineStats[q.disciplina].blank++;else if(ok)disciplineStats[q.disciplina].correct++;else disciplineStats[q.disciplina].wrong++;
    });
    const results={examId:currentExam.id,date:new Date().toISOString(),total:currentExam.questions.length,correct,wrong,blank,percent:Math.round(correct/currentExam.questions.length*100),timeSpent,disciplineStats,answers,questions:currentExam.questions};
    const newUsed=[...new Set([...usedIds,...currentExam.questions.map(q=>q.id)])];
    setUsedIds(newUsed);store.save(SK.USED,newUsed);
    const newHist=[results,...history];setHistory(newHist);store.save(SK.HIST,newHist);
    setCurrentExam(null);store.del(SK.CUR);setExamResults(results);setView("results");
  },[currentExam,usedIds,history]);

  const resetHistory=useCallback(()=>{setUsedIds([]);store.del(SK.USED);notify("✓ Histórico resetado! Todas as questões estão disponíveis.");},[notify]);

  const stats=useMemo(()=>{
    const total=questions.length;const used=usedIds.filter(id=>questions.some(q=>q.id===id)).length;
    const byDisc={};DISCIPLINE_ORDER.forEach(d=>{const dQs=questions.filter(q=>q.disciplina===d);byDisc[d]={total:dQs.length,used:dQs.filter(q=>usedIds.includes(q.id)).length};});
    return{total,used,percent:total>0?Math.round(used/total*100):0,byDisc};
  },[questions,usedIds]);

  if(loading||loadError)return <LoadingScreen progress={loadProg} error={loadError}/>;

  const render=()=>{switch(view){
    case"home":return <HomeView stats={stats} history={history} setView={setView} currentExam={currentExam} dbInfo={dbInfo} dbUpdated={dbUpdated} favorites={favorites}/>;
    case"bank":return <BankView questions={questions} usedIds={usedIds} dbInfo={dbInfo}/>;
    case"generator":return <GeneratorView questions={questions} usedIds={usedIds} startExam={startExam} notify={notify}/>;
    case"exam":return <ExamView exam={currentExam} finishExam={finishExam} setView={setView}/>;
    case"results":return <ResultsView results={examResults} setView={setView}/>;
    case"history":return <HistoryView history={history} setView={setView} setExamResults={setExamResults}/>;
    default:return <HomeView stats={stats} history={history} setView={setView} currentExam={currentExam} dbInfo={dbInfo} dbUpdated={dbUpdated} favorites={favorites}/>;
  }};

  return(<div style={{minHeight:"100vh",background:"radial-gradient(ellipse 120% 80% at 20% 20%,#060c1a 0%,#04060c 50%,#020308 100%)",color:"#eef1f7",fontFamily:"'Barlow','Segoe UI','Helvetica Neue',system-ui,sans-serif"}}>
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:.4}}><div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(200,167,93,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,167,93,0.025) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/></div>
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}><div style={{position:"absolute",top:"5%",left:"10%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,167,93,0.04) 0%,transparent 70%)"}}/><div style={{position:"absolute",bottom:"10%",right:"5%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,167,93,0.04) 0%,transparent 70%)"}}/></div>
    {toast&&(<div style={{position:"fixed",top:70,right:20,zIndex:9999,padding:"11px 18px",borderRadius:12,background:toast.type==="error"?"rgba(239,68,68,0.92)":"rgba(16,185,129,0.92)",backdropFilter:"blur(12px)",color:"#fff",fontWeight:700,fontSize:13,boxShadow:"0 8px 32px rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,0.15)",animation:"slideIn 0.3s ease"}}>{toast.msg}</div>)}
    {view!=="exam"&&<NavBar view={view} setView={setView} qCount={questions.length} resetHistory={resetHistory}/>}
    <div style={{position:"relative",zIndex:1,paddingTop:view!=="exam"?58:0}}>{render()}</div>
    <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:rgba(0,0,0,0.3)}::-webkit-scrollbar-thumb{background:rgba(200,167,93,0.25);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:rgba(200,167,93,0.45)}input:focus,select:focus{border-color:rgba(200,167,93,0.45)!important;box-shadow:0 0 0 2px rgba(200,167,93,0.08)}@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,167,93,0.3)}50%{box-shadow:0 0 0 8px rgba(200,167,93,0)}}@keyframes pulseGold{0%,100%{opacity:0.5}50%{opacity:1}}button:hover{filter:brightness(1.08)}`}</style>
  </div>);
}
