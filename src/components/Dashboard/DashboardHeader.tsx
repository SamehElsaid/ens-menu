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
    <header className="dashboard-header sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur sm:px-8 sm:py-4 dark:border-purple-900/80 dark:bg-[#0d1117]/90">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          {showSidebarToggle && (
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
              className="flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-secondary hover:text-primary lg:hidden dark:border-purple-900 dark:bg-[#0d1117]/70 dark:text-slate-300"
              aria-label={tCommon("openMenu")}
            >
              <FiMenu className="text-lg" />
            </button>
          )}
          <LanguageToggle locale={locale} pathname={pathname} />
        </div>

        <div className="flex shrink-0 items-center justify-center">
          <Logo
            pageTitle={!isAdmin ? pageTitle : undefined}
            size="header"
            className="dashboard-header__logo max-h-[42px] sm:hidden"
          />
          <Logo
            pageTitle={!isAdmin ? pageTitle : undefined}
            className="dashboard-header__logo hidden sm:flex"
          />
        </div>

        <div className="flex items-center justify-end gap-1">
          <HeaderSearch />
          <NotificationBell segment={segment} />
          <DarkModeToggle />
          <UserDropDown />
        </div>
      </div>
    </header>
  );
}
