/**
 * LandingPage — Cinematic hero.
 *
 * Design intent: Linear × Apple × Vercel.
 *  - Massive gradient headline with Instrument Serif italic word
 *  - Animated aurora orbs
 *  - Floating "live preview" card with mock dashboard
 *  - Subtle scroll cue
 *  - Premium CTA with shimmer
 */
import { useRef, type MouseEvent, type ComponentType } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Activity, Clock, BookOpen, Target } from "lucide-react";
import { AmbientBackground } from "../components/ui/AmbientBackground";

const STATS = [
  { label: "Questões FCC", value: "3.851" },
  { label: "Disciplinas",  value: "9" },
  { label: "Modos",        value: "3" },
];

const PROOF = [
  "Sem cadastro",
  "100% gratuito",
  "Analytics completo",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: "#06080B" }}
    >
      {/* Premium ambient backdrop */}
      <AmbientBackground variant="hero" />

      {/* HERO */}
      <motion.section

        className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12"
      >
        {/* Top status badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="mb-8 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" style={{ boxShadow: "0 0 8px #22c55e" }} />
          </span>
          <span className="text-[11px] font-sans font-medium tracking-tight text-text-secondary">
            Concurso PC-AP · FCC · Banco atualizado
          </span>
        </motion.div>

        {/* Massive headline */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center font-sans font-semibold tracking-tightest leading-[0.95] mb-6 text-balance"
          style={{ fontSize: "clamp(2.75rem, 9vw, 6.5rem)" }}
        >
          <motion.span
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="block text-gradient-muted"
          >
            Treinamento de
          </motion.span>
          <motion.span
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="block"
          >
            <span className="text-gradient-muted">alta </span>
            <span
              className="font-display italic"
              style={{
                background: "linear-gradient(135deg, #e4cc95 0%, #c8a75d 50%, #d6b97a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                paddingRight: "0.05em",
              }}
            >
              performance
            </span>
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center font-sans text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed tracking-tight"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          O banco mais completo de questões FCC para a Polícia Civil do Amapá.
          Banco com <span className="text-text-primary font-medium">741 questões FCC</span> originais e analytics profundo.
        </motion.p>

        {/* CTA group */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.62 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {/* Primary CTA — with persistent ambient halo */}
          <div className="relative">
            {/* Always-on soft gold aura */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl opacity-60 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 100% at 50% 50%, rgba(228,204,149,0.35), transparent 70%)",
                transform: "scale(1.4)",
              }}
            />
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={() => navigate("/generator")}
              className="group relative overflow-hidden inline-flex items-center gap-2.5 font-sans font-semibold tracking-tight"
              style={{
                fontSize: "0.9375rem",
                padding: "14px 28px",
                borderRadius: "999px",
                background: "linear-gradient(180deg, #ffffff 0%, #e4e4e7 100%)",
                color: "#06080B",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.7) inset, " +
                  "0 0 0 1px rgba(255,255,255,0.25), " +
                  "0 10px 28px -4px rgba(255,255,255,0.22), " +
                  "0 0 48px -8px rgba(228,204,149,0.55)",
              }}
            >
              <span className="relative z-10">Gerar simulado</span>
              <ArrowRight
                className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                style={{ opacity: 0.7 }}
              />
              {/* Shimmer overlay */}
              <span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(110deg, transparent 35%, rgba(200,167,93,0.35) 50%, transparent 65%)",
                  backgroundSize: "200% 100%",
                  backgroundPosition: "200% 0",
                  transition: "background-position 800ms cubic-bezier(0.16,1,0.3,1)",
                }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.backgroundPosition = "-50% 0"; }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLElement).style.backgroundPosition = "200% 0"; }}
              />
            </motion.button>
          </div>

          {/* Secondary */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/bank")}
            className="inline-flex items-center gap-2 font-sans font-medium tracking-tight"
            style={{
              fontSize: "0.9375rem",
              padding: "13px 22px",
              borderRadius: "999px",
              color: "rgba(255,255,255,0.75)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
            }}
          >
            <BookOpen className="w-4 h-4 opacity-60" />
            Explorar banco
          </motion.button>
        </motion.div>

        {/* Stats row — editorial hairline + tabular numerals */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-16 w-full max-w-md relative"
        >
          {/* Top hairline */}
          <div
            aria-hidden
            className="absolute -top-6 left-1/4 right-1/4 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.10) 30%, rgba(200,167,93,0.18) 50%, rgba(255,255,255,0.10) 70%, transparent)",
            }}
          />
          <div className="grid grid-cols-3 gap-4 sm:gap-10">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.95 + i * 0.06 }}
                className="text-center"
              >
                <div
                  className="font-mono font-semibold tabular-nums"
                  style={{
                    fontSize: "1.625rem",
                    background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.55) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mt-1.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Proof items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {PROOF.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-[11px] font-sans tracking-tight"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <span className="w-1 h-1 rounded-full bg-emerald-400/80" />
              {item}
            </span>
          ))}
        </motion.div>
      </motion.section>

      {/* DASHBOARD PREVIEW SECTION — floating premium mockup */}
      <section className="relative z-10 px-6 pb-24 -mt-12">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto relative"
        >
          {/* Backdrop glow */}
          <div
            aria-hidden
            className="absolute inset-0 -inset-x-12 blur-3xl pointer-events-none opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(200,167,93,0.18), transparent 60%), " +
                "radial-gradient(ellipse 60% 40% at 30% 70%, rgba(124,92,255,0.14), transparent 60%)",
            }}
          />

          {/* The card */}
          <div
            className="relative rounded-2xl overflow-hidden border-gradient"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,20,27,0.92) 0%, rgba(11,15,20,0.96) 100%)",
              backdropFilter: "blur(24px)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.08) inset, " +
                "0 24px 64px -12px rgba(0,0,0,0.7), " +
                "0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Top toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
                <span className="w-1 h-1 rounded-full bg-emerald-400/70" style={{ boxShadow: "0 0 6px #22c55e" }} />
                <span className="text-[10px] text-text-tertiary font-mono">pc-ap.app/dashboard</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-mono">
                <span className="w-1 h-1 rounded-full bg-emerald-400/80" />
                live
              </div>
            </div>

            {/* Mock content */}
            <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Big stat */}
              <div className="sm:col-span-2 rounded-xl p-5 sm:p-6 relative overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(200,167,93,0.08) 0%, rgba(200,167,93,0.01) 100%)",
                  border: "1px solid rgba(200,167,93,0.18)",
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gold/80 font-sans">
                    <Activity className="w-3 h-3" />
                    Performance
                  </div>
                  <span className="text-[10px] text-text-muted font-mono">últimos 30d</span>
                </div>
                <div className="font-display italic" style={{
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  background: "linear-gradient(135deg, #e4cc95, #c8a75d)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                }}>
                  84%
                </div>
                <div className="mt-2 text-sm text-text-secondary font-sans">
                  Média de acertos · <span className="text-emerald-400">↑ 12pts</span>
                </div>

                {/* Sparkline */}
                <svg className="mt-6 w-full" height="60" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(200,167,93,0.4)" />
                      <stop offset="100%" stopColor="rgba(200,167,93,0)" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,45 Q40,38 60,32 T120,28 T180,18 T240,12 T300,8"
                    fill="none"
                    stroke="#c8a75d"
                    strokeWidth="1.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1.6, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M0,45 Q40,38 60,32 T120,28 T180,18 T240,12 T300,8 L300,60 L0,60 Z"
                    fill="url(#spark)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 2.4 }}
                  />
                </svg>
              </div>

              {/* Small stats */}
              <div className="grid grid-cols-1 gap-4">
                <MockStat icon={Target} label="Acertos hoje" value="47/52" color="#22c55e" />
                <MockStat icon={Clock} label="Tempo médio" value="1m 42s" color="#c8a75d" />
                <MockStat icon={Sparkles} label="Streak" value="7 dias" color="#fb923c" />
              </div>
            </div>

            {/* Bottom data list */}
            <div className="border-t border-white/[0.04] p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mb-3">
                Últimas provas
              </div>
              <div className="space-y-1.5">
                {[
                  { name: "Bloco Direito Penal", time: "há 2h", pct: 78, color: "#22c55e" },
                  { name: "Português Avançado",  time: "ontem", pct: 64, color: "#f59e0b" },
                  { name: "Constitucional Geral",time: "2 dias",pct: 92, color: "#22c55e" },
                ].map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.7 + i * 0.08 }}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className="w-1 h-6 rounded-full" style={{ background: row.color, boxShadow: `0 0 8px ${row.color}80` }} />
                    <div className="flex-1 text-sm text-text-primary font-sans">{row.name}</div>
                    <div className="text-xs text-text-tertiary font-mono">{row.time}</div>
                    <div className="text-sm font-mono font-semibold tabular-nums" style={{ color: row.color }}>{row.pct}%</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function MockStat({ icon: Icon, label, value, color }: { icon: ComponentType; label: string; value: string; color: string }) {
  return (
    <div
      className="rounded-xl p-3.5 relative"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Icon className="w-3.5 h-3.5 mb-2" style={{ color }} />
      <div className="text-base font-semibold font-mono tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-sans mt-0.5">{label}</div>
    </div>
  );
}
