import { decryptData } from "@/shared/encryption";

/** Read JWT payload (no verify) for routing / hydrate (role, staff job). */
export function decodeJwtPayload(
  token: string,
): { role?: string; staffJobRole?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json) as {
      role?: string;
      staffJobRole?: string;
      exp?: number;
    };
  } catch {
    return null;
  }
}

/** From encrypted `sub` cookie: prefer JWT claims over stored cookie fields (older sessions may omit `role`). */
export function getAuthHintsFromEncryptedSub(sub: string): {
  effectiveRole?: string;
  token?: string;
  staffJobRole?: string;
  /** Cashier: persisted from login or patched after /staff-auth/me. */
  menuId?: number;
} | null {
  try {
    const d = decryptData(sub) as {
      role?: string;
      token?: string;
      staffJobRole?: string;
      menuId?: number | string;
    };
    const token = typeof d.token === "string" ? d.token : undefined;
    const payload = token ? decodeJwtPayload(token) : null;
    const effectiveRole = payload?.role ?? d.role;
    const staffJobRole = d.staffJobRole ?? payload?.staffJobRole;
    const rawMenuId = d.menuId;
    const menuIdNum =
      rawMenuId !== undefined && rawMenuId !== null && String(rawMenuId) !== ""
        ? Number(rawMenuId)
        : undefined;
    const menuId =
      menuIdNum !== undefined && !Number.isNaN(menuIdNum)
        ? menuIdNum
        : undefined;
    return { effectiveRole, token, staffJobRole, menuId };
  } catch {
    return null;
  }
}

/** True when `sub` cookie has a non-expired JWT (used in middleware). */
export function isAuthenticatedSession(subCookie: string | undefined): boolean {
  if (!subCookie?.trim()) return false;

  const hints = getAuthHintsFromEncryptedSub(subCookie);
  if (!hints?.token || !hints.effectiveRole) return false;

  const payload = decodeJwtPayload(hints.token);
  if (!payload) return false;

  if (typeof payload.exp === "number") {
    return payload.exp * 1000 > Date.now();
  }

  return true;
}

/** API body from GET /auth/me when staff JWT was sent (expected before fallback to /staff-auth/me). */
export function isUserNotFoundApiBody(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const o = data as { error?: string; errorEn?: string; errorAr?: string };
  const parts = [o.error, o.errorEn, o.errorAr].filter(
    (x): x is string => typeof x === "string",
  );
  return parts.some(
    (p) => p.includes("User not found") || p.includes("المستخدم غير موجود"),
  );
}
