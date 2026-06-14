import { NextRequest, NextResponse } from "next/server";
import type { PexelsSearchResponse } from "@/types/pexels";

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

export async function GET(request: NextRequest) {
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
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: "pexels_search_failed", detail: detail.slice(0, 300) },
        { status: response.status },
      );
    }

    const data = (await response.json()) as PexelsSearchResponse;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "pexels_search_failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
