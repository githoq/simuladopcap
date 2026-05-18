/**
 * ApoioBlock — FCC support text block.
 *
 * Design target: NOT a UI callout component.
 * Target: embedded editorial passage, document-native.
 *
 * Visual treatment:
 * - No border-left (removed — was too "callout box")
 * - Hairline border-top + border-bottom (document passage separator)
 * - Ultra-minimal label, almost invisible
 * - Content flows as part of the document
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { getRenderer } from "./FCCRenderer";
import type { Question } from "../../types";

interface ApoioBlockProps {
  question:   Question;
  className?: string;
}

export function ApoioBlock({ question, className }: ApoioBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!question.texto_apoio) return null;

  const renderer = getRenderer(question.banca);
  const content  = renderer.renderApoio(question.texto_apoio, question);
  if (!content) return null;

  return (
    <div className={cn("w-full", className)}>
      {/* ── Horizontal separator (top) ─────────────────────────────── */}
      <div className="h-px bg-white/[0.05] mb-2" />

      {/* ── Minimal collapse trigger ────────────────────────────────── */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-1.5 mb-1.5 group"
      >
        <span className="text-[10px] font-sans text-text-tertiary tracking-widest uppercase opacity-70">
          {collapsed ? "▸" : "▾"} Texto de apoio
        </span>
      </button>

      {/* ── Content — document-embedded ───────────────────────────── */}
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

      {/* ── Horizontal separator (bottom) ──────────────────────────── */}
      {!collapsed && <div className="h-px bg-white/[0.05] mt-2" />}
    </div>
  );
}
