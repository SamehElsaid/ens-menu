import { useEffect, useState } from "react";
import useIsLogin from "@/hooks/useIsLogin";
import useCatchError from "@/hooks/useCatchError";
import Loader from "./Loader";
import { usePathname } from "@/i18n/navigation";

function isConsolePath(pathname: string): boolean {
  const path = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/auth")
  );
}

function HomeApp({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const isLogin = useIsLogin();
  const pathname = usePathname();
  useCatchError();
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  const showSplash = isConsolePath(pathname) && (loading || isLogin);

  return (
    <>
      {showSplash && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-app">
          <Loader />
        </div>
      )}
      {children}
    </>
  );
}

export default HomeApp;
