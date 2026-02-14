import { FiBell, FiMenu } from "react-icons/fi";
import { IoChatbubblesOutline } from "react-icons/io5";
import UserDropDown from "../UserDropDown";
import LinkTo from "../Global/LinkTo";
import { Logo } from "../Global/Logo";
import LanguageToggle from "../Global/LanguageTogle";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import DarkModeToggle from "../Global/DarkModeToggle";

export function DashboardHeader({
  setIsMenuOpen,
  segment,
}: {
  setIsMenuOpen: (isMenuOpen: boolean | ((prev: boolean) => boolean)) => void;
  segment: string | null;
}) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-8 dark:bg-[#0d1117]/70 dark:border-purple-900">
      <div className="flex  items-center gap-1 justify-between">
        <div className="flex items-center gap-1">
          {segment && (
            <button
              onClick={() => setIsMenuOpen((prev: boolean) => !prev)}
              className="rounded-full flex items-center justify-center w-10 h-10 border border-slate-200 dark:border-purple-900 bg-white dark:bg-[#0d1117]/70  text-slate-500 dark:text-slate-300 transition hover:text-primary hover:border-secondary lg:hidden"
            >
              <FiMenu className="text-lg" />
            </button>
          )}
          {/* <LinkTo href="/chat" className="rounded-full flex items-center justify-center w-10 h-10 border border-slate-200 bg-white  text-slate-500 transition hover:text-primary hover:border-secondary">
            <IoChatbubblesOutline className="text-lg" />
          </LinkTo> */}
          <LanguageToggle locale={locale} pathname={pathname} />
        </div>
        <div className="flex items-center gap-1">
          {/* <LinkTo href="/" className=" text-lg font-bold text-primary">Logo</LinkTo> */}
          <Logo />
        </div>
        <div className="flex items-center gap-1 ">
          <DarkModeToggle />

          {/* <button className="rounded-full flex items-center justify-center w-10 h-10 border border-slate-200 bg-white  text-slate-500 transition hover:text-primary hover:border-secondary">
            <FiBell className="text-lg" />
          </button> */}

          <UserDropDown />
        </div>
      </div>
    </header>
  );
}
