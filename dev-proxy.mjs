/**
 * ============================================================
 * SERVIDOR DE DESENVOLVIMENTO LOCAL
 * ============================================================
 * Simula a serverless function /api/chat durante o desenvolvimento.
 * Lê a GEMINI_API_KEY do arquivo .env (nunca exposta ao browser).
 *
 * Uso: node dev-proxy.mjs  (em paralelo com o vite dev)
 * Ou:  npm run dev  (já inicia ambos via concurrently)
 * ============================================================
 */

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

// ── Carrega .env manualmente ────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, ".env");
  if (!existsSync(envPath)) {
    console.warn("[proxy] Arquivo .env não encontrado. Crie a partir do .env.example");
    return {};
  }
  const content = readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key) vars[key.trim()] = rest.join("=").trim();
  }
  return vars;
}

const envVars = loadEnv();
const GEMINI_API_KEY = envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("[proxy] ⚠️  GEMINI_API_KEY não encontrada no .env");
  console.error("[proxy]     Configure GEMINI_API_KEY no arquivo .env");
} else {
  console.log("[proxy] ✅ GEMINI_API_KEY carregada do .env");
}

const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_HISTORY = 20;

// ── Handler ─────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  // CORS para o Vite dev server (porta 3000)
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  if (req.url !== "/api/chat" || req.method !== "POST") {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not found" }));
  }

  if (!GEMINI_API_KEY) {
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ error: "GEMINI_API_KEY não configurada no .env" })
    );
  }

  // Lê body
  let body = "";
  for await (const chunk of req) body += chunk;
  
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "JSON inválido" }));
  }

  const { message, history = [], systemPrompt = "", modo = "padrao" } = parsed;

  if (!message) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Campo 'message' obrigatório" }));
  }

  const historySlice = history.slice(-MAX_HISTORY);
  const contents = [
    ...historySlice.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  let geminiRes;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          candidateCount: 1,
        },
      }),
    });
  } catch (err) {
    console.error("[proxy] Erro de rede:", err);
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Não foi possível conectar ao Gemini" }));
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    console.error("[proxy] Gemini error:", geminiRes.status, errText);
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: `Erro Gemini: ${geminiRes.status}` }));
  }

  const data = await geminiRes.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Resposta vazia do Gemini" }));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ reply, modo }));
});

server.listen(PORT, () => {
  console.log(`[proxy] 🚀 Dev proxy rodando em http://localhost:${PORT}`);
  console.log(`[proxy] 📡 /api/chat → Gemini API (${GEMINI_MODEL})`);
});
