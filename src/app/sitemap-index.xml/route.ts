import type { NextRequest } from "next/server";
import {
  fetchPublicMenuSlugs,
  getSiteOrigin,
  menuSitemapPageCount,
  todayIsoDate,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildSitemapIndex } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const siteOrigin = getSiteOrigin(request.nextUrl.origin);
  const lastmod = todayIsoDate();
  const slugs = await fetchPublicMenuSlugs();
  const pageCount = menuSitemapPageCount(slugs.length);

  const childSitemaps: { loc: string; lastmod: string }[] = [
    { loc: `${siteOrigin}/sitemap-main.xml`, lastmod },
    { loc: `${siteOrigin}/sitemap-knowledge-base.xml`, lastmod },
  ];

  for (let page = 1; page <= pageCount; page++) {
    const padded = String(page).padStart(4, "0");
    childSitemaps.push({
      loc: `${siteOrigin}/sitemap-menus-${padded}.xml`,
      lastmod,
    });
  }

  const xml = buildSitemapIndex(childSitemaps);
  return xmlResponse(xml);
}
