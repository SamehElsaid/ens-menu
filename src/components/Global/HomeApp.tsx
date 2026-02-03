import { useEffect, useState } from "react";
import Loader from "./Loader";
import useIsLogin from "@/hooks/useIsLogin";

function HomeApp({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const isLogin = useIsLogin();
  console.log(isLogin);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  return (
    <>
      {(loading || isLogin) && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-111111 flex items-center justify-center">
          <Loader />
        </div>
      )}
      {children}
    </>
  );
}

export default HomeApp;
