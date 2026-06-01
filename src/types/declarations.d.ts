// ── CSS module declarations ─────────────────────────────────────────────────
// Allows TypeScript to accept CSS side-effect imports (e.g., import "./styles/globals.css")
declare module "*.css" {
  const stylesheet: Record<string, string>;
  export default stylesheet;
}

// ── SVG declarations ────────────────────────────────────────────────────────
declare module "*.svg" {
  const url: string;
  export default url;
}

// ── Image declarations ───────────────────────────────────────────────────────
declare module "*.png" {
  const url: string;
  export default url;
}
