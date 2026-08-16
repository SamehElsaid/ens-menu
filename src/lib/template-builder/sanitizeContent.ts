import DOMPurify from "isomorphic-dompurify";
import type {
  BuilderNode,
  TemplateDocument,
} from "@/lib/template-builder/schema/types";

const SAFE_URI_PATTERN =
  /^(?:(?:https?|mailto|tel):|\/(?!\/)|#|\.{1,2}\/)/i;

function canonicalizeCssForInspection(value: string): string {
  return value
    .replace(/\\\r?\n/g, "")
    .replace(/\\([0-9a-f]{1,6})\s?/gi, (_match, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      return codePoint === 0 || codePoint > 0x10ffff
        ? "\uFFFD"
        : String.fromCodePoint(codePoint);
    })
    .replace(/\\([^0-9a-f\r\n])/gi, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function containsUnsafeCss(value: string): boolean {
  const canonical = canonicalizeCssForInspection(value);
  return /<\/?style|@import|url\s*\(|(?:image|-webkit-image-set|image-set|cross-fade)\s*\(|expression\s*\(|javascript\s*:|behavior\s*:/i.test(
    canonical,
  );
}

export function sanitizeBuilderHtml(value: unknown): string {
  return DOMPurify.sanitize(String(value ?? ""), {
    ALLOWED_TAGS: [
      "a",
      "b",
      "blockquote",
      "br",
      "code",
      "div",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "hr",
      "i",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "span",
      "strong",
      "u",
      "ul",
    ],
    ALLOWED_ATTR: [
      "alt",
      "aria-label",
      "class",
      "height",
      "href",
      "id",
      "rel",
      "src",
      "target",
      "title",
      "width",
    ],
    ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
    FORBID_TAGS: ["form", "iframe", "object", "script", "style", "svg"],
    FORBID_ATTR: ["style", "srcset"],
  });
}

export function sanitizeBuilderCss(value: unknown): string {
  const css = String(value ?? "");
  if (containsUnsafeCss(css)) return "";
  return css.slice(0, 50_000);
}

export function sanitizeBuilderHref(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "#";
  if (raw.startsWith("#") || (raw.startsWith("/") && !raw.startsWith("//"))) {
    return raw;
  }
  try {
    const url = new URL(raw);
    return ["https:", "mailto:", "tel:"].includes(url.protocol)
      ? url.toString()
      : "#";
  } catch {
    return "#";
  }
}

function isSafeRelativeAssetPath(raw: string): boolean {
  if (!raw.startsWith("/") || raw.startsWith("//")) return false;
  if (
    raw.includes("\\") ||
    raw.includes("..") ||
    /%2e/i.test(raw) ||
    raw.includes("//")
  ) {
    return false;
  }
  return /^\/[A-Za-z0-9._~/-]+$/.test(raw);
}

export function sanitizeBuilderImageSrc(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (raw.startsWith("/")) {
    return isSafeRelativeAssetPath(raw) ? raw : "";
  }
  try {
    const url = new URL(raw);
    const configuredHost = (() => {
      try {
        return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "").hostname;
      } catch {
        return "";
      }
    })();
    const allowedHost =
      url.hostname === configuredHost ||
      url.hostname === "images.pexels.com" ||
      url.hostname === "localhost" ||
      url.hostname === "ensmenu.com" ||
      url.hostname.endsWith(".ensmenu.com") ||
      url.hostname === "ensmenu.ens.eg" ||
      url.hostname.endsWith(".ensmenu.ens.eg");
    return url.protocol === "https:" && allowedHost ? url.toString() : "";
  } catch {
    return "";
  }
}

function sanitizeStyleValue(key: string, value: unknown): unknown {
  if (typeof value !== "string") return value;
  const raw = value.trim();
  if (key === "backgroundImage") {
    if (
      /gradient\(/i.test(raw) &&
      !containsUnsafeCss(raw)
    ) {
      return raw;
    }
    const source = raw
      .replace(/^url\(\s*(['"]?)/i, "")
      .replace(/(['"]?)\s*\)$/i, "");
    const safeSource = sanitizeBuilderImageSrc(source);
    return safeSource ? `url("${safeSource.replace(/"/g, "%22")}")` : "";
  }
  return containsUnsafeCss(raw) || /[<>]/.test(raw)
    ? ""
    : raw;
}

function sanitizeStyleObject<T extends Record<string, unknown>>(styles: T): T {
  return Object.fromEntries(
    Object.entries(styles).map(([key, value]) => [
      key,
      sanitizeStyleValue(key, value),
    ]),
  ) as T;
}

function sanitizeNode(node: BuilderNode): BuilderNode {
  const props = { ...node.props };
  if (node.type === "html") props.html = sanitizeBuilderHtml(props.html);
  if (node.type === "button") props.href = sanitizeBuilderHref(props.href);
  if (node.type === "image") props.src = sanitizeBuilderImageSrc(props.src);
  return {
    ...node,
    props,
    styles: {
      desktop: sanitizeStyleObject(node.styles.desktop),
      ...(node.styles.tablet
        ? { tablet: sanitizeStyleObject(node.styles.tablet) }
        : {}),
      ...(node.styles.mobile
        ? { mobile: sanitizeStyleObject(node.styles.mobile) }
        : {}),
    },
    ...(node.customCode
      ? {
          customCode: {
            html: sanitizeBuilderHtml(node.customCode.html),
            css: sanitizeBuilderCss(node.customCode.css),
            js: "",
          },
        }
      : {}),
    ...(node.children
      ? { children: node.children.map((child) => sanitizeNode(child)) }
      : {}),
  };
}

export function sanitizeTemplateDocument(
  document: TemplateDocument,
): TemplateDocument {
  return {
    ...document,
    image: sanitizeBuilderImageSrc(document.image),
    globalStyles: {
      ...document.globalStyles,
      colors: Object.fromEntries(
        Object.entries(document.globalStyles.colors).map(([key, value]) => [
          key,
          String(sanitizeStyleValue(key, value) ?? ""),
        ]),
      ),
      typography: Object.fromEntries(
        Object.entries(document.globalStyles.typography).map(([key, value]) => [
          key,
          sanitizeStyleObject(value),
        ]),
      ),
    },
    root: sanitizeNode(document.root),
    ...(document.customCode
      ? {
          customCode: {
            headHTML: sanitizeBuilderHtml(document.customCode.headHTML),
            bodyHTML: sanitizeBuilderHtml(document.customCode.bodyHTML),
            customCSS: sanitizeBuilderCss(document.customCode.customCSS),
            customJS: "",
          },
        }
      : {}),
  };
}
