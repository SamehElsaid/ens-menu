import type { NextRequest } from "next/server";
import {
  buildMainSiteEntries,
  getSiteOrigin,
  todayIsoDate,
} from "@/lib/sitemap/data";
import { xmlResponse } from "@/lib/sitemap/response";
import { buildUrlset } from "@/lib/sitemap/xml";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const siteOrigin = getSiteOrigin(request.nextUrl.origin);
  const lastmod = todayIsoDate();
  const xml = buildUrlset(buildMainSiteEntries(siteOrigin, lastmod));
  return xmlResponse(xml);
}
