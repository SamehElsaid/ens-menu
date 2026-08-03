export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/** Browser preview (Google ignores this; still reads raw XML). */
const XML_STYLESHEET_PI =
  '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  /**
   * @deprecated Google ignores both `changefreq` and `priority` entirely —
   * kept optional on the type so existing call sites don't need to change,
   * but `buildUrlset` no longer emits them. See findings/sitemap.md.
   */
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  /** @deprecated See `changefreq`. */
  priority?: number;
};

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildUrlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n${XML_STYLESHEET_PI}<urlset xmlns="${SITEMAP_NS}">\n${body}\n</urlset>`;
}

export function buildSitemapIndex(
  sitemaps: { loc: string; lastmod?: string }[],
): string {
  const body = sitemaps
    .map((s) => {
      const lastmod = s.lastmod
        ? `\n    <lastmod>${escapeXml(s.lastmod)}</lastmod>`
        : "";
      return `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n${XML_STYLESHEET_PI}<sitemapindex xmlns="${SITEMAP_NS}">\n${body}\n</sitemapindex>`;
}
