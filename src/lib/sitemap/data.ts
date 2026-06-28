import type { HreflangAlternate, SitemapEntry } from "@/lib/sitemap/xml";

/** Max URLs per sitemap file (Google limit: 50,000). */
export const URLS_PER_SITEMAP = 50_000;

/** Two locales per public menu (/, /en). */
export const LOCALES_PER_MENU = 2;

export const MENUS_PER_SITEMAP_PAGE = Math.floor(
  URLS_PER_SITEMAP / LOCALES_PER_MENU,
);

/** Indexable marketing paths (no auth/dashboard). Folder names match app routes. */
const MAIN_PATHS = [
  "",
  "about",
  "Pricing",
  "contact",
  "mobile-app",
  "privacy-policy",
  "terms-and-conditions",
  "knowledge-base",
] as const;

export function normalizeSiteOrigin(url: string): string {
  const trimmed = url.replace(/\/$/, "");
  if (/^https?:\/\/ensmenu\.com$/i.test(trimmed)) {
    return "https://www.ensmenu.com";
  }
  return trimmed;
}

export function getSiteOrigin(requestOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return normalizeSiteOrigin(fromEnv);
  if (requestOrigin) return normalizeSiteOrigin(requestOrigin);
  return "https://www.ensmenu.com";
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Public menu host suffix for sitemap `loc` URLs only.
 * Always production — Google cannot index localhost / dev ports.
 * Override with NEXT_PUBLIC_SITEMAP_MENU_URL (e.g. ".ensmenu.com").
 */
export function getSitemapMenuSuffix(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITEMAP_MENU_URL?.trim();
  if (fromEnv) return fromEnv.startsWith(".") ? fromEnv : `.${fromEnv}`;
  return ".ensmenu.com";
}

export function menuOrigin(slug: string): string {
  const host = `${String(slug).trim()}${getSitemapMenuSuffix()}`.replace(
    /^https?:\/\//,
    "",
  );
  return `https://${host}`.replace(/\/$/, "");
}

/** Arabic (default) + English alternates for Google hreflang. */
export function arEnAlternates(arHref: string, enHref: string): HreflangAlternate[] {
  return [
    { hreflang: "ar", href: arHref },
    { hreflang: "en", href: enHref },
    { hreflang: "x-default", href: arHref },
  ];
}

function sitemapEntry(
  loc: string,
  arHref: string,
  enHref: string,
  lastmod: string,
  options: Pick<SitemapEntry, "changefreq" | "priority">,
): SitemapEntry {
  return {
    loc,
    alternates: arEnAlternates(arHref, enHref),
    lastmod,
    ...options,
  };
}

function localePair(origin: string, lastmod: string): SitemapEntry[] {
  const arHref = `${origin}/`;
  const enHref = `${origin}/en`;
  const shared = { lastmod, changefreq: "weekly" as const, priority: 0.8 };

  return [
    sitemapEntry(arHref, arHref, enHref, lastmod, shared),
    sitemapEntry(enHref, arHref, enHref, lastmod, shared),
  ];
}

export function buildMainSiteEntries(siteOrigin: string, lastmod: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  for (const path of MAIN_PATHS) {
    const arHref = path ? `${siteOrigin}/${path}` : `${siteOrigin}/`;
    const enHref = path ? `${siteOrigin}/en/${path}` : `${siteOrigin}/en`;
    const priority = path === "" ? 1.0 : 0.7;
    const changefreq = path === "" ? "weekly" : "monthly";

    entries.push(
      sitemapEntry(arHref, arHref, enHref, lastmod, { changefreq, priority }),
    );
    entries.push(
      sitemapEntry(enHref, arHref, enHref, lastmod, {
        changefreq,
        priority: path === "" ? 1.0 : 0.7,
      }),
    );
  }

  return entries;
}

export function buildMenuEntriesForSlugs(
  slugs: string[],
  lastmod: string,
): SitemapEntry[] {
  return slugs.flatMap((slug) => localePair(menuOrigin(slug), lastmod));
}

export async function fetchPublicMenuSlugs(): Promise<string[]> {
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/public/menus`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const slugs = (await res.json()) as unknown;
    if (!Array.isArray(slugs)) return [];
    return slugs.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function paginateSlugs(slugs: string[], page: number): string[] {
  const pageIndex = Math.max(1, page) - 1;
  const start = pageIndex * MENUS_PER_SITEMAP_PAGE;
  return slugs.slice(start, start + MENUS_PER_SITEMAP_PAGE);
}

export function menuSitemapPageCount(slugCount: number): number {
  if (slugCount <= 0) return 0;
  return Math.ceil(slugCount / MENUS_PER_SITEMAP_PAGE);
}

export function buildAllEntries(
  siteOrigin: string,
  slugs: string[],
  lastmod: string,
): SitemapEntry[] {
  return [
    ...buildMainSiteEntries(siteOrigin, lastmod),
    ...buildMenuEntriesForSlugs(slugs, lastmod),
  ].slice(0, URLS_PER_SITEMAP);
}

/* ─────────────── Knowledge-base helpers ─────────────── */

interface KbArticle {
  id: number;
  titleEn: string;
}

interface KbListResponse {
  success: boolean;
  data: KbArticle[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const KB_FETCH_LIMIT = 100;

/** Converts an article title + id into a URL slug, e.g. "Default Template" + 68 → "default-template-68" */
export function kbSlug(titleEn: string, id: number): string {
  const base = (titleEn ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `${base}-${id}` : String(id);
}

/** Fetches every knowledge-base article (all pages) from the API. */
export async function fetchAllKbArticles(): Promise<KbArticle[]> {
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!apiBase) return [];

  const all: KbArticle[] = [];
  let page = 1;

  while (true) {
    try {
      const res = await fetch(
        `${apiBase}/searchInformation?page=${page}&limit=${KB_FETCH_LIMIT}`,
        { cache: "no-store", headers: { Accept: "application/json" } },
      );
      if (!res.ok) break;

      const json = (await res.json()) as KbListResponse;
      const items = json?.data ?? [];
      if (!Array.isArray(items) || items.length === 0) break;

      all.push(...items);

      if (page >= (json?.pagination?.totalPages ?? 1)) break;
      page++;
    } catch {
      break;
    }
  }

  return all;
}

/** Builds sitemap entries for every knowledge-base article (ar + en). */
export function buildKbEntries(
  articles: KbArticle[],
  siteOrigin: string,
  lastmod: string,
): SitemapEntry[] {
  return articles.flatMap((article) => {
    const slug = kbSlug(article.titleEn, article.id);
    const arHref = `${siteOrigin}/knowledge-base/${slug}`;
    const enHref = `${siteOrigin}/en/knowledge-base/${slug}`;
    const shared = { lastmod, changefreq: "weekly" as const, priority: 0.6 };
    return [
      sitemapEntry(arHref, arHref, enHref, lastmod, shared),
      sitemapEntry(enHref, arHref, enHref, lastmod, shared),
    ];
  });
}
