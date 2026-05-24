/**
 * Cliente do assistente IA — chama o proxy /api/chat
 * A GEMINI_API_KEY nunca toca o frontend (fica no servidor).
 */

import { buildSystemPrompt, detectarModo, type Modo } from "./prompts";

// ─── Tipos públicos ──────────────────────────────────────────

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
}

// Formato de erro retornado pelo proxy /api/chat
interface ApiErrorBody {
  error: string;
}

// ─── Endpoint do proxy ───────────────────────────────────────

// Em desenvolvimento local: porta 3001 (dev-proxy.mjs)
// Em produção (Cloudflare / Vercel): /api/chat relativo
const isDev =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_ENDPOINT = isDev ? "http://localhost:3001/api/chat" : "/api/chat";

// ─── Função principal ────────────────────────────────────────

/**
 * Envia mensagem ao assistente via proxy serverless.
 * Detecta o modo automaticamente e inclui o histórico completo.
 */
export async function enviarMensagem(
  request: ChatRequest
): Promise<ChatResponse> {
  const modo = request.modo ?? detectarModo(request.message);

  const payload = {
    message: request.message,
    history: request.history,
    systemPrompt: buildSystemPrompt(modo),
    modo,
  };

  let res: Response;
  try {
    res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    const msg =
      networkErr instanceof Error
        ? networkErr.message
        : "Falha de conexão com o servidor.";
    throw new Error(`Erro de rede: ${msg}`);
  }

  if (!res.ok) {
    // Tenta extrair a mensagem de erro estruturada do proxy
    let errorMsg = `Erro ${res.status} do servidor.`;
    try {
      const errBody = (await res.json()) as ApiErrorBody;
      if (typeof errBody.error === "string" && errBody.error.length > 0) {
        errorMsg = errBody.error;
      }
    } catch {
      // json parse falhou — mantém errorMsg padrão
    }
    throw new Error(errorMsg);
  }

  const data = (await res.json()) as ChatResponse;
  return { ...data, modo };
}

// ─── Renderização de Markdown ────────────────────────────────

/**
 * Converte Markdown para HTML seguro para exibição no chat.
 */
export function renderMarkdown(text: string): string {
  let html = text
    // Escapa HTML antes de processar
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Blocos de código (```...```)
    .replace(
      /```[\w]*\n?([\s\S]*?)```/g,
      (_m, code: string) =>
        `<pre class="code-block"><code>${code.trim()}</code></pre>`
    )

    // Código inline (`...`)
    .replace(/`([^`]+)`/g, "<code>$1</code>")

    // Negrito + itálico (***...***) 
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")

    // Negrito (**...** ou __...__)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")

    // Itálico (*...* ou _..._)
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")

    // Títulos (####, ###, ##, #)
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")

    // Linha horizontal (--- ou ___)
    .replace(/^[-_]{3,}$/gm, "<hr>")

    // Listas numeradas (1. ...)
    .replace(/^\d+\. (.+)$/gm, "<li class='numbered'>$1</li>")

    // Listas com bullet (-, *, •)
    .replace(/^[-*•] (.+)$/gm, "<li>$1</li>")

    // Agrupa <li class='numbered'> em <ol>
    .replace(
      /(<li class='numbered'>[\s\S]*?<\/li>)(\s*)(?!<li class='numbered'>)/g,
      "<ol>$1</ol>$2"
    )

    // Agrupa <li> simples em <ul>
    .replace(
      /(<li>(?!<\/li>)[\s\S]*?<\/li>)(\s*)(?!<li>)/g,
      "<ul>$1</ul>$2"
    )

    // Blockquote (> ...)
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")

    // Parágrafos (linha dupla)
    .replace(/\n\n+/g, "</p><p>")

    // Quebra de linha simples dentro de parágrafo
    .replace(/\n/g, "<br>")

    // Wrap em parágrafo
    .replace(/^(?!<[houbp]|<li|<pre|<blockquote)/, "<p>")
    .replace(/(?<!>)$/, "</p>");

  // Remove parágrafos vazios
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}
