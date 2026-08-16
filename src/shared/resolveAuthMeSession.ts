import { axiosGet } from "@/shared/axiosCall";
import { patchSubCookieWithStaffSession } from "@/shared/staffSubCookie";
import { readAuthUiCookie } from "@/shared/authUiCookie";

type AuthMeResponse = { user?: Record<string, unknown> };
type StaffMeResponse = {
  staff?: {
    email?: string;
    name?: string;
  };
  role?: { id?: number; name?: string | null } | null;
  permissions?: string[];
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
    patchSubCookieWithStaffSession({
      menuUuid:
        typeof menuUuid === "string" && menuUuid.length > 0
          ? menuUuid
          : undefined,
      permissions: Array.isArray(res.data.permissions)
        ? res.data.permissions
        : undefined,
      staffRoleId:
        typeof res.data.role?.id === "number" ? res.data.role.id : undefined,
      roleName:
        typeof res.data.role?.name === "string" ? res.data.role.name : undefined,
    });
    return { outcome: "user", user: staffToUser(res.data.staff) };
  }
  return { outcome: "logout" };
}

/** Resolve the current session via `/auth/me` (with staff fallback when applicable). */
export async function resolveAuthMeSession(
  locale: string,
): Promise<ResolveAuthMeResult> {
  const hints = readAuthUiCookie();
  if (!hints) return { outcome: "none" };

  if (hints.role === "staff") {
    return resolveStaffMe(locale);
  }

  const res = await axiosGet<AuthMeResponse>("/auth/me", locale);
  if (res.statusCode === 401) return { outcome: "logout" };
  if (res.status && res.data?.user) {
    return { outcome: "user", user: res.data.user as ResolvedAuthUser };
  }

  if (res.statusCode === 404) {
    return { outcome: "logout" };
  }

  return { outcome: "none" };
}
