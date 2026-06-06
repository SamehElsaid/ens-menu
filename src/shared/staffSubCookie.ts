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
