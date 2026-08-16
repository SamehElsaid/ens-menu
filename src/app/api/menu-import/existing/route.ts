import { NextRequest, NextResponse } from "next/server";
import { encryptDataApi } from "@/shared/encryption";
import { fetchMenuSnapshot } from "@/lib/menuImport/menuSnapshot";
import { guardExternalServiceRoute } from "@/lib/server/externalRouteGuard";

function buildServerApiKey(): string {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY as string;
  const utcTime = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTime}`;
  return encryptDataApi(apiKey, secretKey);
}

function buildHeaders(cookieHeader: string, locale: string) {
  return {
    Cookie: cookieHeader,
    "X-API-KEY": buildServerApiKey(),
    "Accept-Language": locale,
    "Content-Type": "application/json",
  };
}

export async function GET(request: NextRequest) {
  try {
    const menuId = String(
      request.nextUrl.searchParams.get("menuId") ?? "",
    ).trim();
    const locale = String(
      request.nextUrl.searchParams.get("locale") ?? "ar",
    ).trim();

    if (!menuId) {
      return NextResponse.json({ error: "menuId is required" }, { status: 400 });
    }

    const guard = await guardExternalServiceRoute(request, {
      routeKey: "menu-import-existing",
      menuId,
      maxRequests: 60,
      windowMs: 5 * 60_000,
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;

    const authorizedFetch = async (url: string, init?: RequestInit) => {
      return fetch(url, {
        ...init,
        headers: buildHeaders(guard.cookieHeader, locale),
        signal: AbortSignal.timeout(15_000),
      });
    };

    const snapshot = await fetchMenuSnapshot(menuId, baseUrl, authorizedFetch);

    return NextResponse.json(snapshot, { status: 200 });
  } catch (error) {
    console.error("[menu-import-existing] error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
