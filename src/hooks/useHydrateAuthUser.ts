"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { performAuthLogout } from "@/shared/authLogout";
import { resolveAuthMeSession } from "@/shared/resolveAuthMeSession";

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

    let cancelled = false;

    const run = async () => {
      const result = await resolveAuthMeSession(locale);
      if (cancelled) return;

      if (result.outcome === "logout") {
        await performAuthLogout();
        return;
      }

      if (result.outcome === "user") {
        dispatch(SET_ACTIVE_USER({ user: result.user }));
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [authData, dispatch, locale]);
}
