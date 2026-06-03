"use client";
import { useState, type ReactNode } from "react";
import { DashboardContentSection } from "@/components/Dashboard/DashboardContentSection";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";

export default function Layout({
  children,
  segment,
  isAdmin,
  hideSidebar,
}: Readonly<{
  children: ReactNode;
  segment: string | null;
  isAdmin?: boolean;
  hideSidebar?: boolean;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const showSidebar = (segment || isAdmin) && !hideSidebar;

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800 w-full ">
      <div className="flex min-h-screen bg-[#f6f8fb]  dark:bg-[#0d1117]">
        {showSidebar && (
          <DashboardSidebar
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            segment={segment}
            isAdmin={isAdmin}
          />
        )}
        <main
          className={` flex-1 ms-auto ${showSidebar ? "lg:max-w-[calc(100%-270px)]" : "lg:max-w-full"} w-full`}
        >
          <DashboardHeader
            setIsMenuOpen={setIsMenuOpen}
            segment={segment}
            isAdmin={isAdmin}
            hideSidebar={hideSidebar}
          />
          <div className="max-w-[1500px] px-6 mx-auto mt-6">
            <DashboardContentSection>{children}</DashboardContentSection>
          </div>
        </main>
      </div>
    </div>
  );
}
