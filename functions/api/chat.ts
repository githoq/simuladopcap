/**
 * ============================================================
 * CLOUDFLARE PAGES FUNCTION — /api/chat
 * ============================================================
 * Runtime: Workers (Web APIs — sem Node.js)
 * Variável de ambiente: GEMINI_API_KEY
 *   → Configure em: Cloudflare Pages → Settings → Environment variables
 *
 * Localmente: use dev-proxy.mjs  (npm run dev)
 * ============================================================
 */

// Tipos do Cloudflare Pages Functions
interface Env {
  GEMINI_API_KEY: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  message: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  modo?: string;
}

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_HISTORY = 20;

// ─── Headers CORS ───────────────────────────────────────────
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// ─── Handler principal ──────────────────────────────────────
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const origin = request.headers.get("Origin");

  // ── API Key ──────────────────────────────────────────────
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Assistente IA não configurado. Configure GEMINI_API_KEY no dashboard do Cloudflare Pages.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }

  // ── Lê e valida o body ───────────────────────────────────
  let body: Partial<RequestBody>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  const {
    message,
    history = [],
    systemPrompt = "",
    modo = "padrao",
  } = body;

  if (!message || typeof message !== "string") {
    return new Response(
      JSON.stringify({ error: "Campo 'message' obrigatório" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }

  // ── Monta o payload para o Gemini ────────────────────────
  const historySlice = history.slice(-MAX_HISTORY);

  const contents = [
    ...historySlice.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const geminiUrl = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const geminiBody = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      candidateCount: 1,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH",
      },
    ],
  };

  // ── Chama a API do Gemini ────────────────────────────────
  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Não foi possível conectar ao serviço de IA. Tente novamente.",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }

  if (!geminiResponse.ok) {
    const errText = await geminiResponse.text();
    console.error("Gemini API error:", geminiResponse.status, errText);

    if (geminiResponse.status === 429) {
      return new Response(
        JSON.stringify({
          error:
            "Limite de requisições atingido. Aguarde alguns segundos e tente novamente.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(origin),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Erro no serviço de IA. Tente novamente em instantes.",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }

  const geminiData = await geminiResponse.json();
  const reply =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    return new Response(
      JSON.stringify({
        error:
          "O assistente não gerou resposta. Tente reformular sua pergunta.",
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      }
    );
  }

  return new Response(JSON.stringify({ reply, modo }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  });
};

// ─── Handler para OPTIONS (preflight CORS) ──────────────────
export const onRequestOptions: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get("Origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
};
