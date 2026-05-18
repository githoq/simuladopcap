/**
 * FCC Renderer — Institutional exam rendering architecture.
 *
 * Extensible: BancaRenderer interface → FCCRenderer.
 * All content is sanitized + runtime-normalized before rendering.
 * Typography: Georgia serif via CSS classes.
 * Underlines: text-decoration:underline (NEVER faked).
 */

import type { JSX } from "react";
import { createElement } from "react";
import { sanitizeHTML } from "../../lib/sanitize";
import type { Question } from "../../types";

// ── Extensible renderer interface ─────────────────────────────────────
export interface BancaRenderer {
  banca: string;
  renderApoio(html: string, question: Question): JSX.Element | null;
  renderPergunta(html: string): JSX.Element;
  renderAlt(html: string): JSX.Element;
}

// ── FCC Renderer — institutional, serif, compact ──────────────────────
export const FCCRenderer: BancaRenderer = {
  banca: "FCC",

  renderApoio(html: string, question: Question) {
    if (!html) return null;
    return createElement("div", {
      className: "fcc-apoio-body",
      dangerouslySetInnerHTML: { __html: sanitizeHTML(html) },
    });
  },

  renderPergunta(html: string) {
    return createElement("div", {
      className: "fcc-pergunta",
      dangerouslySetInnerHTML: { __html: sanitizeHTML(html) },
    });
  },

  renderAlt(html: string) {
    return createElement("span", {
      className: "fcc-alt-text",
      dangerouslySetInnerHTML: { __html: sanitizeHTML(html) },
    });
  },
};

// ── Future renderers (architecture ready) ─────────────────────────────
// export const FGVRenderer: BancaRenderer = { ... }
// export const CespeRenderer: BancaRenderer = { ... }
// export const VunespRenderer: BancaRenderer = { ... }

// ── Registry ──────────────────────────────────────────────────────────
const REGISTRY: Record<string, BancaRenderer> = {
  FCC: FCCRenderer,
};

export function getRenderer(banca?: string): BancaRenderer {
  if (!banca) return FCCRenderer;
  return REGISTRY[banca.toUpperCase().trim()] ?? FCCRenderer;
}
