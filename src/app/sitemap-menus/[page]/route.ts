import type { NextRequest } from "next/server";
import {
  buildMenuEntriesForSlugs,
  fetchPublicMenuSlugs,
  paginateSlugs,
  todayIsoDate,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildUrlset } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ page: string }> },
) {
  const { page: pageParam } = await context.params;
  const page = parseInt(pageParam, 10);
  if (!Number.isFinite(page) || page < 1) {
    return xmlResponse(buildUrlset([]), 60);
  }

  const slugs = await fetchPublicMenuSlugs();
  const slice = paginateSlugs(slugs, page);
  const lastmod = todayIsoDate();
  const xml = buildUrlset(buildMenuEntriesForSlugs(slice, lastmod));
  return xmlResponse(xml);
}
