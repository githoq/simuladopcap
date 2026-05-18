import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, BookOpen, Target, Lightbulb, RotateCcw } from "lucide-react";
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
  return `Ótima pergunta sobre **"${msg.slice(0, 40)}${msg.length > 40 ? "…" : ""}"**!\n\nEste é um tema importante para o concurso PC-AP. Vou analisar em detalhes:\n\n1. **Conceito fundamental** — Compreender a base teórica é essencial.\n2. **Aplicação prática** — A FCC costuma testar com questões contextualizadas.\n3. **Padrão FCC** — Questões de Português geralmente envolvem análise sintática e semântica.\n\n💡 Continue estudando com os simulados para fixar o conteúdo. Posso explicar qualquer conceito específico que apareça nas questões!`;
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="flex flex-col h-screen md:h-[calc(100vh-56px)] md:pt-14 bg-bg-base">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-violet-900/8 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-gold/4 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle/60 bg-bg-base/90 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-gold/20 border border-violet-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-correct-DEFAULT border-2 border-bg-base" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Assistente IA</h1>
            <p className="text-[10px] text-text-tertiary">Especialista PC-AP · Online</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ id: "welcome", role: "assistant", content: MOCKED_RESPONSES.default, ts: Date.now() }])}
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-violet-500/20 to-gold/10 border border-violet-500/20"
                  : "bg-gold-subtle border border-border-gold"
              )}>
                {msg.role === "assistant"
                  ? <Bot className="w-3.5 h-3.5 text-violet-400" />
                  : <User className="w-3.5 h-3.5 text-gold" />
                }
              </div>

              {/* Bubble */}
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-bg-elevated border border-border-subtle text-text-primary rounded-tl-sm"
                  : "bg-gold-subtle border border-border-gold text-text-primary rounded-tr-sm"
              )}>
                {msg.role === "assistant" ? (
                  <div
                    className="prose-sm [&_strong]:text-text-primary [&_strong]:font-semibold [&_em]:text-text-secondary [&_em]:italic [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500/20 to-gold/10 border border-violet-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="bg-bg-elevated border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-text-tertiary"
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (show when only welcome message) */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-border-subtle bg-bg-elevated hover:border-border-gold/40 hover:bg-gold-subtle/30 transition-all text-left group"
              >
                <Lightbulb className="w-3.5 h-3.5 text-gold/60 group-hover:text-gold shrink-0 mt-0.5 transition-colors" />
                <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">{s}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border-subtle/60 bg-bg-base/90 backdrop-blur-xl">
        <div className="flex items-end gap-3 bg-bg-elevated border border-border-subtle rounded-2xl px-4 py-3 focus-within:border-border-gold transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tire uma dúvida, peça explicação..."
            rows={1}
            className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-tertiary resize-none focus:outline-none leading-relaxed max-h-28 overflow-y-auto"
            style={{ minHeight: "24px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 112) + "px";
            }}
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => send(input)}
            disabled={!input.trim() || thinking}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
              input.trim() && !thinking
                ? "bg-gold text-bg-base hover:bg-gold-400"
                : "bg-white/5 text-text-tertiary cursor-not-allowed"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        <p className="text-center text-[10px] text-text-tertiary/50 mt-2">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
