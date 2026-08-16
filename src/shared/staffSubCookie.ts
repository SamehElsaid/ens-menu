import {
  patchAuthUiCookie,
  readAuthUiCookie,
} from "@/shared/authUiCookie";

/** After /staff-auth/me, persist menu UUID so the header can link to /dashboard/:uuid from any page. */
export function patchSubCookieWithStaffMenuUuid(menuUuid: string): void {
  if (!menuUuid) return;
  const hints = readAuthUiCookie();
  if (hints?.role !== "staff" || hints.menuUuid) return;
  patchAuthUiCookie({ menuUuid });
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
  const hints = readAuthUiCookie();
  if (hints?.role !== "staff") return;
  patchAuthUiCookie({
    ...(patch.menuUuid && !hints.menuUuid ? { menuUuid: patch.menuUuid } : {}),
    ...(Array.isArray(patch.permissions)
      ? {
          permissions: patch.permissions.filter(
            (permission): permission is string =>
              typeof permission === "string",
          ),
        }
      : {}),
    ...(typeof patch.staffRoleId === "number"
      ? { staffRoleId: patch.staffRoleId }
      : {}),
    ...(typeof patch.roleName === "string"
      ? { roleName: patch.roleName }
      : {}),
  });
}
