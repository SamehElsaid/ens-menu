"use client";

import { FiChevronsLeft, FiChevronsRight, FiMenu } from "react-icons/fi";
import UserDropDown from "../UserDropDown";
import { Logo } from "../Global/Logo";
import LanguageToggle from "../Global/LanguageTogle";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import DarkModeToggle from "../Global/DarkModeToggle";
import NotificationBell from "@/components/Dashboard/NotificationBell";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store/hooks";
import { resolveConsoleTrail, type ConsoleScope } from "@/lib/consoleNav";
import ConsoleBreadcrumbs from "./ConsoleBreadcrumbs";
import CommandTrigger from "./CommandTrigger";

/**
 * Console top bar — CONSOLE-REDESIGN.md §3.
 *
 * The bar carries the breadcrumb trail and nothing else that names the page. It
 * used to render a venue chip beside a page title, inside an element labelled
 * `aria-label="breadcrumb"` that contained no trail — on routes four levels
 * deep. The page's own `<h1>` lives in the content, so removing the duplicate
 * title here is what makes room for the trail without growing the bar.
 *
 * The surface is solid rather than translucent. Content scrolling under a
 * blurred bar reads as a smear behind the one element that has to stay
 * authoritative, and it costs a compositor pass on every frame of every scroll.
 */
export function ConsoleHeader({
  setIsMenuOpen,
  onToggleRail,
  railCollapsed,
  scope,
  venueRef,
  isAdmin,
  hideSidebar,
  hasSidebar,
  onOpenCommand,
}: {
  setIsMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onToggleRail: () => void;
  railCollapsed: boolean;
  scope: ConsoleScope;
  venueRef: string | null;
  isAdmin?: boolean;
  hideSidebar?: boolean;
  hasSidebar?: boolean;
  onOpenCommand: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const menu = useAppSelector((state) => state.menuData.menu);
  const showNav = (venueRef || isAdmin || hasSidebar) && !hideSidebar;

  const venueName =
    !isAdmin && menu
      ? ((locale === "ar" ? menu.nameAr : menu.nameEn) ?? undefined)
      : undefined;

  const crumbs = resolveConsoleTrail({
    pathname,
    scope,
    venueRef,
    venueName,
    t,
  });

  return (
    <header className="dashboard-header sticky top-0 z-30 border-b border-line bg-surface">
      <div className="flex h-12 items-center gap-1.5 px-3 sm:gap-2 sm:px-4">
        {showNav ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
              className="-ms-1 lg:hidden"
              aria-label={tCommon("openMenu")}
            >
              <FiMenu className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              iconOnly
              onClick={onToggleRail}
              className="-ms-1 hidden lg:inline-flex"
              aria-label={railCollapsed ? t("railExpand") : t("railCollapse")}
              aria-pressed={railCollapsed}
            >
              {railCollapsed ? (
                <FiChevronsRight className="size-4 rtl:hidden" />
              ) : (
                <FiChevronsLeft className="size-4 rtl:hidden" />
              )}
              {/* Chevrons are directional, so they flip with the script. */}
              {railCollapsed ? (
                <FiChevronsLeft className="hidden size-4 rtl:block" />
              ) : (
                <FiChevronsRight className="hidden size-4 rtl:block" />
              )}
            </Button>
          </>
        ) : null}

        {hideSidebar ? (
          <Logo size="header" className="dashboard-header__logo max-h-8" />
        ) : (
          <ConsoleBreadcrumbs crumbs={crumbs} label={tCommon("breadcrumb")} />
        )}

        <div className="flex shrink-0 items-center justify-end gap-0.5">
          <CommandTrigger onOpen={onOpenCommand} />
          <NotificationBell segment={venueRef} />
          <DarkModeToggle />
          <div className="hidden sm:block">
            <LanguageToggle locale={locale} pathname={pathname} />
          </div>
          <UserDropDown />
        </div>
      </div>
    </header>
  );
}

export default ConsoleHeader;
