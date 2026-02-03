"use client";
import { useState, type ReactNode } from "react";
import { DashboardContentSection } from "@/components/Dashboard/DashboardContentSection";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-800 w-full">
      <div className="flex min-h-screen bg-[#f6f8fb] ">
        <DashboardSidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        <main className="flex-1 ms-auto  lg:max-w-[calc(100%-270px)] w-full">
          <DashboardHeader
            setIsMenuOpen={setIsMenuOpen}
          />
          <div className="max-w-[1500px] px-6 mx-auto mt-6">
            <DashboardContentSection>{children}</DashboardContentSection>
          </div>
        </main>
      </div>
    </div>
  );
}
