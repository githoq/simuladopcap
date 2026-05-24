/**
 * ============================================================
 * CLOUDFLARE PAGES FUNCTION — /api/chat
 * ============================================================
 * Runtime: Cloudflare Workers (Web Standard APIs)
 * Variável de ambiente: GEMINI_API_KEY
 *   → Configure em: Cloudflare Pages → Settings → Environment variables
 *
 * Localmente: dev-proxy.mjs (npm run dev)
 * ============================================================
 */

// ─── Tipos do ambiente Cloudflare Pages ─────────────────────

interface Env {
  GEMINI_API_KEY: string;
}

// Contexto injetado pelo runtime do Cloudflare Pages Functions
// Definido inline para não depender de @cloudflare/workers-types em tempo de build
interface EventContext<TEnv = Record<string, string>> {
  request: Request;
  env: TEnv;
  params: Record<string, string | string[]>;
  waitUntil(promise: Promise<unknown>): void;
  next(input?: Request | string, init?: RequestInit): Promise<Response>;
  data: Record<string, unknown>;
}

// ─── Tipos da API do Gemini ──────────────────────────────────

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason?: string;
  index?: number;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
}

// ─── Tipos da requisição interna ────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  history: ChatMessage[];
  systemPrompt: string;
  modo: string;
}

// ─── Constantes ──────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_HISTORY = 20;

// ─── Helpers ─────────────────────────────────────────────────

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(
  data: unknown,
  status: number,
  origin: string | null
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
}

// ─── Handler POST ─────────────────────────────────────────────

export async function onRequestPost(
  context: EventContext<Env>
): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get("Origin");

  // ── API Key ──────────────────────────────────────────────
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(
      { error: "Assistente IA não configurado. Configure GEMINI_API_KEY no dashboard do Cloudflare Pages." },
      503,
      origin
    );
  }

  // ── Lê e valida o body ───────────────────────────────────
  let body: Partial<RequestBody>;
  try {
    body = (await request.json()) as Partial<RequestBody>;
  } catch {
    return jsonResponse({ error: "JSON inválido na requisição." }, 400, origin);
  }

  const { message, history = [], systemPrompt = "", modo = "padrao" } = body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return jsonResponse({ error: "Campo 'message' é obrigatório." }, 400, origin);
  }

  // ── Monta o payload para o Gemini ────────────────────────
  const contents: GeminiContent[] = [
    ...history.slice(-MAX_HISTORY).map(
      (msg): GeminiContent => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      })
    ),
    { role: "user", parts: [{ text: message }] },
  ];

  const geminiPayload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      candidateCount: 1,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  // ── Chama a API do Gemini ────────────────────────────────
  const geminiUrl = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });
  } catch {
    return jsonResponse(
      { error: "Não foi possível conectar ao serviço de IA. Tente novamente." },
      502,
      origin
    );
  }

  if (!geminiResponse.ok) {
    const errBody = await geminiResponse.text();
    console.error("Gemini API error:", geminiResponse.status, errBody);

    if (geminiResponse.status === 429) {
      return jsonResponse(
        { error: "Limite de requisições atingido. Aguarde alguns segundos e tente novamente." },
        429,
        origin
      );
    }
    if (geminiResponse.status === 401 || geminiResponse.status === 403) {
      return jsonResponse(
        { error: "Chave de API inválida ou sem permissão." },
        503,
        origin
      );
    }
    return jsonResponse(
      { error: "Erro no serviço de IA. Tente novamente em instantes." },
      502,
      origin
    );
  }

  // ── Extrai e tipifica a resposta ─────────────────────────
  const geminiData = (await geminiResponse.json()) as GeminiResponse;

  const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    console.error("Gemini empty response:", JSON.stringify(geminiData));
    return jsonResponse(
      { error: "O assistente não gerou resposta. Tente reformular sua pergunta." },
      502,
      origin
    );
  }

  return jsonResponse({ reply, modo }, 200, origin);
}

// ─── Handler OPTIONS (preflight CORS) ───────────────────────

export async function onRequestOptions(
  context: EventContext<Env>
): Promise<Response> {
  const origin = context.request.headers.get("Origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}
