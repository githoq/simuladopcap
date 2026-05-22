/**
 * ============================================================
 * VERCEL SERVERLESS FUNCTION — /api/chat
 * (mantido para quem usa Vercel — lógica idêntica ao Cloudflare)
 * ============================================================
 */
export const config = { runtime: "nodejs20.x" };

import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ChatMessage { role: "user" | "assistant"; content: string; }
interface RequestBody {
  message: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  modo?: string;
}

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_HISTORY = 20;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Configure GEMINI_API_KEY no painel do servidor." });

  const { message, history = [], systemPrompt = "", modo = "padrao" } = req.body as Partial<RequestBody>;
  if (!message) return res.status(400).json({ error: "Campo 'message' obrigatório" });

  const contents = [
    ...history.slice(-MAX_HISTORY).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  const geminiRes = await fetch(`${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048, candidateCount: 1 },
    }),
  }).catch(() => null);

  if (!geminiRes?.ok) return res.status(502).json({ error: "Erro ao conectar ao Gemini. Tente novamente." });

  const data = await geminiRes.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) return res.status(502).json({ error: "Resposta vazia do Gemini." });

  return res.status(200).json({ reply, modo });
}
