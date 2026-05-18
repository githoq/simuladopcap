import { normalizeHTML } from "./normalize";

const SAFE_TAGS = new Set([
  "em","strong","b","i","u","s","sup","sub","br","p",
  "span","div","center","blockquote","ul","ol","li",
  "table","thead","tbody","tr","td","th","mark",
  "small","hr","pre","code","figure","figcaption","img",
]);

const SAFE_STYLE_PROPS = new Set([
  "text-align","font-style","font-weight","text-decoration",
  "text-decoration-line","margin-left","padding-left",
  "font-size","color","background-color","text-indent",
]);

function sanitizeStyle(styleStr: string): string {
  if (!styleStr) return "";
  return styleStr.split(";").reduce<string[]>((acc, decl) => {
    const [prop, ...rest] = decl.split(":");
    if (!prop || !rest.length) return acc;
    const p = prop.trim().toLowerCase();
    const v = rest.join(":").trim();
    if (!SAFE_STYLE_PROPS.has(p)) return acc;
    if (/url\(|expression|javascript:/i.test(v)) return acc;
    acc.push(`${p}:${v}`);
    return acc;
  }, []).join(";");
}

/**
 * Sanitize + runtime-normalize HTML for dangerouslySetInnerHTML.
 * Double pipeline: sanitize structure → normalize text nodes.
 */
export function sanitizeHTML(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";

  // Step 1: Strip dangerous content
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?>/gi, "")
    .replace(/javascript:/gi, "#");

  // Step 2: Sanitize tags and attributes
  s = s.replace(/<(\/?)([\w-]+)([^>]*)>/g, (_match, slash, tag, attrs) => {
    const tagL = tag.toLowerCase();
    if (!SAFE_TAGS.has(tagL)) return "";
    if (slash) return `</${tagL}>`;
    const out: string[] = [];
    const cm = attrs.match(/\bclass=["']([^"']*)["']/i);
    if (cm) out.push(`class="${cm[1].replace(/[<>"]/g, "")}"`);
    const sm = attrs.match(/\bstyle=["']([^"']*)["']/i);
    if (sm) { const safe = sanitizeStyle(sm[1]); if (safe) out.push(`style="${safe}"`); }
    // Preserve src for img
    if (tagL === "img") {
      const srcM = attrs.match(/\bsrc=["']([^"']+)["']/i);
      if (srcM && !/javascript:/i.test(srcM[1])) out.push(`src="${srcM[1]}"`);
      const altM = attrs.match(/\balt=["']([^"']*)["']/i);
      if (altM) out.push(`alt="${altM[1]}"`);
    }
    return out.length ? `<${tagL} ${out.join(" ")}>` : `<${tagL}>`;
  });

  // Step 3: Runtime normalization of text nodes
  s = normalizeHTML(s);

  return s;
}
