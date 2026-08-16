import type { NextRequest, NextResponse } from "next/server";
import { encryptDataApi } from "@/shared/encryption";

export function buildServerApiKey(): string {
  const secret = process.env.NEXT_PUBLIC_SECRET_KEY?.trim();
  if (!secret) throw new Error("Server API key is not configured");
  const timestamp = parseFloat((Date.now() / 1000).toFixed(3));
  return encryptDataApi(`${secret}///${timestamp}`, secret);
}

export function incomingCookieHeader(request: NextRequest): string {
  return request.headers.get("cookie") ?? "";
}

export function backendCookieHeaders(
  request: NextRequest,
  extra?: HeadersInit,
): Headers {
  const headers = new Headers(extra);
  const cookie = incomingCookieHeader(request);
  const csrfToken = request.headers.get("x-csrf-token");
  const locale = request.headers.get("accept-language");
  const origin = request.headers.get("origin");

  headers.set("X-API-KEY", buildServerApiKey());
  if (cookie) headers.set("Cookie", cookie);
  if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  if (origin) headers.set("Origin", origin);
  if (locale && !headers.has("Accept-Language")) {
    headers.set("Accept-Language", locale);
  }
  return headers;
}

export function backendCookieFetch(
  request: NextRequest,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: backendCookieHeaders(request, init?.headers),
    cache: init?.cache ?? "no-store",
  });
}

export function forwardSetCookieHeaders(
  upstream: Response,
  response: NextResponse,
): void {
  const headers = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    for (const cookie of setCookies) response.headers.append("Set-Cookie", cookie);
    return;
  }
  const combined = upstream.headers.get("set-cookie");
  if (combined) response.headers.append("Set-Cookie", combined);
}
