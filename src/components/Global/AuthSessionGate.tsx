"use client";

import Loader from "./Loader";
import useIsLogin from "@/hooks/useIsLogin";

export default function AuthSessionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLogin = useIsLogin();

  return (
    <>
      {isLogin && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-111111 flex items-center justify-center">
          <Loader />
        </div>
      )}
      {children}
    </>
  );
}
