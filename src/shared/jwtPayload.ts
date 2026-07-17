import { decryptData } from "@/shared/encryption";

/** Read JWT payload (no verify) for routing / hydrate (role). */
export function decodeJwtPayload(
  token: string,
): { role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const json = atob(base64);
    return JSON.parse(json) as { role?: string };
  } catch {
    return null;
  }
}

/** From encrypted `sub` cookie: prefer JWT claims over stored cookie fields (older sessions may omit `role`). */
export function getAuthHintsFromEncryptedSub(sub: string): {
  effectiveRole?: string;
  token?: string;
  /** Staff: persisted from login or patched after /staff-auth/me. */
  menuUuid?: string;
} | null {
  try {
    const d = decryptData(sub) as {
      role?: string;
      token?: string;
      menuUuid?: string;
    };
    const token = typeof d.token === "string" ? d.token : undefined;
    const payload = token ? decodeJwtPayload(token) : null;
    const effectiveRole = payload?.role ?? d.role;
    const menuUuid =
      typeof d.menuUuid === "string" && d.menuUuid.length > 0
        ? d.menuUuid
        : undefined;
    return { effectiveRole, token, menuUuid };
  } catch {
    return null;
  }
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
