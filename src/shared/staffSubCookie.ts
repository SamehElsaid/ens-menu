import Cookies from "js-cookie";
import { decryptData, encryptData } from "@/shared/encryption";

const SUB_COOKIE_OPTS = {
  expires: 3,
  sameSite: "Strict" as const,
  secure: true,
  path: "/",
};

/** After /staff-auth/me, persist menu id so the header can link to /dashboard/:id from any page. */
export function patchSubCookieWithStaffMenuId(menuId: number): void {
  if (menuId == null || Number.isNaN(menuId)) return;
  const sub = Cookies.get("sub");
  if (!sub) return;
  try {
    const d = decryptData(sub) as Record<string, unknown>;
    if (d.role !== "staff") return;
    if (d.menuId != null && String(d.menuId) !== "") return;
    Cookies.set("sub", encryptData({ ...d, menuId }), SUB_COOKIE_OPTS);
  } catch {
    /* noop */
  }
}
