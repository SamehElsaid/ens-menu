import Cookies from "js-cookie";
import { decryptData, encryptData } from "@/shared/encryption";

export const AUTH_UI_COOKIE_NAME = "ens_ui";

export interface AuthUiHints {
  role: string;
  permissions?: string[];
  staffRoleId?: number;
  roleName?: string;
  menuUuid?: string;
}

const AUTH_UI_COOKIE_OPTIONS = {
  expires: 3,
  sameSite: "Lax" as const,
  secure: true,
  path: "/",
};

function sanitizeHints(value: unknown): AuthUiHints | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const role = typeof raw.role === "string" ? raw.role : "";
  if (!role) return null;

  const permissions = Array.isArray(raw.permissions)
    ? raw.permissions.filter(
        (permission): permission is string => typeof permission === "string",
      )
    : undefined;

  return {
    role,
    ...(permissions ? { permissions } : {}),
    ...(typeof raw.staffRoleId === "number"
      ? { staffRoleId: raw.staffRoleId }
      : {}),
    ...(typeof raw.roleName === "string" ? { roleName: raw.roleName } : {}),
    ...(typeof raw.menuUuid === "string" && raw.menuUuid
      ? { menuUuid: raw.menuUuid }
      : {}),
  };
}

export function decodeAuthUiCookieValue(value: string): AuthUiHints | null {
  try {
    return sanitizeHints(decryptData(value));
  } catch {
    return null;
  }
}

let authUiSnapshotRaw: string | undefined;
let authUiSnapshot: AuthUiHints | null = null;

export function readAuthUiCookie(): AuthUiHints | null {
  const value = Cookies.get(AUTH_UI_COOKIE_NAME);
  if (value === authUiSnapshotRaw) {
    return authUiSnapshot;
  }
  authUiSnapshotRaw = value;
  authUiSnapshot = value ? decodeAuthUiCookieValue(value) : null;
  return authUiSnapshot;
}

export function writeAuthUiCookie(
  hints: AuthUiHints,
  options?: { expires?: number },
): void {
  const safeHints = sanitizeHints(hints);
  if (!safeHints) return;
  Cookies.set(AUTH_UI_COOKIE_NAME, encryptData(safeHints), {
    ...AUTH_UI_COOKIE_OPTIONS,
    ...(options?.expires ? { expires: options.expires } : {}),
  });
  authUiSnapshotRaw = undefined;
}

export function patchAuthUiCookie(
  patch: Partial<Omit<AuthUiHints, "role">>,
): void {
  const current = readAuthUiCookie();
  if (!current) return;
  writeAuthUiCookie({ ...current, ...patch });
}

export function clearAuthUiCookie(): void {
  Cookies.remove(AUTH_UI_COOKIE_NAME, { path: "/" });
  authUiSnapshotRaw = undefined;
  authUiSnapshot = null;
}
