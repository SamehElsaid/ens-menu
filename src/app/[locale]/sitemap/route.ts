import type { NextRequest } from "next/server";
import {
  buildLocaleSitemapIndex,
  fetchAllKbArticles,
  fetchMetaLastmodByPage,
  fetchPublicMenus,
  getSiteOrigin,
  isSitemapLocale,
  menuSitemapPageCount,
  newestSitemapDate,
  toSitemapDate,
  todayIsoDate,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildSitemapIndex } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

/**
 * Locale sitemap index:
 * - Arabic (default): `/sitemap`
 * - English: `/en/sitemap`
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  if (!isSitemapLocale(locale)) {
    return xmlResponse(buildSitemapIndex([]), 60);
  }

  const siteOrigin = getSiteOrigin(request.nextUrl.origin);
  const [menus, articles, metaLastmodByPage] = await Promise.all([
    fetchPublicMenus(),
    fetchAllKbArticles(),
    fetchMetaLastmodByPage(),
  ]);

  const newestFromMenus = newestSitemapDate(
    ...menus.map((m) => toSitemapDate(m.updatedAt) ?? toSitemapDate(m.createdAt)),
  );
  const newestFromKb = newestSitemapDate(
    ...articles.map(
      (a) => toSitemapDate(a.updatedAt) ?? toSitemapDate(a.createdAt),
    ),
  );
  const newestFromMeta = newestSitemapDate(...metaLastmodByPage.values());
  const lastmod =
    newestSitemapDate(newestFromMenus, newestFromKb, newestFromMeta) ??
    todayIsoDate();

  const pageCount = menuSitemapPageCount(menus.length);
  const xml = buildSitemapIndex(
    buildLocaleSitemapIndex(siteOrigin, locale, lastmod, pageCount),
  );
  return xmlResponse(xml);
}
