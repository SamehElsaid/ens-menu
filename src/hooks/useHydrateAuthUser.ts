"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import {
  getAuthHintsFromEncryptedSub,
  isUserNotFoundApiBody,
} from "@/shared/jwtPayload";
import { patchSubCookieWithStaffMenuId } from "@/shared/staffSubCookie";

type AuthMeResponse = { user?: Record<string, unknown> };
type StaffMeResponse = {
  staff?: {
    email?: string;
    name?: string;
  };
  menu?: { id?: number };
};

/**
 * After a full page refresh, Redux auth is empty but the `sub` cookie remains.
 * Re-fetch profile: `/auth/me` for owners/admins, `/staff-auth/me` for staff JWT.
 */
export function useHydrateAuthUser(): void {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const authData = useAppSelector((s) => s.auth.data);

  useEffect(() => {
    if (authData) return;
    const sub = Cookies.get("sub");
    if (!sub) return;

    const hints = getAuthHintsFromEncryptedSub(sub);
    if (!hints) return;

    const { effectiveRole, token: tokenFromCookie } = hints;

    let cancelled = false;

    const run = async () => {
      try {
        if (effectiveRole === "staff") {
          const res = await axiosGet<StaffMeResponse>("/staff-auth/me", locale);
          if (cancelled || !res.status || !res.data?.staff) return;
          const mid = res.data.menu?.id;
          if (typeof mid === "number" && !Number.isNaN(mid)) {
            patchSubCookieWithStaffMenuId(mid);
          }
          const s = res.data.staff;
          dispatch(
            SET_ACTIVE_USER({
              user: {
                email: s.email ?? "",
                name: String(s.name ?? ""),
                role: "staff",
                profileImage: "",
              },
            }),
          );
        } else {
          const res = await axiosGet<AuthMeResponse>("/auth/me", locale);
          if (cancelled) return;
          if (res.status && res.data?.user) {
            dispatch(SET_ACTIVE_USER({ user: res.data.user }));
            return;
          }
          if (tokenFromCookie && isUserNotFoundApiBody(res.data)) {
            const staffRes = await axiosGet<StaffMeResponse>(
              "/staff-auth/me",
              locale,
            );
            if (cancelled || !staffRes.status || !staffRes.data?.staff) return;
            const mid = staffRes.data.menu?.id;
            if (typeof mid === "number" && !Number.isNaN(mid)) {
              patchSubCookieWithStaffMenuId(mid);
            }
            const s = staffRes.data.staff;
            dispatch(
              SET_ACTIVE_USER({
                user: {
                  email: s.email ?? "",
                  name: String(s.name ?? ""),
                  role: "staff",
                  profileImage: "",
                },
              }),
            );
          }
        }
      } finally {
        /* noop */
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [authData, dispatch, locale]);
}
