import { REMOVE_USER, SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { axiosGet } from "@/shared/axiosCall";
import { useLocale } from "next-intl";
import {
  getAuthHintsFromEncryptedSub,
  isUserNotFoundApiBody,
} from "@/shared/jwtPayload";
import { patchSubCookieWithStaffMenuId } from "@/shared/staffSubCookie";

type UserProfile = {
  user?: {
    email?: string;
    name?: string;
    role?: string;
    profileImage?: string;
    [key: string]: unknown;
  };
};

type AuthMeResponse = { user?: Record<string, unknown> };
type StaffMeResponse = {
  staff?: {
    email?: string;
    name?: string;
  };
  menu?: { id?: number };
};

function staffToAuthPayload(s: { email?: string; name?: string }): UserProfile {
  return {
    user: {
      email: s.email ?? "",
      name: String(s.name ?? ""),
      role: "staff",
      profileImage: "",
    },
  };
}

function useIsLogin() {
  const cookies = Cookies.get("sub");
  const [login, setLogin] = useState(true);
  const dispatch = useDispatch();
  const locale = useLocale();

  const getUser = useCallback(async (): Promise<UserProfile | null> => {
    const sub = Cookies.get("sub");
    if (!sub) return null;

    const hints = getAuthHintsFromEncryptedSub(sub);
    if (!hints) return null;

    const { effectiveRole, token: tokenFromCookie } = hints;

    if (effectiveRole === "staff") {
      const res = await axiosGet<StaffMeResponse>("/staff-auth/me", locale);
      if (res.status && res.data?.staff) {
        const mid = res.data.menu?.id;
        if (typeof mid === "number" && !Number.isNaN(mid)) {
          patchSubCookieWithStaffMenuId(mid);
        }
        return staffToAuthPayload(res.data.staff);
      }
      return null;
    }

    const res = await axiosGet<AuthMeResponse>("/auth/me", locale);
    if (res.status && res.data?.user) {
      return { user: res.data.user } as UserProfile;
    }

    if (tokenFromCookie && isUserNotFoundApiBody(res.data)) {
      const staffRes = await axiosGet<StaffMeResponse>("/staff-auth/me", locale);
      if (staffRes.status && staffRes.data?.staff) {
        const mid = staffRes.data.menu?.id;
        if (typeof mid === "number" && !Number.isNaN(mid)) {
          patchSubCookieWithStaffMenuId(mid);
        }
        return staffToAuthPayload(staffRes.data.staff);
      }
    }

    return null;
  }, [locale]);

  useEffect(() => {
    const checkLogin = async () => {
      if (cookies) {
        const user = await getUser();
        if (user) {
          dispatch(SET_ACTIVE_USER(user as UserProfile));
        }
        const time = setTimeout(() => {
          setLogin(false);
        }, 500);
        return () => clearTimeout(time);
      } else {
        dispatch(REMOVE_USER());

        const time = setTimeout(() => {
          setLogin(false);
        }, 500);

        return () => clearTimeout(time);
      }
    };
    void checkLogin();
  }, [cookies, dispatch, getUser]);

  return login;
}

export default useIsLogin;
