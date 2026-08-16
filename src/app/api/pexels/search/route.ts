import { NextRequest, NextResponse } from "next/server";
import type { PexelsSearchResponse } from "@/types/pexels";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

export async function GET(request: NextRequest) {
  const guard = await guardExternalServiceRoute(request, {
    routeKey: "pexels-search",
    maxRequests: 30,
  });
  if (!guard.ok) {
    return NextResponse.json(
      { error: guard.error, ...(guard.code ? { code: guard.code } : {}) },
      {
        status: guard.status,
        headers: guard.retryAfter
          ? { "Retry-After": String(guard.retryAfter) }
          : undefined,
      },
    );
  }

  const apiKey = process.env.PEXELS_API_KEY; 
  if (!apiKey) {
    return NextResponse.json(
      { error: "pexels_not_configured" },
      { status: 503 },
    );
  }

  const query = request.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return NextResponse.json({ error: "query_required" }, { status: 400 });
  }
  if (query.length > 100) {
    return NextResponse.json({ error: "query_too_long" }, { status: 400 });
  }

  const page = Math.max(
    1,
    Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10) || 1,
  );
  const perPage = Math.min(
    30,
    Math.max(
      1,
      Number.parseInt(request.nextUrl.searchParams.get("per_page") ?? "15", 10) ||
        15,
    ),
  );

  const url = new URL(PEXELS_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  try {
    const response = await fetch(url, {
      headers: { Authorization: apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      await response.body?.cancel();
      return NextResponse.json(
        { error: "pexels_search_failed" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as PexelsSearchResponse;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "pexels_search_failed",
        ...(error instanceof Error ? { detail: error.message } : {}),
      },
      { status: 502 },
    );
  }
}
