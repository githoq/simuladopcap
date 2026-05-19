/**
 * ApoioBlock — FCC support text block.
 *
 * EXAM MODE (isExam=true):
 *   Pure editorial inline flow — no label, no toggle, no wrapper chrome.
 *   Identical to reading a printed FCC exam booklet.
 *
 * REVIEW MODE (isExam=false, default):
 *   Collapsible with "Texto de apoio" label — for post-exam review.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { getRenderer } from "./FCCRenderer";
import type { Question } from "../../types";

interface ApoioBlockProps {
  question:   Question;
  className?: string;
  isExam?:    boolean;   // true = prova real: sem label, sem accordion
}

export function ApoioBlock({ question, className, isExam = false }: ApoioBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!question.texto_apoio) return null;

  const renderer = getRenderer(question.banca);
  const content  = renderer.renderApoio(question.texto_apoio, question);
  if (!content) return null;

  // ── EXAM MODE — editorial puro ──────────────────────────────────────
  if (isExam) {
    return (
      <div className={cn("fcc-apoio-exam w-full", className)}>
        {content}
      </div>
    );
  }

  // ── REVIEW MODE — collapsível com label ─────────────────────────────
  return (
    <div className={cn("w-full", className)}>
      <div className="h-px bg-white/[0.05] mb-2" />

      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-1.5 mb-1.5 group"
      >
        <span className="text-[10px] font-sans text-text-tertiary tracking-widest uppercase opacity-70">
          {collapsed ? "▸" : "▾"} Texto de apoio
        </span>
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="py-1 px-0.5 bg-white/[0.02] rounded-sm">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!collapsed && <div className="h-px bg-white/[0.05] mt-2" />}
    </div>
  );
}
