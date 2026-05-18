/**
 * SimuladoActionsPage — Tela intermediária após gerar o simulado.
 * Fluxo: GeneratorPage → SimuladoActionsPage → ExamPage
 *
 * Ações disponíveis:
 * 1. Iniciar Prova → /exam
 * 2. Exportar PDF  → exportExamPDF (caderno A4 institucional)
 * 3. Compartilhar  → navigator.share / clipboard
 * 4. Abrir Banco   → /bank
 * 5. TEC Concursos → link externo
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Download, Share2, BookOpen, ExternalLink,
  FileText, Clock, Layers, CheckCircle, ArrowLeft,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { fadeUp, timing } from "../lib/motion";
import { exportExamPDF } from "../lib/pdf";
import { LETTERS } from "../lib/constants";
import { fmtTime } from "../lib/utils";
import type { Exam } from "../types";

interface SimuladoActionsPageProps {
  exam: Exam | null;
  onStartExam: () => void;
}

export default function SimuladoActionsPage({ exam, onStartExam }: SimuladoActionsPageProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-text-secondary">Nenhum simulado configurado.</p>
        <Button variant="primary" onClick={() => navigate("/generator")}>
          Criar simulado
        </Button>
      </div>
    );
  }

  const totalQ = exam.questions.length;
  const discs = [...new Set(exam.questions.map((q) => q.disciplina))];
  const timeStr = exam.mode === "prova"
    ? `${exam.timeLimit / 60} min`
    : "Sem limite";

  const handleExportPDF = () => {
    exportExamPDF(exam);
    setPdfDone(true);
    setTimeout(() => setPdfDone(false), 3000);
  };

  const handleShare = async () => {
    const text = `PC-AP Simulados — ${totalQ} questões FCC | ${discs.slice(0, 3).join(", ")}${discs.length > 3 ? "…" : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "PC-AP Simulados", text, url: window.location.origin });
        return;
      } catch (_) {}
    }
    await navigator.clipboard.writeText(text + " → " + window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleStart = () => {
    onStartExam();
    navigate("/exam");
  };

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

      {/* Simulado summary card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "rgba(200,167,93,0.05)", borderColor: "rgba(200,167,93,0.18)" }}
      >
        {/* Shimmer top */}
        <div
          className="h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(200,167,93,0.5), transparent)" }}
        />
        <div className="p-6 text-center">
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(200,167,93,0.10)", borderColor: "rgba(200,167,93,0.22)" }}
          >
            <FileText className="w-5 h-5 text-gold" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-text-primary mb-1 tabular-nums">
            {totalQ} questões
          </h1>
          <p className="text-text-secondary text-sm font-sans">
            {exam.mode === "prova" ? "Prova cronometrada" : "Modo treino"} · {timeStr}
          </p>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-3 divide-x border-t"
          style={{ borderColor: "rgba(200,167,93,0.10)", "--tw-divide-opacity": 1 } as any}
        >
          {[
            { icon: Layers, label: "Disciplinas", value: discs.length },
            { icon: Clock, label: "Tempo", value: timeStr },
            { icon: CheckCircle, label: "Questões", value: totalQ },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex flex-col items-center py-3 gap-1">
                <Icon className="w-3.5 h-3.5 text-gold opacity-60" />
                <span className="text-base font-bold font-mono text-text-primary tabular-nums">{s.value}</span>
                <span className="text-[10px] text-text-muted font-sans uppercase tracking-wide">{s.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Disciplines pills */}
      <div className="flex flex-wrap gap-1.5">
        {discs.map((d) => (
          <span
            key={d}
            className="text-[10px] px-2 py-0.5 rounded-full font-sans font-medium"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.38)", border: "0.5px solid rgba(255,255,255,0.07)" }}
          >
            {d.length > 20 ? d.slice(0, 18) + "…" : d}
          </span>
        ))}
      </div>

      {/* ── PRIMARY ACTION ── */}
      <Button
        variant="primary"
        size="lg"
        className="w-full text-base"
        icon={<Play className="w-4 h-4" />}
        onClick={handleStart}
      >
        Iniciar Prova
      </Button>

      {/* ── SECONDARY ACTIONS ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Exportar PDF */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportPDF}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{
            background: pdfDone ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
            borderColor: pdfDone ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)",
          }}
        >
          <Download className={`w-5 h-5 ${pdfDone ? "text-[#22c55e]" : "text-text-secondary group-hover:text-text-primary"} transition-colors`} />
          <div className="text-center">
            <div className={`text-sm font-semibold ${pdfDone ? "text-[#22c55e]" : "text-text-primary"}`}>
              {pdfDone ? "PDF gerado!" : "Exportar PDF"}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Caderno A4 oficial</div>
          </div>
        </motion.button>

        {/* Compartilhar */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{
            background: copied ? "rgba(200,167,93,0.06)" : "rgba(255,255,255,0.02)",
            borderColor: copied ? "rgba(200,167,93,0.25)" : "rgba(255,255,255,0.07)",
          }}
        >
          <Share2 className={`w-5 h-5 ${copied ? "text-gold" : "text-text-secondary group-hover:text-text-primary"} transition-colors`} />
          <div className="text-center">
            <div className={`text-sm font-semibold ${copied ? "text-gold" : "text-text-primary"}`}>
              {copied ? "Link copiado!" : "Compartilhar"}
            </div>
            <div className="text-[10px] text-text-muted mt-0.5">Enviar simulado</div>
          </div>
        </motion.button>

        {/* Banco de Questões */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/bank")}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <BookOpen className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
          <div className="text-center">
            <div className="text-sm font-semibold text-text-primary">Abrir Banco</div>
            <div className="text-[10px] text-text-muted mt-0.5">Browsear questões</div>
          </div>
        </motion.button>

        {/* TEC Concursos */}
        <motion.a
          href="https://www.tecconcursos.com.br"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all font-sans cursor-pointer"
          style={{
            background: "rgba(59,130,246,0.04)",
            borderColor: "rgba(59,130,246,0.15)",
            textDecoration: "none",
          }}
        >
          <ExternalLink className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <div className="text-center">
            <div className="text-sm font-semibold text-text-primary">TEC Concursos</div>
            <div className="text-[10px] text-text-muted mt-0.5">tecconcursos.com.br</div>
          </div>
        </motion.a>
      </div>

      {/* Dica */}
      <p className="text-center text-[11px] text-text-muted font-sans leading-relaxed">
        O caderno PDF é idêntico ao formato FCC oficial — imprima para estudar offline.
      </p>
    </motion.div>
  );
}
