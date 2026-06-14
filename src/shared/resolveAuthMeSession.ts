import Cookies from "js-cookie";
import { axiosGet } from "@/shared/axiosCall";
import {
  getAuthHintsFromEncryptedSub,
  isUserNotFoundApiBody,
} from "@/shared/jwtPayload";
import { patchSubCookieWithStaffMenuUuid } from "@/shared/staffSubCookie";

type AuthMeResponse = { user?: Record<string, unknown> };
type StaffMeResponse = {
  staff?: {
    email?: string;
    name?: string;
  };
  menu?: { id?: number; uuid?: string };
};

export type ResolvedAuthUser = {
  email?: string;
  name?: string;
  role?: string;
  profileImage?: string;
  onboardingCompleted?: boolean;
  [key: string]: unknown;
};

export type ResolveAuthMeResult =
  | { outcome: "user"; user: ResolvedAuthUser }
  | { outcome: "logout" }
  | { outcome: "none" };

function staffToUser(staff: { email?: string; name?: string }): ResolvedAuthUser {
  return {
    email: staff.email ?? "",
    name: String(staff.name ?? ""),
    role: "staff",
    profileImage: "",
  };
}

async function resolveStaffMe(locale: string): Promise<ResolveAuthMeResult> {
  const res = await axiosGet<StaffMeResponse>("/staff-auth/me", locale);
  if (res.statusCode === 401 || res.statusCode === 404) {
    return { outcome: "logout" };
  }
  if (res.status && res.data?.staff) {
    const menuUuid = res.data.menu?.uuid;
    if (typeof menuUuid === "string" && menuUuid.length > 0) {
      patchSubCookieWithStaffMenuUuid(menuUuid);
    }
    return { outcome: "user", user: staffToUser(res.data.staff) };
  }
  return { outcome: "logout" };
}

/** Resolve the current session via `/auth/me` (with staff fallback when applicable). */
export async function resolveAuthMeSession(
  locale: string,
): Promise<ResolveAuthMeResult> {
  const sub = Cookies.get("sub");
  if (!sub) return { outcome: "none" };

  const hints = getAuthHintsFromEncryptedSub(sub);
  if (!hints) return { outcome: "logout" };

  const { effectiveRole, token: tokenFromCookie } = hints;

  if (effectiveRole === "staff") {
    return resolveStaffMe(locale);
  }

  const res = await axiosGet<AuthMeResponse>("/auth/me", locale);
  if (res.statusCode === 401) return { outcome: "logout" };
  if (res.status && res.data?.user) {
    return { outcome: "user", user: res.data.user as ResolvedAuthUser };
  }

  if (res.statusCode === 404) {
    if (tokenFromCookie && isUserNotFoundApiBody(res.data)) {
      return resolveStaffMe(locale);
    }
    return { outcome: "logout" };
  }

  return { outcome: "none" };
}
