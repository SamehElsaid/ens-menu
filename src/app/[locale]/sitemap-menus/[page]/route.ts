import type { NextRequest } from "next/server";
import {
  buildMenuEntries,
  fetchPublicMenus,
  isSitemapLocale,
  paginateMenus,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildUrlset } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

/** Public menus for one locale — `/sitemap-menus/1` or `/en/sitemap-menus/1`.
 *
 * Not linked from `/sitemap` / robots.txt (cross-host vs www). Submit this URL
 * manually in a Domain property if you want GSC to track customer-menu discovery
 * from www; otherwise each `{slug}.ensmenu.com/sitemap.xml` is the host-local source.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ locale: string; page: string }> },
) {
  const { locale, page: pageParam } = await context.params;
  if (!isSitemapLocale(locale)) {
    return xmlResponse(buildUrlset([]), 60);
  }

  const page = parseInt(pageParam, 10);
  if (!Number.isFinite(page) || page < 1) {
    return xmlResponse(buildUrlset([]), 60);
  }

  const menus = await fetchPublicMenus();
  const slice = paginateMenus(menus, page);
  const xml = buildUrlset(buildMenuEntries(slice, locale));
  return xmlResponse(xml);
}
