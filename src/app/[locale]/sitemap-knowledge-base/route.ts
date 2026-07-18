import type { NextRequest } from "next/server";
import {
  buildKbEntries,
  fetchAllKbArticles,
  getSiteOrigin,
  isSitemapLocale,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildUrlset } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

/** KB articles for one locale — `/sitemap-knowledge-base` or `/en/sitemap-knowledge-base`. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  if (!isSitemapLocale(locale)) {
    return xmlResponse(buildUrlset([]), 60);
  }

  const siteOrigin = getSiteOrigin(request.nextUrl.origin);
  const articles = await fetchAllKbArticles();
  const xml = buildUrlset(buildKbEntries(articles, siteOrigin, locale));
  return xmlResponse(xml);
}
