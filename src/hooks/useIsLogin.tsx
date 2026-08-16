import {
  CLEAR_AUTH_SESSION_CACHE,
  SET_AUTH_SESSION_CACHE,
} from "@/store/authSlice/authSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { performAuthLogout } from "@/shared/authLogout";
import { resolveAuthMeSession } from "@/shared/resolveAuthMeSession";
import type { AuthSessionCache } from "@/types/User";
import { getSharedRequest } from "@/lib/sharedRequest";
import {
  AUTH_UI_COOKIE_NAME,
  clearAuthUiCookie,
} from "@/shared/authUiCookie";

type GetUserResult = AuthSessionCache | "logout" | null;

function useIsLogin() {
  const cookies = Cookies.get(AUTH_UI_COOKIE_NAME);
  const [login, setLogin] = useState(true);
  const dispatch = useDispatch();
  const locale = useLocale();

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finishLoading = () => {
      if (cancelled) return;
      timer = setTimeout(() => {
        if (!cancelled) setLogin(false);
      }, 500);
    };

    const checkLogin = async () => {
      if (cookies) {
        const result = await getSharedRequest<GetUserResult>(
          `auth-me:${locale}:${cookies}`,
          async () => {
            const resolved = await resolveAuthMeSession(locale);
            if (resolved.outcome === "logout") return "logout";
            if (resolved.outcome === "user") return { user: resolved.user };
            return null;
          },
        );
        if (cancelled) return;
        if (result === "logout") {
          await performAuthLogout();
          return;
        } else if (result) {
          dispatch(SET_AUTH_SESSION_CACHE(result));
        }
        finishLoading();
      } else {
        if (cancelled) return;
        dispatch(CLEAR_AUTH_SESSION_CACHE());
        clearAuthUiCookie();
        // Remove legacy browser-readable sessions from pre-migration builds.
        Cookies.remove("sub", { path: "/" });
        finishLoading();
      }
    };
    queueMicrotask(() => {
      if (!cancelled) {
        void checkLogin().catch(() => finishLoading());
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [cookies, dispatch, locale]);

  return login;
}

export default useIsLogin;
