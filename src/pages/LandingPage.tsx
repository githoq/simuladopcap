/**
 * LandingPage — Cinematic premium hero with BackgroundPaths.
 * Full viewport, centered CTA, floating pill nav above.
 * Inspired by: MotionSites, Linear, Framer.
 */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { BackgroundPaths } from "../components/ui/BackgroundPaths";

const PROOF = [
  "741 questões FCC originais",
  "Sem cadastro, gratuito",
  "Gabarito e revisão completos",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 400], [0, 60]);
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Staggered letter animation for title
  const title = "PC-AP Simulados";
  const subtitle = "Treinamento de alta performance para a Polícia Civil do Amapá";

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "#05070A" }}
    >
      {/* Animated background — full opacity on landing */}
      <BackgroundPaths opacity={1} />

      {/* Radial vignette to focus center */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(5,7,10,0.55) 100%)",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[1]"
        style={{ background: "linear-gradient(to top, #05070A, transparent)" }}
      />

      {/* Hero — exact viewport center */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center min-h-screen"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] text-xs font-sans font-medium mb-8"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e80", animation: "pulse 2.5s infinite" }}
          />
          FCC · Concurso PC-AP · 741 questões
        </motion.div>

        {/* Title — letter stagger */}
        <h1 className="font-sans font-bold tracking-tighter leading-[1.05] mb-5 text-balance">
          {title.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.15 + i * 0.022,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block"
              style={{
                fontSize: "clamp(2.6rem, 7vw, 5rem)",
                color: char === " " ? "transparent" : "rgba(255,255,255,0.93)",
                marginRight: char === " " ? "0.3em" : undefined,
              }}
            >
              {char === " " ? "\u00a0" : char}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="font-sans text-base max-w-md mx-auto mb-10 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          {subtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={() => navigate("/generator")}
            className="group inline-flex items-center gap-3 font-sans font-semibold"
            style={{
              fontSize: "1rem",
              padding: "14px 32px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.95)",
              color: "#05070A",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
              cursor: "pointer",
            }}
          >
            Gerar Simulado
            <ArrowRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
              style={{ opacity: 0.6 }}
            />
          </motion.button>

          {/* TEC Concursos secondary CTA */}
          <motion.a
            href="https://www.tecconcursos.com.br"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="group inline-flex items-center gap-2 font-sans font-medium"
            style={{
              fontSize: "0.9rem",
              padding: "13px 22px",
              borderRadius: "14px",
              background: "rgba(59,130,246,0.08)",
              color: "rgba(147,197,253,0.85)",
              border: "1px solid rgba(59,130,246,0.22)",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            TEC Concursos
          </motion.a>
        </motion.div>

        {/* Proof items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {PROOF.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-xs font-sans"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              <Check className="w-3 h-3" style={{ color: "#22c55e", opacity: 0.8 }} />
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* Subtle scroll cue */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
      >
        <div
          className="w-4 h-6 rounded-full border flex items-start justify-center pt-1.5"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-0.5 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.25)" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
