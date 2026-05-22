import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, RotateCcw, AlertCircle, BookOpen, Zap, Search, Clock } from "lucide-react";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { cn } from "../lib/utils";
import { enviarMensagem, renderMarkdown, type ChatMessage } from "../lib/ai/gemini";
import { MENSAGEM_BOAS_VINDAS, SUGESTOES, MODOS, type Modo } from "../lib/ai/prompts";

// ─── TIPOS ─────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
  modo?: Modo;
  error?: boolean;
}

// ─── BADGE DE MODO ─────────────────────────────────────────

const MODO_CONFIG: Record<Modo, { label: string; icon: React.ReactNode; color: string }> = {
  padrao: { label: "Padrão", icon: <Sparkles className="w-2.5 h-2.5" />, color: "rgba(124,92,255,0.8)" },
  professor: { label: "Aula", icon: <BookOpen className="w-2.5 h-2.5" />, color: "rgba(52,211,153,0.8)" },
  resolucao: { label: "Resolução", icon: <Search className="w-2.5 h-2.5" />, color: "rgba(251,191,36,0.8)" },
  pegadinha: { label: "Pegadinha", icon: <Zap className="w-2.5 h-2.5" />, color: "rgba(251,113,133,0.8)" },
  revisao: { label: "Revisão", icon: <Clock className="w-2.5 h-2.5" />, color: "rgba(96,165,250,0.8)" },
};

function ModoBadge({ modo }: { modo: Modo }) {
  const cfg = MODO_CONFIG[modo];
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full font-sans tracking-wide uppercase"
      style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: MENSAGEM_BOAS_VINDAS,
      ts: Date.now(),
      modo: MODOS.PADRAO,
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  // ── Enviar mensagem ──────────────────────────────────────

  const send = useCallback(
    async (msg: string) => {
      if (!msg.trim() || thinking) return;
      setInput("");
      setError(null);

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: msg.trim(),
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setThinking(true);

      // Monta histórico (exclui welcome e erros)
      const history: ChatMessage[] = messages
        .filter((m) => m.id !== "welcome" && !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const response = await enviarMensagem({
          message: msg.trim(),
          history,
        });

        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: response.reply,
          ts: Date.now(),
          modo: response.modo,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errText =
          err instanceof Error ? err.message : "Erro desconhecido";

        // Mensagem de erro inline
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ **Não foi possível obter resposta.**\n\n${errText}\n\nTente novamente em alguns segundos.`,
          ts: Date.now(),
          error: true,
        };
        setMessages((prev) => [...prev, errMsg]);
        setError(errText);
      } finally {
        setThinking(false);
      }
    },
    [thinking, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: MENSAGEM_BOAS_VINDAS,
        ts: Date.now(),
        modo: MODOS.PADRAO,
      },
    ]);
    setError(null);
    setInput("");
  };

  const showSuggestions = messages.length === 1;

  return (
    <div
      className="flex flex-col h-screen md:h-[calc(100vh-56px)] md:pt-14 relative"
      style={{ background: "#06080B" }}
    >
      <AmbientBackground variant="workspace" />

      {/* ── Header ─────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/[0.05]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,8,11,0.85) 0%, rgba(6,8,11,0.5) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,92,255,0.25), rgba(200,167,93,0.10))",
                border: "1px solid rgba(124,92,255,0.30)",
                boxShadow: "0 0 24px -6px rgba(124,92,255,0.4)",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#a698ff" }} />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2"
              style={{
                background: thinking ? "#fbbf24" : "#34d399",
                "--tw-ring-color": "#06080B",
                animation: thinking ? "pulse 1.5s ease-in-out infinite" : "none",
              } as React.CSSProperties}
            />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary font-sans tracking-tight">
              Professor IA
            </h1>
            <p className="text-[10px] text-text-tertiary font-sans">
              {thinking
                ? "Analisando sua pergunta..."
                : "Especialista em Concursos · FCC · Cebraspe · FGV"}
            </p>
          </div>
        </div>

        <button
          onClick={resetConversation}
          className="text-text-muted hover:text-text-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors font-sans tracking-tight"
        >
          <RotateCcw className="w-3 h-3" />
          Nova conversa
        </button>
      </div>

      {/* ── Mensagens ──────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i === messages.length - 1 ? 0 : 0,
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar IA */}
                {msg.role === "assistant" && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124,92,255,0.20), rgba(200,167,93,0.10))",
                      border: msg.error
                        ? "1px solid rgba(251,113,133,0.35)"
                        : "1px solid rgba(124,92,255,0.25)",
                    }}
                  >
                    {msg.error ? (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    ) : (
                      <Sparkles
                        className="w-3 h-3"
                        style={{ color: "#a698ff" }}
                      />
                    )}
                  </div>
                )}

                {/* Balão de mensagem */}
                <div className="flex flex-col gap-1.5 max-w-[85%]">
                  {/* Badge de modo (só IA, não boas-vindas) */}
                  {msg.role === "assistant" &&
                    msg.id !== "welcome" &&
                    msg.modo &&
                    !msg.error && (
                      <div className="flex">
                        <ModoBadge modo={msg.modo} />
                      </div>
                    )}

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-sans leading-relaxed tracking-tight",
                      msg.role === "user"
                        ? "text-bg-base font-medium"
                        : "text-text-primary"
                    )}
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                            boxShadow: "0 4px 16px -4px rgba(0,0,0,0.4)",
                          }
                        : msg.error
                        ? {
                            background:
                              "linear-gradient(180deg, rgba(251,113,133,0.06) 0%, rgba(251,113,133,0.02) 100%)",
                            border: "1px solid rgba(251,113,133,0.15)",
                          }
                        : {
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }
                    }
                  >
                    <div
                      className="prose prose-sm max-w-none ai-content"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Indicador de digitação */}
          <AnimatePresence>
            {thinking && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex gap-3 justify-start"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,0.20), rgba(200,167,93,0.10))",
                    border: "1px solid rgba(124,92,255,0.25)",
                  }}
                >
                  <Sparkles className="w-3 h-3" style={{ color: "#a698ff" }} />
                </div>
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.005) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-violet-400/60"
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.18,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sugestões iniciais */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4"
              >
                {SUGESTOES.slice(0, 6).map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => send(s)}
                    className="text-left px-4 py-3 rounded-xl text-xs text-text-secondary hover:text-text-primary transition-all duration-200 font-sans tracking-tight"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input ──────────────────────────────────────── */}
      <div
        className="relative z-10 px-4 py-4 border-t border-white/[0.05]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,8,11,0.5) 0%, rgba(6,8,11,0.95) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div
            className="flex items-end gap-2 rounded-2xl p-2"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "0 0 0 1px rgba(124,92,255,0.05) inset",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre qualquer tema do concurso... (Enter para enviar)"
              rows={1}
              disabled={thinking}
              className="flex-1 bg-transparent text-text-primary text-sm placeholder-text-muted resize-none focus:outline-none px-3 py-2 font-sans tracking-tight disabled:opacity-50"
              style={{ minHeight: "38px", maxHeight: "120px" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || thinking}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{
                background:
                  input.trim() && !thinking
                    ? "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)"
                    : "rgba(255,255,255,0.04)",
                color:
                  input.trim() && !thinking
                    ? "#06080B"
                    : "rgba(255,255,255,0.4)",
                boxShadow:
                  input.trim() && !thinking
                    ? "0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 12px -2px rgba(255,255,255,0.20)"
                    : "none",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer info */}
          <p className="text-center text-[10px] text-text-muted mt-2 font-sans tracking-tight">
            Powered by Gemini · Especialista FCC, Cebraspe & FGV ·{" "}
            <span className="opacity-60">Shift+Enter para nova linha</span>
          </p>
        </div>
      </div>

      {/* Estilos para o conteúdo de markdown */}
      <style>{`
        .ai-content h1, .ai-content h2, .ai-content h3, .ai-content h4 {
          color: rgba(255,255,255,0.92);
          font-weight: 600;
          margin: 1rem 0 0.5rem;
          font-family: inherit;
          letter-spacing: -0.02em;
        }
        .ai-content h1 { font-size: 1.05rem; }
        .ai-content h2 { font-size: 0.95rem; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 0.25rem; }
        .ai-content h3 { font-size: 0.875rem; color: rgba(166,152,255,0.9); }
        .ai-content h4 { font-size: 0.8rem; color: rgba(255,255,255,0.7); }
        .ai-content p { margin: 0.5rem 0; line-height: 1.7; }
        .ai-content ul, .ai-content ol { margin: 0.5rem 0 0.5rem 1.2rem; }
        .ai-content li { margin: 0.25rem 0; line-height: 1.6; }
        .ai-content ol { list-style: decimal; }
        .ai-content ul { list-style: disc; }
        .ai-content strong { color: rgba(255,255,255,0.95); font-weight: 600; }
        .ai-content em { color: rgba(200,167,93,0.9); font-style: italic; }
        .ai-content code { 
          background: rgba(124,92,255,0.12); 
          color: rgba(166,152,255,0.95);
          padding: 0.15em 0.4em; 
          border-radius: 4px; 
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82em;
          border: 1px solid rgba(124,92,255,0.2);
        }
        .ai-content pre.code-block {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 1rem;
          margin: 0.75rem 0;
          overflow-x: auto;
        }
        .ai-content pre.code-block code {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.82em;
          color: rgba(200,255,200,0.85);
        }
        .ai-content blockquote {
          border-left: 3px solid rgba(124,92,255,0.5);
          padding-left: 1rem;
          margin: 0.75rem 0;
          color: rgba(255,255,255,0.65);
          font-style: italic;
        }
        .ai-content hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.07);
          margin: 1rem 0;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
