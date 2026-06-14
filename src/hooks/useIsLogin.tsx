import { REMOVE_USER, SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useLocale } from "next-intl";
import { performAuthLogout } from "@/shared/authLogout";
import { resolveAuthMeSession } from "@/shared/resolveAuthMeSession";

type UserProfile = {
  user?: {
    email?: string;
    name?: string;
    role?: string;
    profileImage?: string;
    [key: string]: unknown;
  };
};

type GetUserResult = UserProfile | "logout" | null;

function useIsLogin() {
  const cookies = Cookies.get("sub");
  const [login, setLogin] = useState(true);
  const dispatch = useDispatch();
  const locale = useLocale();

  const getUser = useCallback(async (): Promise<GetUserResult> => {
    const result = await resolveAuthMeSession(locale);
    if (result.outcome === "logout") return "logout";
    if (result.outcome === "user") return { user: result.user };
    return null;
  }, [locale]);

  useEffect(() => {
    const checkLogin = async () => {
      if (cookies) {
        const result = await getUser();
        if (result === "logout") {
          await performAuthLogout();
          return;
        } else if (result) {
          dispatch(SET_ACTIVE_USER(result as UserProfile));
        }
        const time = setTimeout(() => {
          setLogin(false);
        }, 500);
        return () => clearTimeout(time);
      } else {
        dispatch(REMOVE_USER());
        Cookies.remove("sub", { path: "/" });

        const time = setTimeout(() => {
          setLogin(false);
        }, 500);

        return () => clearTimeout(time);
      }
    };
    void checkLogin();
  }, [cookies, dispatch, getUser, locale]);

  return login;
}

export default useIsLogin;
