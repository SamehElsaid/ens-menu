import { NextRequest, NextResponse } from "next/server";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function isAllowedPexelsImageUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "images.pexels.com"
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const guard = await guardExternalServiceRoute(request, {
    routeKey: "pexels-download",
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

  const imageUrl = request.nextUrl.searchParams.get("url")?.trim();
  if (!imageUrl || !isAllowedPexelsImageUrl(imageUrl)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "download_failed" },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return NextResponse.json({ error: "invalid_content_type" }, { status: 502 });
    }
    const declaredLength = Number(response.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "image_too_large" }, { status: 413 });
    }
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "image_too_large" }, { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "download_failed",
        ...(error instanceof Error ? { detail: error.message } : {}),
      },
      { status: 502 },
    );
  }
}
