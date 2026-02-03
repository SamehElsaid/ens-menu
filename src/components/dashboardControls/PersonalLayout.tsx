"use client";

import { ReactNode, useEffect, useState } from "react";
import PersonalNavigationSwiper from "@/components/PersonalNavigationSwiper";
import Loader from "@/components/Global/Loader";
import { usePathname } from "next/navigation";
import CardDashBoard from "@/components/Card/CardDashBoard";

function PersonalLayout({ children, type }: { children: ReactNode, type: "specialist" | "parent" }) {
  const [loading, setLoading] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [pathname]);

  return (
    <>
      <PersonalNavigationSwiper setLoading={setLoading} loading={loading} type={type} />
      {loading ? (
        <CardDashBoard className="flex justify-center items-center min-h-[400px]">
          <Loader />
        </CardDashBoard>
      ) : (
        children
      )}
    </>
  );
}

export default PersonalLayout;
