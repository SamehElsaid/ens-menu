import { REMOVE_USER, SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { axiosGet } from "@/shared/axiosCall";
import { useLocale } from "next-intl";


type UserProfile = {
  email: string;
  name: string;
  kind: string;
};

function useIsLogin() {
  const cookies = Cookies.get("sub");
  const [login, setLogin] = useState(true);
  const dispatch = useDispatch();
  const locale = useLocale();

  const getUser = useCallback(async () => {
    const response = await axiosGet("/auth/me", locale);
    if (response.status) {
      console.log(response.data);
      return response.data;
    }
    return null;
  }, [locale]);

  useEffect(() => {
    const checkLogin = async () => {
      if (cookies) {
        const user = await getUser();

        dispatch(SET_ACTIVE_USER(user as UserProfile));
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
    }
    checkLogin();
  }, [cookies, dispatch, getUser]);

  return login;
}

export default useIsLogin;
