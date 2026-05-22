import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, RotateCcw } from "lucide-react";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

const SUGGESTIONS = [
  "Explique concordância verbal para mim",
  "Como funciona a voz passiva analítica?",
  "Dicas para Direito Constitucional no PC-AP",
  "O que é crase e quando usar?",
];

const MOCKED_RESPONSES: Record<string, string> = {
  default: `Olá! Sou o **Assistente IA** do PC-AP Simulados. Estou aqui para ajudar na sua preparação para o concurso da Polícia Civil do Amapá.\n\nPosso te ajudar com:\n- **Língua Portuguesa** — concordância, regência, crase, pontuação\n- **Direito Constitucional e Administrativo**\n- **Raciocínio Lógico**\n- Estratégias de estudo e revisão\n\nO que você gostaria de saber?`,
  concordancia: `A **concordância verbal** é um dos temas mais cobrados pela FCC. Aqui estão os principais pontos:\n\n**1. Sujeito composto antes do verbo**\nO verbo vai para o plural:\n*"Pedro e Maria foram ao evento."*\n\n**2. Sujeito composto após o verbo**\nO verbo pode concordar com o mais próximo:\n*"Foram Pedro e Maria" ou "Foi Pedro e Maria."*\n\n**3. Sujeito = pronome relativo "que"**\nO verbo concorda com o antecedente:\n*"Fui eu que fiz" ou "Fui eu que fiz."*\n\n💡 **Dica de prova:** A FCC adora questões com sujeito posposto e pronomes indefinidos.`,
  passiva: `A **voz passiva analítica** é formada por:\n**verbo SER + particípio**\n\n*Ativa:* "O agente prendeu o suspeito."\n*Passiva analítica:* "O suspeito foi preso pelo agente."\n\n**Voz passiva sintética** (uso de SE):\n*"Prendem-se suspeitos" = "Suspeitos são presos"*\n\n**Atenção FCC:** Na voz passiva sintética com sujeito posposto, o verbo concorda com o sujeito paciente:\n*"Vendem-se casas"* ✓\n*"Vende-se casas"* ✗`,
};

function getMockedResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("concordância") || lower.includes("concordancia")) return MOCKED_RESPONSES.concordancia;
  if (lower.includes("voz passiva") || lower.includes("passiva")) return MOCKED_RESPONSES.passiva;
  return `Ótima pergunta sobre **"${msg.slice(0, 40)}${msg.length > 40 ? "…" : ""}"**!\n\nEste é um tema importante para o concurso PC-AP. Vou analisar em detalhes:\n\n1. **Conceito fundamental** — Compreender a base teórica é essencial.\n2. **Aplicação prática** — A FCC costuma testar com questões contextualizadas.\n3. **Padrão FCC** — Questões de Português geralmente envolvem análise sintática e semântica.\n\n💡 Continue estudando com os simulados para fixar o conteúdo.`;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome",
    role: "assistant",
    content: MOCKED_RESPONSES.default,
    ts: Date.now(),
  }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = useCallback(async (msg: string) => {
    if (!msg.trim() || thinking) return;
    setInput("");
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setThinking(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const reply: Message = {
      id: Date.now().toString() + "r",
      role: "assistant",
      content: getMockedResponse(msg),
      ts: Date.now(),
    };
    setMessages((m) => [...m, reply]);
    setThinking(false);
  }, [thinking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-56px)] md:pt-14 relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="workspace" />

      {/* Header */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.05]"
        style={{
          background: "linear-gradient(180deg, rgba(6,8,11,0.85) 0%, rgba(6,8,11,0.5) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(124,92,255,0.25), rgba(200,167,93,0.10))",
                border: "1px solid rgba(124,92,255,0.30)",
                boxShadow: "0 0 24px -6px rgba(124,92,255,0.4)",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#a698ff" }} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2" style={{ "--tw-ring-color": "#06080B" } as any} />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary font-sans tracking-tight">Assistente IA</h1>
            <p className="text-[10px] text-text-tertiary font-sans">Especialista PC-AP · Online</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="text-text-muted hover:text-text-secondary text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors font-sans tracking-tight"
        >
          <RotateCcw className="w-3 h-3" />
          Nova conversa
        </button>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i === messages.length - 1 ? 0 : 0.02 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,92,255,0.20), rgba(200,167,93,0.10))",
                    border: "1px solid rgba(124,92,255,0.25)",
                  }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: "#a698ff" }} />
                </div>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-3 max-w-[85%] text-sm font-sans leading-relaxed tracking-tight",
                  msg.role === "user"
                    ? "text-bg-base font-medium"
                    : "text-text-primary"
                )}
                style={
                  msg.role === "user"
                    ? {
                        background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                        boxShadow: "0 4px 16px -4px rgba(0,0,0,0.4)",
                      }
                    : {
                        background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }
                }
              >
                <div
                  className="prose prose-sm max-w-none [&>p]:my-2 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            </motion.div>
          ))}

          {thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                style={{
                  background: "linear-gradient(135deg, rgba(124,92,255,0.20), rgba(200,167,93,0.10))",
                  border: "1px solid rgba(124,92,255,0.25)",
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: "#a698ff" }} />
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-violet-400/60"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all duration-200 font-sans tracking-tight"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="relative z-10 px-4 py-4 border-t border-white/[0.05]"
        style={{
          background: "linear-gradient(180deg, rgba(6,8,11,0.5) 0%, rgba(6,8,11,0.9) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-end gap-2 rounded-2xl p-2"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre qualquer tópico..."
              rows={1}
              className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-muted resize-none focus:outline-none px-3 py-2 font-sans tracking-tight"
              style={{ minHeight: "36px", maxHeight: "120px" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || thinking}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: input.trim() && !thinking
                  ? "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)"
                  : "rgba(255,255,255,0.04)",
                color: input.trim() && !thinking ? "#06080B" : "rgba(255,255,255,0.4)",
                boxShadow: input.trim() && !thinking
                  ? "0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 12px -2px rgba(255,255,255,0.20)"
                  : "none",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
