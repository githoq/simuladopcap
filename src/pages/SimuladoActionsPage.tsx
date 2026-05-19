/**
 * SimuladoActionsPage — Tela intermediária após gerar o simulado.
 * Fluxo: GeneratorPage → SimuladoActionsPage → ExamPage ou FocusPage
 *
 * Ações:
 * 1. Iniciar Prova  → /exam
 * 2. Modo Foco      → /focus (leitura contínua sem distração)
 * 3. Exportar PDF   → exportExamPDF (caderno A4 institucional)
 * 4. Compartilhar   → navigator.share / clipboard
 * 5. Abrir Banco    → /bank
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Download, Share2, BookOpen,
  FileText, Clock, Layers, CheckCircle, ArrowLeft, Focus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { fadeUp, timing } from "../lib/motion";
import { exportExamPDF } from "../lib/pdf";
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-text-secondary font-sans">Nenhum simulado configurado.</p>
        <Button variant="primary" onClick={() => navigate("/generator")}>
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
    <motion.div
      {...fadeUp}
      transition={timing.smooth}
      className="max-w-lg mx-auto px-4 pb-24 pt-6 md:pb-8 md:pt-20 space-y-5"
    >
      {/* Back */}
      <button
        onClick={() => navigate("/generator")}
        className="flex items-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors text-xs font-sans"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Reconfigurar
      </button>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "rgba(200,167,93,0.05)", borderColor: "rgba(200,167,93,0.18)" }}
      >
        <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(200,167,93,0.5),transparent)" }} />
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(200,167,93,0.10)", borderColor: "rgba(200,167,93,0.22)" }}>
            <FileText className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-text-primary mb-1 tabular-nums">{totalQ} questões</h1>
          <p className="text-text-secondary text-sm font-sans">
            {exam.mode === "prova" ? "Prova cronometrada" : "Modo treino"} · {timeStr}
          </p>
        </div>

        <div className="grid grid-cols-3 border-t" style={{ borderColor: "rgba(200,167,93,0.10)" }}>
          {([
            { icon: Layers,       label: "Disciplinas", value: discs.length },
            { icon: Clock,        label: "Tempo",       value: timeStr },
            { icon: CheckCircle,  label: "Questões",    value: totalQ },
          ] as const).map((s, si) => {
            const Icon = s.icon;
            return (
              <div key={si} className={`flex flex-col items-center py-3 gap-1 ${si < 2 ? "border-r" : ""}`}
                style={{ borderColor: "rgba(200,167,93,0.10)" }}>
                <Icon className="w-3.5 h-3.5 text-gold opacity-60" />
                <span className="text-base font-bold font-mono text-text-primary tabular-nums">{s.value}</span>
                <span className="text-[10px] text-text-muted font-sans uppercase tracking-wide">{s.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Discipline pills */}
      <div className="flex flex-wrap gap-1.5">
        {discs.map((d) => (
          <span key={d} className="text-[10px] px-2 py-0.5 rounded-full font-sans font-medium"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.38)", border: "0.5px solid rgba(255,255,255,0.07)" }}>
            {d.length > 20 ? d.slice(0, 18) + "…" : d}
          </span>
        ))}
      </div>

      {/* PRIMARY */}
      <Button variant="primary" size="lg" className="w-full text-base"
        icon={<Play className="w-4 h-4" />} onClick={handleStart}>
        Iniciar Prova
      </Button>

      {/* SECONDARY GRID */}
      <div className="grid grid-cols-2 gap-3">

        {/* Modo Foco */}
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleFocus}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
          <Focus className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
          <div className="text-center">
            <div className="text-sm font-semibold text-text-primary">Modo Foco</div>
            <div className="text-[10px] text-text-muted mt-0.5">Sem distração</div>
          </div>
        </motion.button>

        {/* Exportar PDF */}
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleExportPDF}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{
            background:   pdfDone ? "rgba(34,197,94,0.06)"  : "rgba(255,255,255,0.02)",
            borderColor:  pdfDone ? "rgba(34,197,94,0.25)"  : "rgba(255,255,255,0.07)",
          }}>
          <Download className={`w-5 h-5 transition-colors ${pdfDone ? "text-[#22c55e]" : "text-text-secondary group-hover:text-text-primary"}`} />
          <div className="text-center">
            <div className={`text-sm font-semibold ${pdfDone ? "text-[#22c55e]" : "text-text-primary"}`}>
              {pdfDone ? "PDF gerado!" : "Exportar PDF"}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Caderno A4</div>
          </div>
        </motion.button>

        {/* Compartilhar */}
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleShare}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{
            background:  copied ? "rgba(200,167,93,0.06)" : "rgba(255,255,255,0.02)",
            borderColor: copied ? "rgba(200,167,93,0.25)" : "rgba(255,255,255,0.07)",
          }}>
          <Share2 className={`w-5 h-5 transition-colors ${copied ? "text-gold" : "text-text-secondary group-hover:text-text-primary"}`} />
          <div className="text-center">
            <div className={`text-sm font-semibold ${copied ? "text-gold" : "text-text-primary"}`}>
              {copied ? "Link copiado!" : "Compartilhar"}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Enviar simulado</div>
          </div>
        </motion.button>

        {/* Banco */}
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/bank")}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
          <BookOpen className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
          <div className="text-center">
            <div className="text-sm font-semibold text-text-primary">Abrir Banco</div>
            <div className="text-[10px] text-text-muted mt-0.5">Browsear questões</div>
          </div>
        </motion.button>
      </div>

      <p className="text-center text-[11px] text-text-muted font-sans leading-relaxed">
        O caderno PDF usa formato FCC oficial — imprima para estudar offline.
      </p>
    </motion.div>
  );
}
