/**
 * Exportações centralizadas da lib de IA.
 * Importe daqui: import { enviarMensagem, buildSystemPrompt } from "@/lib/ai"
 */
export { enviarMensagem, renderMarkdown } from "./gemini";
export type { ChatMessage, ChatRequest, ChatResponse } from "./gemini";

export {
  buildSystemPrompt,
  detectarModo,
  MODOS,
  MENSAGEM_BOAS_VINDAS,
  SUGESTOES,
} from "./prompts";
export type { Modo } from "./prompts";
