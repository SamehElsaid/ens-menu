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
    <div className="w-full bg-[#f6f8fb] text-slate-800 dark:bg-[#0d1117] dark:text-slate-100 lg:min-h-screen">
      <div className="flex w-full bg-[#f6f8fb] dark:bg-[#0d1117] lg:min-h-screen">
        {showSidebar && (
          <DashboardSidebar
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            segment={segment}
            isAdmin={isAdmin}
          />
        )}
        <main
          className={` flex-1 ms-auto ${showSidebar ? "lg:max-w-[calc(100%-288px)]" : "lg:max-w-full"} w-full`}
        >
          <DashboardHeader
            setIsMenuOpen={setIsMenuOpen}
            segment={segment}
            isAdmin={isAdmin}
            hideSidebar={hideSidebar}
          />
          <div className="mx-auto mt-4 max-w-[1500px] px-4 pb-8 pt-1 sm:mt-6 sm:px-6 sm:pb-10">
            <DashboardContentSection>{children}</DashboardContentSection>
          </div>
        </main>
      </div>
    </div>
  );
}
