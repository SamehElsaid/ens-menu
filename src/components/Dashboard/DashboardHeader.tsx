import { FiMenu } from "react-icons/fi";
import UserDropDown from "../UserDropDown";
import { Logo } from "../Global/Logo";
import LanguageToggle from "../Global/LanguageTogle";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import DarkModeToggle from "../Global/DarkModeToggle";
import HeaderSearch from "../Global/HeaderSearch";
import { useDashboardTitle } from "@/components/Dashboard/DashboardTitleProvider";
import NotificationBell from "@/components/Dashboard/NotificationBell";
import { Button } from "@/components/ui";

/**
 * Dashboard top bar.
 *
 * The title sits at the leading edge rather than centring a logo the sidebar
 * already shows, so the bar answers "where am I" at a glance.
 */
export function DashboardHeader({
  setIsMenuOpen,
  segment,
  isAdmin,
  hideSidebar,
  hasSidebar,
}: {
  setIsMenuOpen: (isMenuOpen: boolean | ((prev: boolean) => boolean)) => void;
  segment: string | null;
  isAdmin?: boolean;
  hideSidebar?: boolean;
  hasSidebar?: boolean;
}) {
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const showSidebarToggle = (segment || isAdmin || hasSidebar) && !hideSidebar;
  const pageTitle = useDashboardTitle();

  return (
    <header className="dashboard-header sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="flex h-12 items-center gap-1.5 px-3 sm:gap-2 sm:px-4">
        {showSidebarToggle ? (
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
        ) : null}

        {hideSidebar ? (
          <Logo size="header" className="dashboard-header__logo max-h-8" />
        ) : (
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-fg-muted">
            {pageTitle}
          </p>
        )}

        <div className="flex flex-1 items-center justify-end gap-0.5">
          <HeaderSearch />
          <NotificationBell segment={segment} />
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
