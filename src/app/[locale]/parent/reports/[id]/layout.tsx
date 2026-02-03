"use client";

import { ReactNode, useEffect, useState } from "react";
import ClientNavigationSwiper from "@/components/ClientNavigationSwiper";
import ClientSidebar from "@/components/ClientSidebar";
import Loader from "@/components/Global/Loader";
import { usePathname } from "next/navigation";
import CardDashBoard from "@/components/Card/CardDashBoard";

interface ClientLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function ClientLayout({ children, params }: ClientLayoutProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    params.then((resolvedParams) => {
      setClientId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, [pathname]);

  if (!clientId) {
    return (
      <CardDashBoard className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </CardDashBoard>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <ClientSidebar clientId={clientId} />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <ClientNavigationSwiper
          setLoading={setLoading}
          loading={loading}
          clientId={clientId}
        />
        {loading ? (
          <CardDashBoard className="flex justify-center items-center min-h-[400px]">
            <Loader />
          </CardDashBoard>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

