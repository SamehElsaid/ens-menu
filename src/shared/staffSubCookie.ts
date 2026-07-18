import Cookies from "js-cookie";
import { decryptData, encryptData } from "@/shared/encryption";

const SUB_COOKIE_OPTS = {
  expires: 3,
  sameSite: "Strict" as const,
  secure: true,
  path: "/",
};

/** After /staff-auth/me, persist menu UUID so the header can link to /dashboard/:uuid from any page. */
export function patchSubCookieWithStaffMenuUuid(menuUuid: string): void {
  if (!menuUuid) return;
  const sub = Cookies.get("sub");
  if (!sub) return;
  try {
    const d = decryptData(sub) as Record<string, unknown>;
    if (d.role !== "staff") return;
    if (d.menuUuid != null && String(d.menuUuid) !== "") return;
    Cookies.set("sub", encryptData({ ...d, menuUuid }), SUB_COOKIE_OPTS);
  } catch {
    /* noop */
  }
}

export interface StaffSessionPatch {
  menuUuid?: string;
  permissions?: string[];
  staffRoleId?: number;
  roleName?: string;
}

/**
 * After /staff-auth/me, refresh the staff RBAC fields (permissions, role) so UI
 * gating reflects the latest role config without requiring a re-login. The
 * backend remains the source of truth for enforcement.
 */
export function patchSubCookieWithStaffSession(patch: StaffSessionPatch): void {
  const sub = Cookies.get("sub");
  if (!sub) return;
  try {
    const d = decryptData(sub) as Record<string, unknown>;
    if (d.role !== "staff") return;

    const next: Record<string, unknown> = { ...d };
    if (patch.menuUuid && !(d.menuUuid != null && String(d.menuUuid) !== "")) {
      next.menuUuid = patch.menuUuid;
    }
    if (Array.isArray(patch.permissions)) {
      next.permissions = patch.permissions.filter(
        (p): p is string => typeof p === "string",
      );
    }
    if (typeof patch.staffRoleId === "number") {
      next.staffRoleId = patch.staffRoleId;
    }
    if (typeof patch.roleName === "string") {
      next.roleName = patch.roleName;
    }
    Cookies.set("sub", encryptData(next), SUB_COOKIE_OPTS);
  } catch {
    /* noop */
  }
}
