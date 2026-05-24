import Cookies from "js-cookie";
import { decryptData, encryptData } from "./encryption";

export type AuthCookiePayload = {
  token: string;
  refreshToken: string;
  role: string;
  staffJobRole?: string;
  menuId?: string;
  /** false = must complete phone verification before dashboard */
  phoneVerified?: boolean;
  phoneNumber?: string | null;
};

const COOKIE_OPTS = {
  expires: 3,
  sameSite: "Strict" as const,
  secure: true,
  path: "/",
};

export function readAuthCookie(): AuthCookiePayload | null {
  const raw = Cookies.get("sub");
  if (!raw) return null;
  const data = decryptData(raw) as AuthCookiePayload;
  if (!data?.token) return null;
  return data;
}

export function writeAuthCookie(payload: AuthCookiePayload): void {
  Cookies.set("sub", encryptData(payload), COOKIE_OPTS);
}

export function patchAuthCookie(patch: Partial<AuthCookiePayload>): void {
  const current = readAuthCookie();
  if (!current) return;
  writeAuthCookie({ ...current, ...patch });
}

export function isPhoneVerificationPending(
  payload: AuthCookiePayload | null,
): boolean {
  return payload?.phoneVerified === false;
}
