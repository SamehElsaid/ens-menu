import type { NextRequest } from "next/server";
import {
  buildLocaleSitemapIndex,
  fetchAllKbArticles,
  fetchMetaLastmodByPage,
  getSiteOrigin,
  isSitemapLocale,
  newestSitemapDate,
  toSitemapDate,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildSitemapIndex } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

/**
 * Locale sitemap index (www.ensmenu.com only):
 * - Arabic (default): `/sitemap` → main + knowledge-base
 * - English: `/en/sitemap` → main + knowledge-base
 *
 * Customer-menu hosts (`*.ensmenu.com`) are intentionally excluded — see
 * `buildLocaleSitemapIndex` in `data.ts`. Those URLs inflated per-child
 * "Discovered URLs" in GSC without counting toward "Total discovered pages"
 * on the www property.
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
  const [articles, metaLastmodByPage] = await Promise.all([
    fetchAllKbArticles(),
    fetchMetaLastmodByPage(),
  ]);

  const newestFromKb = newestSitemapDate(
    ...articles.map(
      (a) => toSitemapDate(a.updatedAt) ?? toSitemapDate(a.createdAt),
    ),
  );
  const newestFromMeta = newestSitemapDate(...metaLastmodByPage.values());

  const xml = buildSitemapIndex(
    buildLocaleSitemapIndex(siteOrigin, locale, {
      main: newestFromMeta,
      knowledgeBase: newestFromKb,
    }),
  );
  return xmlResponse(xml);
}
