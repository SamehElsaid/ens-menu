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

  // Each child sitemap gets its own real newest date instead of one merged
  // value applied uniformly — see findings/sitemap.md "suspiciously uniform"
  // finding. `sitemap-main` covers marketing pages (newestFromMeta),
  // `sitemap-knowledge-base` covers articles (newestFromKb), and the menu
  // pages cover customer menus (newestFromMenus).
  const pageCount = menuSitemapPageCount(menus.length);
  const xml = buildSitemapIndex(
    buildLocaleSitemapIndex(
      siteOrigin,
      locale,
      {
        main: newestFromMeta,
        knowledgeBase: newestFromKb,
        menus: newestFromMenus,
      },
      pageCount,
    ),
  );
  return xmlResponse(xml);
}
