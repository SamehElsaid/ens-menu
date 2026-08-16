import type { Breakpoint, BuilderNode, TemplateDocument } from "../schema/types";
import { mergeBreakpointStyles, stylesToCss } from "../schema/tree";
import {
  sanitizeBuilderCss,
  sanitizeTemplateDocument,
} from "../sanitizeContent";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  return `<div data-tb="${escapeHtml(node.type)}" style="${escapeHtml(css)}">${children || `<!-- ${escapeHtml(node.type)} -->`}</div>`;
}

export function exportDocumentJson(doc: TemplateDocument): string {
  return JSON.stringify(sanitizeTemplateDocument(doc), null, 2);
}

export function exportDocumentToHtml(
  doc: TemplateDocument,
  breakpoint: Breakpoint = "desktop",
): string {
  const safeDoc = sanitizeTemplateDocument(doc);
  const vars = sanitizeBuilderCss(
    Object.entries(safeDoc.globalStyles.colors)
      .map(([k, v]) => `  --tb-${k}: ${v};`)
      .join("\n"),
  );
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/><title>${escapeHtml(safeDoc.name)}</title>
<style>:root{\n${vars}\n}body{margin:0;font-family:system-ui,sans-serif}
${sanitizeBuilderCss(safeDoc.customCode?.customCSS)}</style></head>
<body>${renderNode(safeDoc.root, safeDoc, breakpoint)}</body></html>`;
}

export function exportThemeJson(doc: TemplateDocument): string {
  return exportDocumentJson(doc);
}

export function exportThemePreviewHtml(doc: TemplateDocument): string {
  return exportDocumentToHtml(doc);
}
