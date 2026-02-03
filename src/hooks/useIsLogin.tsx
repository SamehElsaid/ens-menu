import { REMOVE_USER, SET_ACTIVE_USER } from "@/store/authSlice/authSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { decryptData } from "@/shared/encryption";

function useIsLogin() {
  const cookies = Cookies.get("sub");
  const [login, setLogin] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cookies) {
      const decryptedData = decryptData(cookies);
      dispatch(SET_ACTIVE_USER({ ...decryptedData }));
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
  }, [cookies, dispatch]);

  return login;
}

export default useIsLogin;
