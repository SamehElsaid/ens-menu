import { describe, expect, it } from "vitest";
import {
  sanitizeBuilderCss,
  sanitizeBuilderHref,
  sanitizeBuilderHtml,
  sanitizeBuilderImageSrc,
  sanitizeTemplateDocument,
} from "./sanitizeContent";
import type { TemplateDocument } from "./schema/types";

describe("template builder content security", () => {
  it("removes executable HTML and event handlers", () => {
    const result = sanitizeBuilderHtml(
      '<div onclick="alert(1)">safe<script>alert(2)</script><a href="javascript:alert(3)">link</a></div>',
    );
    expect(result).toContain("safe");
    expect(result).not.toMatch(/onclick|script|javascript:/i);
  });

  it("rejects CSS capable of external requests or script execution", () => {
    expect(sanitizeBuilderCss("body { color: red; }")).toBe(
      "body { color: red; }",
    );
    expect(sanitizeBuilderCss("@import 'https://evil.example/a.css';")).toBe("");
    expect(
      sanitizeBuilderCss(".x { background: url(https://evil.example/pixel); }"),
    ).toBe("");
    expect(
      sanitizeBuilderCss(
        String.raw`@\69mport 'https://evil.example/escaped.css';`,
      ),
    ).toBe("");
    expect(
      sanitizeBuilderCss(
        String.raw`.x { background: u\72l(https://evil.example/pixel); }`,
      ),
    ).toBe("");
    expect(
      sanitizeBuilderCss(
        "@im/**/port 'https://evil.example/comment.css';",
      ),
    ).toBe("");
    expect(
      sanitizeBuilderCss(
        ".x { background: image-set('https://evil.example/a.png' 1x); }",
      ),
    ).toBe("");
    expect(
      sanitizeBuilderCss(
        String.raw`.x { background: \69mage-set('https://evil.example/a.png' 1x); }`,
      ),
    ).toBe("");
    expect(
      sanitizeBuilderCss(
        ".x { background: -webkit-image-set('https://evil.example/a.png' 1x); }",
      ),
    ).toBe("");
  });

  it("rejects executable builder URLs", () => {
    expect(sanitizeBuilderHref("javascript:alert(1)")).toBe("#");
    expect(sanitizeBuilderImageSrc("data:image/svg+xml,<svg/>")).toBe("");
    expect(sanitizeBuilderImageSrc("/uploads/../secret.webp")).toBe("");
    expect(sanitizeBuilderImageSrc("/uploads/ads/summer.webp")).toBe(
      "/uploads/ads/summer.webp",
    );
  });

  it("sanitizes document props, styles, and metadata at the boundary", () => {
    const document = {
      id: "doc",
      name: "Test",
      slug: "test",
      version: 1,
      createdAt: "",
      updatedAt: "",
      image: "https://attacker.example/preview.png",
      globalStyles: { colors: {}, typography: {} },
      root: {
        id: "button",
        type: "button",
        props: { href: "javascript:alert(1)" },
        styles: {
          desktop: {
            backgroundImage: "url(https://attacker.example/pixel.png)",
          },
        },
      },
    } as TemplateDocument;

    const safe = sanitizeTemplateDocument(document);
    expect(safe.image).toBe("");
    expect(safe.root.props.href).toBe("#");
    expect(safe.root.styles.desktop.backgroundImage).toBe("");
  });
});
