import { useEffect, useState } from "react";
import useIsLogin from "@/hooks/useIsLogin";
import useCatchError from "@/hooks/useCatchError";
import Loader from "./Loader";

function HomeApp({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const isLogin = useIsLogin();
  useCatchError();
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  return (
    <>
      {/* The splash covers a redirect, so it has to sit above every layer the
          app draws — including modals and the sticky dashboard chrome — and it
          takes the page ground rather than a hard white so a dark-mode visitor
          is not flashed. */}
      {(loading || isLogin) && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-app">
          <Loader />
        </div>
      )}
      {children}
    </>
  );
}

export default HomeApp;
