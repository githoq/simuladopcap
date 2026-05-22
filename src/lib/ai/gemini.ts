/**
 * Cliente Gemini — chama o proxy serverless /api/chat
 * A API key NUNCA toca o frontend — fica exclusivamente no servidor.
 */

import { buildSystemPrompt, detectarModo, type Modo } from "./prompts";

// ─── TIPOS ─────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  modo?: Modo;
}

export interface ChatResponse {
  reply: string;
  modo: Modo;
  error?: string;
}

// ─── ENDPOINT DO PROXY ──────────────────────────────────────
// Em produção (Vercel): /api/chat → serverless function
// Em desenvolvimento: http://localhost:3001/api/chat → dev-proxy.mjs
// A key fica NO SERVIDOR — nunca exposta ao bundle do cliente
const isDev =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_ENDPOINT = isDev
  ? "http://localhost:3001/api/chat"
  : "/api/chat";

// ─── FUNÇÃO PRINCIPAL ───────────────────────────────────────

/**
 * Envia mensagem ao assistente IA via proxy serverless.
 * Inclui histórico da conversa para memória contextual.
 */
export async function enviarMensagem(
  request: ChatRequest
): Promise<ChatResponse> {
  const modo = request.modo ?? detectarModo(request.message);

  const body = {
    message: request.message,
    history: request.history,
    systemPrompt: buildSystemPrompt(modo),
    modo,
  };

  const res = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMsg = `Erro ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.error ?? errorMsg;
    } catch {
      // ignora erro de parse
    }
    throw new Error(errorMsg);
  }

  const data: ChatResponse = await res.json();
  return { ...data, modo };
}

// ─── RENDERIZAÇÃO DE MARKDOWN AVANÇADA ──────────────────────

/**
 * Converte Markdown para HTML seguro para exibição no chat.
 * Suporta: negrito, itálico, listas, código, emojis, links.
 */
export function renderMarkdown(text: string): string {
  let html = text
    // Escapa HTML antes de processar
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Blocos de código (```...```)
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_m, code) =>
      `<pre class="code-block"><code>${code.trim()}</code></pre>`
    )

    // Código inline (`...`)
    .replace(/`([^`]+)`/g, "<code>$1</code>")

    // Negrito+itálico (***...*** ou ___...___) 
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")

    // Negrito (**...** ou __...__)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")

    // Itálico (*...* ou _..._)
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")

    // Títulos (##, ###, ####)
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")

    // Linha horizontal (---, ___)
    .replace(/^[-_]{3,}$/gm, "<hr>")

    // Listas numeradas
    .replace(/^\d+\. (.+)$/gm, "<li class='numbered'>$1</li>")

    // Listas com bullet (-, *, •)
    .replace(/^[-*•] (.+)$/gm, "<li>$1</li>")

    // Agrupa <li> em <ul> ou <ol>
    .replace(/(<li class='numbered'>[\s\S]*?<\/li>)(\s*)(?!<li class='numbered'>)/g, "<ol>$1</ol>$2")
    .replace(/(<li>(?!<\/li>)[\s\S]*?<\/li>)(\s*)(?!<li>)/g, "<ul>$1</ul>$2")

    // Blockquote (> ...)
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")

    // Quebras de parágrafo (linha dupla)
    .replace(/\n\n+/g, "</p><p>")

    // Quebras simples dentro de parágrafos
    .replace(/\n/g, "<br>")

    // Wrap em parágrafo
    .replace(/^(?!<[houbp]|<li|<pre|<blockquote)/, "<p>")
    .replace(/(?<!>)$/, "</p>");

  // Remove parágrafos vazios
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}
