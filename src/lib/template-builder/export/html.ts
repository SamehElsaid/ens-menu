import type { Breakpoint, BuilderNode, TemplateDocument } from "../schema/types";
import { mergeBreakpointStyles, stylesToCss } from "../schema/tree";

function cssToString(styles: ReturnType<typeof stylesToCss>): string {
  return Object.entries(styles)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`)
    .join(";");
}

function renderNode(
  node: BuilderNode,
  doc: TemplateDocument,
  bp: Breakpoint,
): string {
  const css = cssToString(stylesToCss(mergeBreakpointStyles(node, bp), doc.globalStyles.colors));
  const children = (node.children ?? []).map((c) => renderNode(c, doc, bp)).join("\n");
  return `<div data-tb="${node.type}" style="${css}">${children || `<!-- ${node.type} -->`}</div>`;
}

export function exportDocumentJson(doc: TemplateDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function exportDocumentToHtml(
  doc: TemplateDocument,
  breakpoint: Breakpoint = "desktop",
): string {
  const vars = Object.entries(doc.globalStyles.colors)
    .map(([k, v]) => `  --tb-${k}: ${v};`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${doc.name}</title>
<style>:root{\n${vars}\n}body{margin:0;font-family:system-ui,sans-serif}
${doc.customCode?.customCSS ?? ""}</style></head>
<body>${renderNode(doc.root, doc, breakpoint)}</body></html>`;
}

export function exportThemeJson(doc: TemplateDocument): string {
  return exportDocumentJson(doc);
}

export function exportThemePreviewHtml(doc: TemplateDocument): string {
  return exportDocumentToHtml(doc);
}
