import { localizeHref } from "@/i18n/routing";
import type { SitemapEntry } from "@/lib/sitemap/xml";

/** Max URLs per sitemap file (Google limit: 50,000). */
export const URLS_PER_SITEMAP = 50_000;

export type SitemapLocale = "ar" | "en";

export const SITEMAP_LOCALES: readonly SitemapLocale[] = ["ar", "en"];

/** One URL per menu per locale-specific sitemap. */
export const MENUS_PER_SITEMAP_PAGE = URLS_PER_SITEMAP;

/**
 * Indexable marketing pages: URL path + metaData `pageName` used by the API.
 */
const MAIN_PAGES = [
  { path: "", metaPageName: "home" },
  { path: "about", metaPageName: "about" },
  { path: "pricing", metaPageName: "pricing" },
  { path: "contact", metaPageName: "contact" },
  { path: "faq", metaPageName: "faq" },
  { path: "mobile-app", metaPageName: "mobile-app" },
  { path: "ens_owner_app_owner", metaPageName: "owner-app" },
  { path: "privacy-policy", metaPageName: "privacy-policy" },
  { path: "terms-and-conditions", metaPageName: "terms-and-conditions" },
  { path: "knowledge-base", metaPageName: "knowledge-base" },
] as const;

export type PublicMenuRef = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

export type KbArticle = {
  id: number;
  titleEn: string;
  updatedAt?: string;
  createdAt?: string;
};

export function isSitemapLocale(value: string): value is SitemapLocale {
  return value === "ar" || value === "en";
}

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

/** Convert API ISO timestamps to sitemap `YYYY-MM-DD`. */
export function toSitemapDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString().slice(0, 10);
}

function lastmodFromApi(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const value of candidates) {
    const parsed = toSitemapDate(value);
    if (parsed) return parsed;
  }
  return undefined;
}

/**
 * Absolute public URL for a sitemap endpoint in a given locale.
 * Google path rule: sitemap at `/en/sitemap*` may only list `/en/…` page URLs;
 * children stay as siblings (`/en/sitemap-main`), not nested under `/en/sitemap/…`.
 */
export function absoluteSitemapUrl(
  siteOrigin: string,
  locale: SitemapLocale,
  sitemapPath: string,
): string {
  const path = sitemapPath.startsWith("/") ? sitemapPath : `/${sitemapPath}`;
  return `${siteOrigin}${localizeHref(path, locale)}`;
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

/** Locale page URL only — no hreflang (treated as separate sites). */
function localePageUrl(
  siteOrigin: string,
  locale: SitemapLocale,
  path: string,
): string {
  if (locale === "ar") {
    return path ? `${siteOrigin}/${path}` : `${siteOrigin}/`;
  }
  return path ? `${siteOrigin}/en/${path}` : `${siteOrigin}/en`;
}

function sitemapEntry(
  loc: string,
  lastmod: string | undefined,
  options: Pick<SitemapEntry, "changefreq" | "priority">,
): SitemapEntry {
  return lastmod
    ? { loc, lastmod, ...options }
    : { loc, ...options };
}

/** `pageName` → lastmod date from `/metaData`. */
export async function fetchMetaLastmodByPage(): Promise<Map<string, string>> {
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const map = new Map<string, string>();
  if (!apiBase) return map;

  try {
    const res = await fetch(`${apiBase}/metaData`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return map;

    const json = (await res.json()) as {
      data?: Array<{
        pageName?: string;
        updatedAt?: string;
        createdAt?: string;
      }>;
      metaData?: Array<{
        pageName?: string;
        updatedAt?: string;
        createdAt?: string;
      }>;
    };

    const items = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.metaData)
        ? json.metaData
        : [];

    for (const item of items) {
      const pageName = String(item?.pageName ?? "").trim();
      const lastmod = lastmodFromApi(item?.updatedAt, item?.createdAt);
      if (pageName && lastmod) map.set(pageName, lastmod);
    }
  } catch {
    // keep empty map — entries omit lastmod
  }

  return map;
}

export function buildMainSiteEntries(
  siteOrigin: string,
  locale: SitemapLocale,
  metaLastmodByPage: Map<string, string>,
): SitemapEntry[] {
  return MAIN_PAGES.map(({ path, metaPageName }) =>
    sitemapEntry(
      localePageUrl(siteOrigin, locale, path),
      metaLastmodByPage.get(metaPageName),
      {
        changefreq: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1.0 : 0.7,
      },
    ),
  );
}

/**
 * Internal/QA/placeholder account slugs that should never be indexed —
 * `/public/menus` currently returns these alongside real customers, and two
 * spot-checked live as soft-404 "menu not found" pages under HTTP 200.
 * See ensmenu.com-audit/findings/sitemap.md.
 */
const TEST_MENU_SLUG_PATTERNS: RegExp[] = [
  /^test\d*$/i,
  /^testing\d*$/i,
  /^tester\d*$/i,
  /^your-slug-ensmenu-com/i,
];

export function isTestOrPlaceholderMenuSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return true;
  return TEST_MENU_SLUG_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function filterIndexableMenus(
  menus: PublicMenuRef[],
): PublicMenuRef[] {
  return menus.filter((menu) => !isTestOrPlaceholderMenuSlug(menu.slug));
}

export function buildMenuEntries(
  menus: PublicMenuRef[],
  locale: SitemapLocale,
): SitemapEntry[] {
  return menus.map((menu) => {
    const origin = menuOrigin(menu.slug);
    const loc = locale === "ar" ? `${origin}/` : `${origin}/en`;
    return sitemapEntry(loc, lastmodFromApi(menu.updatedAt, menu.createdAt), {
      changefreq: "weekly",
      priority: 0.8,
    });
  });
}

/** @deprecated Prefer `fetchPublicMenus` (includes dates when API sends them). */
export async function fetchPublicMenuSlugs(): Promise<string[]> {
  const menus = await fetchPublicMenus();
  return menus.map((m) => m.slug);
}

export async function fetchPublicMenus(): Promise<PublicMenuRef[]> {
  const apiBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!apiBase) return [];

  try {
    const res = await fetch(`${apiBase}/public/menus`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const payload = (await res.json()) as unknown;
    if (!Array.isArray(payload)) return [];

    const menus = payload
      .map((item): PublicMenuRef | null => {
        if (typeof item === "string") {
          const slug = item.trim();
          return slug ? { slug } : null;
        }
        if (item && typeof item === "object") {
          const row = item as Record<string, unknown>;
          const slug = String(row.slug ?? row.name ?? "").trim();
          if (!slug) return null;
          return {
            slug,
            updatedAt:
              typeof row.updatedAt === "string" ? row.updatedAt : undefined,
            createdAt:
              typeof row.createdAt === "string" ? row.createdAt : undefined,
          };
        }
        return null;
      })
      .filter((m): m is PublicMenuRef => Boolean(m));

    // Exclude internal/QA/placeholder accounts before pagination + rendering —
    // see findings/sitemap.md "Test/placeholder customer subdomains" (Critical).
    return filterIndexableMenus(menus);
  } catch {
    return [];
  }
}

export function paginateMenus(menus: PublicMenuRef[], page: number): PublicMenuRef[] {
  const pageIndex = Math.max(1, page) - 1;
  const start = pageIndex * MENUS_PER_SITEMAP_PAGE;
  return menus.slice(start, start + MENUS_PER_SITEMAP_PAGE);
}

/** @deprecated Use `paginateMenus`. */
export function paginateSlugs(slugs: string[], page: number): string[] {
  const pageIndex = Math.max(1, page) - 1;
  const start = pageIndex * MENUS_PER_SITEMAP_PAGE;
  return slugs.slice(start, start + MENUS_PER_SITEMAP_PAGE);
}

export function menuSitemapPageCount(menuCount: number): number {
  if (menuCount <= 0) return 0;
  return Math.ceil(menuCount / MENUS_PER_SITEMAP_PAGE);
}

/**
 * Child sitemap locs for one locale index (`/sitemap` or `/en/sitemap`).
 *
 * Only www.ensmenu.com URLs belong here. Customer menus live on `*.ensmenu.com`
 * (different hosts). Listing them under the www sitemap made GSC report
 * "Discovered URLs" per child (parsed XML locs) that never rolled into
 * "Total discovered pages" for the www property — classic 181 vs 65 mismatch.
 *
 * Menu discovery: each storefront already serves `/sitemap.xml` on its own host.
 * `/sitemap-menus/{page}` remains available for optional Domain-property
 * cross-submit in Search Console, but is intentionally NOT linked from this index
 * or from robots.txt.
 */
export function buildLocaleSitemapIndex(
  siteOrigin: string,
  locale: SitemapLocale,
  lastmodByChild: {
    main: string | undefined;
    knowledgeBase: string | undefined;
    /** @deprecated Menus are no longer included in the www locale index. */
    menus?: string | undefined;
  },
  /** @deprecated Ignored — menus stay off the www index. Kept for call-site compat. */
  _menuPageCount?: number,
): { loc: string; lastmod?: string }[] {
  void _menuPageCount;
  return [
    {
      loc: absoluteSitemapUrl(siteOrigin, locale, "/sitemap-main"),
      lastmod: lastmodByChild.main,
    },
    {
      loc: absoluteSitemapUrl(siteOrigin, locale, "/sitemap-knowledge-base"),
      lastmod: lastmodByChild.knowledgeBase,
    },
  ];
}

/* ─────────────── Knowledge-base helpers ─────────────── */

interface KbListResponse {
  success: boolean;
  data: KbArticle[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const KB_FETCH_LIMIT = 100;

/** Converts an article title + id into a URL slug, capped so total length stays near the 100-char guideline. */
export function kbSlug(titleEn: string, id: number): string {
  const idSuffix = `-${id}`;
  const maxBaseLen = Math.max(20, 90 - idSuffix.length);
  const base = (titleEn ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxBaseLen)
    .replace(/-$/g, "");
  return base ? `${base}${idSuffix}` : String(id);
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

/** Builds sitemap entries for knowledge-base articles in one locale. */
export function buildKbEntries(
  articles: KbArticle[],
  siteOrigin: string,
  locale: SitemapLocale,
): SitemapEntry[] {
  return articles.map((article) => {
    const slug = kbSlug(article.titleEn, article.id);
    return sitemapEntry(
      localePageUrl(siteOrigin, locale, `knowledge-base/${slug}`),
      lastmodFromApi(article.updatedAt, article.createdAt),
      { changefreq: "weekly", priority: 0.6 },
    );
  });
}

/** Newest YYYY-MM-DD among API dates (for sitemap index lastmod). */
export function newestSitemapDate(
  ...dates: Array<string | undefined | null>
): string | undefined {
  let newest: string | undefined;
  for (const value of dates) {
    if (!value) continue;
    if (!newest || value > newest) newest = value;
  }
  return newest;
}
