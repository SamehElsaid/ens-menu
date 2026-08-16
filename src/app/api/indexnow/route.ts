import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { pingIndexNow } from "@/lib/indexnow";
import { getSiteOrigin } from "@/lib/sitemap/data";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

/**
 * Submits changed URLs to IndexNow (Bing/Yandex). Intended to be called by
 * the backend/dashboard whenever a menu, knowledge-base article, or marketing
 * page is published/updated — e.g. from the same hook point that already
 * triggers sitemap revalidation. See ensmenu.com-audit/findings/technical.md.
 *
 * Body: { "urls": ["https://www.ensmenu.com/knowledge-base/my-article-71"] }
 */
export async function POST(request: NextRequest) {
  const guard = await guardExternalServiceRoute(request, {
    routeKey: "indexnow",
    maxRequests: 10,
    windowMs: 5 * 60_000,
  });
  if (!guard.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: guard.error,
        ...(guard.code ? { code: guard.code } : {}),
      },
      {
        status: guard.status,
        headers: guard.retryAfter
          ? { "Retry-After": String(guard.retryAfter) }
          : undefined,
      },
    );
  }

  let urls: unknown;
  try {
    const body = (await request.json()) as { urls?: unknown };
    urls = body?.urls;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 100) {
    return NextResponse.json(
      { ok: false, error: "Provide a non-empty `urls` array" },
      { status: 400 },
    );
  }

  const siteOrigin = getSiteOrigin();
  const expectedOrigin = new URL(siteOrigin).origin;
  const validUrls = urls.filter(
    (url): url is string => {
      if (typeof url !== "string") return false;
      try {
        return new URL(url).origin === expectedOrigin;
      } catch {
        return false;
      }
    },
  );

  if (validUrls.length === 0) {
    return NextResponse.json(
      { ok: false, error: `All URLs must start with ${siteOrigin}` },
      { status: 400 },
    );
  }

  const ok = await pingIndexNow(validUrls);
  return NextResponse.json({ ok, submitted: validUrls.length });
}
