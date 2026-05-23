"use client";

import useCatchError from "@/hooks/useCatchError";

function HomeApp({ children }: { children: React.ReactNode }) {
  useCatchError();
  return <>{children}</>;
}

export default HomeApp;
