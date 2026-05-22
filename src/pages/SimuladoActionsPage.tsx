/**
 * SimuladoActionsPage — Premium intermediate screen between Generator and Exam.
 * Cinematic summary card with gradient halo + asymmetric action grid.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Download, Share2, BookOpen,
  FileText, Clock, Layers, CheckCircle, ArrowLeft, Focus, Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { exportExamPDF } from "../lib/pdf";
import { cn } from "../lib/utils";
import type { Exam } from "../types";

interface SimuladoActionsPageProps {
  exam: Exam | null;
  onStartExam: () => void;
}

export default function SimuladoActionsPage({ exam, onStartExam }: SimuladoActionsPageProps) {
  const navigate = useNavigate();
  const [copied,  setCopied]  = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  if (!exam) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center gap-4" style={{ background: "#06080B" }}>
        <AmbientBackground variant="workspace" />
        <p className="text-text-secondary font-sans relative z-10">Nenhum simulado configurado.</p>
        <Button variant="gold" onClick={() => navigate("/generator")} className="relative z-10">
          Criar simulado
        </Button>
      </div>
    );
  }

  const totalQ  = exam.questions.length;
  const discs   = [...new Set(exam.questions.map((q) => q.disciplina))];
  const timeStr = exam.mode === "prova" ? `${exam.timeLimit / 60} min` : "Sem limite";

  const handleExportPDF = () => {
    exportExamPDF(exam);
    setPdfDone(true);
    setTimeout(() => setPdfDone(false), 3000);
  };

  const handleShare = async () => {
    const text = `PC-AP Simulados — ${totalQ} questões FCC | ${discs.slice(0, 3).join(", ")}${discs.length > 3 ? "…" : ""}`;
    if (navigator.share) {
      try { await navigator.share({ title: "PC-AP Simulados", text, url: window.location.origin }); return; }
      catch (_) {}
    }
    await navigator.clipboard.writeText(text + " → " + window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleStart = () => { onStartExam(); navigate("/exam"); };
  const handleFocus = () => { onStartExam(); navigate("/focus"); };

  return (
    <div className="min-h-screen relative" style={{ background: "#06080B" }}>
      <AmbientBackground variant="workspace" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pb-24 pt-24 md:pb-12 space-y-5">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate("/generator")}
          className="group flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors text-xs font-sans tracking-tight"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Reconfigurar
        </motion.button>

        {/* Hero Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Backdrop glow */}
          <div
            aria-hidden
            className="absolute -inset-4 blur-3xl pointer-events-none opacity-70"
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 30%, rgba(200,167,93,0.25), transparent 70%)",
            }}
          />

          <div
            className="relative rounded-3xl overflow-hidden border-gradient-gold border-gradient"
            style={{
              background:
                "linear-gradient(180deg, rgba(200,167,93,0.06) 0%, rgba(15,20,27,0.92) 60%)",
              border: "1px solid rgba(200,167,93,0.20)",
              boxShadow:
                "inset 0 1px 0 rgba(200,167,93,0.10), 0 16px 48px -16px rgba(0,0,0,0.6)",
            }}
          >
            {/* Top hairline */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(228,204,149,0.6), transparent)" }} />

            <div className="p-7 text-center">
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(228,204,149,0.25), rgba(200,167,93,0.08))",
                  border: "1px solid rgba(200,167,93,0.30)",
                  boxShadow: "0 0 32px -8px rgba(200,167,93,0.5)",
                }}
              >
                <FileText className="w-6 h-6 text-gold" />
              </div>
              <h1
                className="font-mono font-semibold mb-1.5 tabular-nums tracking-tightest"
                style={{
                  fontSize: "clamp(2rem, 5vw, 2.75rem)",
                  background: "linear-gradient(180deg, #ffffff 0%, rgba(228,204,149,0.85) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                {totalQ} questões
              </h1>
              <p className="text-text-secondary text-sm font-sans tracking-tight">
                {exam.mode === "prova" ? "Prova cronometrada" : "Modo treino"} <span className="text-text-muted">·</span> {timeStr}
              </p>
            </div>

            <div className="grid grid-cols-3 border-t" style={{ borderColor: "rgba(200,167,93,0.12)" }}>
              {([
                { icon: Layers,      label: "Disciplinas", value: discs.length },
                { icon: Clock,       label: "Tempo",       value: timeStr },
                { icon: CheckCircle, label: "Questões",    value: totalQ },
              ] as const).map((s, si) => {
                const Icon = s.icon;
                return (
                  <div
                    key={si}
                    className={`flex flex-col items-center py-4 gap-1 ${si < 2 ? "border-r" : ""}`}
                    style={{ borderColor: "rgba(200,167,93,0.08)" }}
                  >
                    <Icon className="w-3.5 h-3.5 text-gold/60" />
                    <span className="text-base font-bold font-mono text-text-primary tabular-nums">{s.value}</span>
                    <span className="text-[10px] text-text-muted font-sans uppercase tracking-wider">{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Discipline pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-1.5"
        >
          {discs.map((d) => (
            <span
              key={d}
              className="text-[10px] px-2.5 py-1 rounded-full font-sans font-medium tracking-tight"
              style={{
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {d.length > 22 ? d.slice(0, 20) + "…" : d}
            </span>
          ))}
        </motion.div>

        {/* PRIMARY CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="primary" size="lg" className="w-full !h-12 !text-base"
            icon={<Play className="w-4 h-4" />}
            onClick={handleStart}
          >
            Iniciar prova
          </Button>
        </motion.div>

        {/* SECONDARY GRID */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <ActionTile icon={Focus} label="Modo Foco" desc="Sem distração" onClick={handleFocus} />
          <ActionTile
            icon={Download} label={pdfDone ? "PDF gerado!" : "Exportar PDF"} desc="Caderno A4"
            onClick={handleExportPDF} success={pdfDone}
          />
          <ActionTile
            icon={Share2} label={copied ? "Link copiado!" : "Compartilhar"} desc="Enviar simulado"
            onClick={handleShare} gold={copied}
          />
          <ActionTile icon={BookOpen} label="Abrir Banco" desc="Browsear questões" onClick={() => navigate("/bank")} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-[11px] text-text-muted font-sans leading-relaxed pt-2"
        >
          O caderno PDF usa formato FCC oficial — imprima para estudar offline.
        </motion.p>
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon, label, desc, onClick, success = false, gold = false,
}: { icon: any; label: string; desc: string; onClick: () => void; success?: boolean; gold?: boolean }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-2xl font-sans transition-all duration-300"
      style={
        success
          ? {
              background: "linear-gradient(180deg, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.01) 100%)",
              border: "1px solid rgba(34,197,94,0.30)",
              boxShadow: "0 0 20px -6px rgba(34,197,94,0.30)",
            }
          : gold
            ? {
                background: "linear-gradient(180deg, rgba(200,167,93,0.10) 0%, rgba(200,167,93,0.01) 100%)",
                border: "1px solid rgba(200,167,93,0.30)",
                boxShadow: "0 0 20px -6px rgba(200,167,93,0.30)",
              }
            : {
                background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.004) 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }
      }
    >
      <Icon
        className={cn(
          "w-5 h-5 transition-colors duration-300",
          success ? "text-[#22c55e]" : gold ? "text-gold" : "text-text-secondary group-hover:text-text-primary"
        )}
      />
      <div className="text-center">
        <div className={cn(
          "text-sm font-semibold font-sans tracking-tight",
          success ? "text-[#22c55e]" : gold ? "text-gold" : "text-text-primary"
        )}>
          {label}
        </div>
        <div className="text-[10px] text-text-muted mt-0.5">{desc}</div>
      </div>
    </motion.button>
  );
}
