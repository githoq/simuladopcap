/**
 * Runtime normalization — structural-safe only.
 * Applied BEFORE dangerouslySetInnerHTML.
 *
 * POLICY (per brief):
 *   ALLOWED:  NBSP normalization, zero-width cleanup, invisible unicode removal,
 *             duplicate whitespace collapse.
 *   FORBIDDEN: accent correction, word replacement, punctuation normalization,
 *              comma spacing, quote normalization, semantic reconstruction.
 *
 * This is a LITERAL INSTITUTIONAL RENDERER, not an OCR correction engine.
 */

// ── Structural-safe unicode cleanup ──────────────────────────────────
const UNICODE_CLEANUP: [RegExp, string][] = [
  [/\u00a0/g, " "],   // NBSP → regular space
  [/\u200b/g, ""],    // zero-width space
  [/\u200c/g, ""],    // zero-width non-joiner
  [/\u200d/g, ""],    // zero-width joiner
  [/\u2028/g, "\n"],  // line separator
  [/\u2029/g, "\n"],  // paragraph separator
  [/\ufeff/g,  ""],   // BOM
  [/\u00ad/g,  ""],   // soft hyphen
];

/**
 * Normalize a single text node (no HTML tags).
 * Only structural: unicode cleanup + duplicate space collapse.
 */
function normalizeTextNode(text: string): string {
  let s = text;
  for (const [pattern, replacement] of UNICODE_CLEANUP) {
    s = s.replace(pattern, replacement);
  }
  // Collapse 2+ spaces → 1 space (structural whitespace artifact only)
  s = s.replace(/ {2,}/g, " ");
  return s;
}

/**
 * Normalize HTML content.
 * Processes text nodes only — never touches tags or attributes.
 */
export function normalizeHTML(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

  const parts = html.split(/(<[^>]+>)/);

  return parts
    .map((part, i) => {
      if (i % 2 === 0) {
        // Text node — apply structural cleanup
        return normalizeTextNode(part);
      }
      // HTML tag — only remove NBSP from attributes
      return part.replace(/\u00a0/g, " ");
    })
    .join("");
}

/**
 * Normalize plain text (no HTML).
 */
export function normalizePlainText(text: string | null | undefined): string {
  if (!text) return "";
  let s = text;
  for (const [p, r] of UNICODE_CLEANUP) s = s.replace(p, r);
  return s.replace(/ {2,}/g, " ").trim();
}
