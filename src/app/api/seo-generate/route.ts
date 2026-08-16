import { NextRequest, NextResponse } from "next/server";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

const SEO_WEBHOOK_URL =
  process.env.N8N_SEO_WEBHOOK ?? "https://ensbot.net/webhook/seo";

export async function POST(request: NextRequest) {
  try {
    const guard = await guardExternalServiceRoute(request, {
      routeKey: "seo-generate",
      maxRequests: 10,
      windowMs: 5 * 60_000,
      requiredRoles: ["admin"],
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
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 100_000) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const res = await fetch(SEO_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Webhook request failed" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[POST /api/seo-generate]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
