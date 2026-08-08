"use client";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DashboardContentSection } from "@/components/Dashboard/DashboardContentSection";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import {
  DashboardSidebar,
  type SidebarVariant,
} from "@/components/Dashboard/DashboardSidebar";

/**
 * Application shell for the merchant dashboard and the admin back-office.
 *
 * The main column is offset with padding rather than a max-width calculation,
 * so the sticky header spans the full content area and nothing overflows when
 * the rail is absent. Keep this inset in step with `SIDEBAR_WIDTH`.
 */
const SIDEBAR_INSET = "lg:ps-[240px]";

export default function Layout({
  children,
  segment,
  isAdmin,
  hideSidebar,
  variant = "menu",
}: Readonly<{
  children: ReactNode;
  segment: string | null;
  isAdmin?: boolean;
  hideSidebar?: boolean;
  variant?: SidebarVariant;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // The account sidebar has no `segment` — it is the /dashboard root itself.
  const showSidebar =
    (segment || isAdmin || variant === "account") && !hideSidebar;

  return (
    <div className="min-h-dvh bg-app text-fg">
      {showSidebar ? (
        <DashboardSidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          segment={segment}
          isAdmin={isAdmin}
          variant={variant}
        />
      ) : null}

      <div
        className={cn("flex min-h-dvh flex-col", showSidebar && SIDEBAR_INSET)}
      >
        <DashboardHeader
          setIsMenuOpen={setIsMenuOpen}
          segment={segment}
          isAdmin={isAdmin}
          hideSidebar={hideSidebar}
          hasSidebar={Boolean(showSidebar)}
        />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 sm:py-5">
            <DashboardContentSection>{children}</DashboardContentSection>
          </div>
        </main>
      </div>
    </div>
  );
}
