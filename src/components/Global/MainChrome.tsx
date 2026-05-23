"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

function isAuthPath(pathname: string) {
  return /\/auth(\/|$)/.test(pathname);
}

export default function MainChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const hideHeader = isAuthPath(pathname);

  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
