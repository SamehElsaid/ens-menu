import crypto from "crypto";
import type { NextRequest } from "next/server";
import {
  backendCookieFetch,
  incomingCookieHeader,
} from "@/lib/server/backendCookieRequest";

type GuardSuccess = {
  ok: true;
  cookieHeader: string;
  rateLimitKey: string;
  role?: string;
};

type GuardFailure = {
  ok: false;
  status: 401 | 403 | 429 | 503;
  error: string;
  code?: string;
  retryAfter?: number;
};

type RateWindow = { count: number; resetAt: number };
const rateWindows = new Map<string, RateWindow>();

function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number,
): GuardFailure | null {
  const now = Date.now();
  const existing = rateWindows.get(key);
  const current =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowMs };
  current.count += 1;
  rateWindows.set(key, current);

  if (rateWindows.size > 5_000) {
    for (const [entryKey, entry] of rateWindows) {
      if (entry.resetAt <= now) rateWindows.delete(entryKey);
    }
  }

  if (current.count <= max) return null;
  return {
    ok: false,
    status: 429,
    error: "rate_limited",
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export async function guardExternalServiceRoute(
  request: NextRequest,
  options: {
    routeKey: string;
    menuId?: string;
    maxRequests: number;
    windowMs?: number;
    requiredRoles?: string[];
  },
): Promise<GuardSuccess | GuardFailure> {
  const cookieHeader = incomingCookieHeader(request);
  if (!cookieHeader) return { ok: false, status: 401, error: "unauthorized" };
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const preAuthLimit = consumeRateLimit(
    `${options.routeKey}:ip:${ip}`,
    Math.max(options.maxRequests * 5, 20),
    options.windowMs ?? 60_000,
  );
  if (preAuthLimit) return preAuthLimit;

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    return { ok: false, status: 503, error: "backend_not_configured" };
  }

  const verificationPath = options.menuId
    ? `/menus/${encodeURIComponent(options.menuId)}`
    : "/auth/me";
  let role: string | undefined;
  try {
    const response = await backendCookieFetch(request, verificationPath, {
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status === 401) {
      const payload = (await response.json().catch(() => null)) as {
        code?: unknown;
      } | null;
      const code =
        typeof payload?.code === "string" ? payload.code : undefined;
      return { ok: false, status: 401, error: "unauthorized", code };
    }
    if (!response.ok) {
      return { ok: false, status: 403, error: "forbidden" };
    }
    if (options.requiredRoles?.length) {
      const payload = (await response.json()) as {
        user?: { role?: unknown };
        role?: unknown;
      };
      const rawRole = payload.user?.role ?? payload.role;
      role = typeof rawRole === "string" ? rawRole : undefined;
      if (!role || !options.requiredRoles.includes(role)) {
        return { ok: false, status: 403, error: "forbidden" };
      }
    }
  } catch {
    return { ok: false, status: 503, error: "auth_service_unavailable" };
  }

  const sessionHash = crypto
    .createHash("sha256")
    .update(cookieHeader)
    .digest("hex");
  const rateLimitKey = `${options.routeKey}:${sessionHash}`;
  const limited = consumeRateLimit(
    rateLimitKey,
    options.maxRequests,
    options.windowMs ?? 60_000,
  );
  if (limited) return limited;
  return { ok: true, cookieHeader, rateLimitKey, role };
}
