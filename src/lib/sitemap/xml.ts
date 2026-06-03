export const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
export const XHTML_NS = "http://www.w3.org/1999/xhtml";

/** Browser preview (Google ignores this; still reads raw XML). */
const XML_STYLESHEET_PI =
  '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n';

export type HreflangAlternate = {
  hreflang: "ar" | "en" | "x-default" | string;
  href: string;
};

export type SitemapEntry = {
  loc: string;
  alternates?: HreflangAlternate[];
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
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

function renderAlternateLinks(alternates: HreflangAlternate[]): string {
  return alternates
    .map(
      (a) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}" />`,
    )
    .join("\n");
}

export function buildUrlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.loc)}</loc>`];
      if (e.alternates?.length) parts.push(renderAlternateLinks(e.alternates));
      if (e.lastmod) parts.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority != null) {
        parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n${XML_STYLESHEET_PI}<urlset xmlns="${SITEMAP_NS}" xmlns:xhtml="${XHTML_NS}">\n${body}\n</urlset>`;
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
