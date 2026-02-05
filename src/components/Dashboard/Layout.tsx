"use client";
import { useState, type ReactNode } from "react";
import { DashboardContentSection } from "@/components/Dashboard/DashboardContentSection";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";

export default function Layout({
  children,
  segment,
  type = "dashboard",
}: Readonly<{ children: ReactNode, segment: string | null, type?: "dashboard" | "select-menu" }>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800 w-full">
      <div className="flex min-h-screen bg-[#f6f8fb] ">
        {segment && (
          <DashboardSidebar
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            type={type}
            segment={segment}
          />
        )}
        <main className={` flex-1 ms-auto ${segment ? 'lg:max-w-[calc(100%-270px)]' : 'lg:max-w-full'} w-full`}>
          <DashboardHeader
            setIsMenuOpen={setIsMenuOpen}
            segment={segment}
          />
          <div className="max-w-[1500px] px-6 mx-auto mt-6">
            <DashboardContentSection>{children}</DashboardContentSection>
          </div>

        </main>
      </div>
    </div>
  );
}
