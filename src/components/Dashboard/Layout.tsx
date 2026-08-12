"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { DashboardContentSection } from "@/components/Dashboard/DashboardContentSection";
import ConsoleHeader from "@/components/Dashboard/ConsoleHeader";
import ConsoleSidebar from "@/components/Dashboard/ConsoleSidebar";
import CommandPalette, {
  useCommandPalette,
} from "@/components/Dashboard/CommandPalette";
import { useRailCollapsed } from "@/hooks/useRailCollapsed";
import { useIsPlatformAdmin } from "@/hooks/useIsPlatformAdmin";
import { buttonClasses } from "@/components/ui";
import type { ConsoleScope } from "@/lib/consoleNav";

/**
 * Console shell — CONSOLE-REDESIGN.md §4.
 *
 * The rail is fixed and the content column is inset by `--rail-w`, so collapse
 * is one custom-property change rather than two components trying to agree on a
 * number. The old shell hard-coded `lg:ps-[240px]` beside a `SIDEBAR_WIDTH`
 * constant and relied on a comment to keep them in step.
 *
 * Document scroll is kept deliberately. Making the content column its own scroll
 * container is the fashionable choice, but it breaks `position: sticky` table
 * headers, breaks scroll restoration and misbehaves on iOS. With document
 * scroll, `sticky top-12` under a 48px header gives sticky tables for free.
 */
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
  /** Retained name; `menu` is the venue scope and `account` the account one. */
  variant?: "menu" | "account";
}>) {
  const t = useTranslations("Dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { collapsed, toggle } = useRailCollapsed();
  const { open, openPalette, closePalette } = useCommandPalette();
  const holdsAdminRole = useIsPlatformAdmin();

  const scope: ConsoleScope = isAdmin
    ? "admin"
    : variant === "account"
      ? "account"
      : "venue";

  const venueRef = scope === "venue" ? segment : null;
  const showSidebar = !hideSidebar;
  /* Offered as a destination only from the merchant side — the back office
     already has its own rail once you are in it. */
  const canReachAdmin = holdsAdminRole && !isAdmin;

  return (
    <div
      className="console-shell min-h-dvh bg-app text-fg"
      data-rail={showSidebar && collapsed ? "collapsed" : "expanded"}
    >
      {/* Seventeen rail rows stand between a keyboard user and the page. */}
      <a
        href="#console-main"
        className={cn(
          "console-skip-link",
          buttonClasses({ variant: "primary", size: "sm" }),
        )}
      >
        {t("skipToContent")}
      </a>

      {showSidebar ? (
        <ConsoleSidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          collapsed={collapsed}
          venueRef={venueRef}
          scope={scope}
          isAdmin={isAdmin}
          canReachAdmin={canReachAdmin}
        />
      ) : null}

      <div
        className={cn("flex min-h-dvh flex-col", showSidebar && "console-main")}
      >
        <ConsoleHeader
          setIsMenuOpen={setIsMenuOpen}
          onToggleRail={toggle}
          railCollapsed={collapsed}
          scope={scope}
          venueRef={venueRef}
          isAdmin={isAdmin}
          hideSidebar={hideSidebar}
          hasSidebar={showSidebar}
          onOpenCommand={openPalette}
        />

        <main id="console-main" className="flex-1">
          <DashboardContentSection>{children}</DashboardContentSection>
        </main>
      </div>

      <CommandPalette
        open={open}
        onClose={closePalette}
        venueRef={venueRef}
        canReachAdmin={holdsAdminRole}
      />
    </div>
  );
}
