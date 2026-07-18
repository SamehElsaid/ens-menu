import type { NextRequest } from "next/server";
import {
  buildMainSiteEntries,
  fetchMetaLastmodByPage,
  getSiteOrigin,
  isSitemapLocale,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildUrlset } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

/** Marketing pages for one locale — `/sitemap-main` or `/en/sitemap-main`. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ locale: string }> },
) {
  const { locale } = await context.params;
  if (!isSitemapLocale(locale)) {
    return xmlResponse(buildUrlset([]), 60);
  }

  const siteOrigin = getSiteOrigin(request.nextUrl.origin);
  const metaLastmodByPage = await fetchMetaLastmodByPage();
  const xml = buildUrlset(
    buildMainSiteEntries(siteOrigin, locale, metaLastmodByPage),
  );
  return xmlResponse(xml);
}
