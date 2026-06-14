"use client";

import { useEffect, useState } from "react";
import SafeLink from "@/components/Global/SafeLink";
import { CLOSE_NAV_OVERLAYS_EVENT } from "@/lib/safeNavigation";
import { usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import UserDropDown from "../UserDropDown";
import { FiMenu, FiX } from "react-icons/fi";
import Logo from "../Global/Logo";
import { homeLinks } from "@/modules/Header";
import LanguageToggle from "./LanguageTogle";
import DarkModeToggle from "./DarkModeToggle";
import { MarketingButtonLink } from "@/components/marketing";
import { ds } from "@/lib/designSystem";

function isHomePathname(pathname: string) {
  const p = pathname.replace(/\/$/, "") || "/";
  return p === "/" || p === "/en" || p === "/ar";
}

function isAuthPathname(pathname: string) {
  return /\/auth\//.test(pathname);
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLink = ({ href, children, onClick }: NavLinkProps) => (
  <SafeLink
    href={href}
    prefetch={false}
    onClick={onClick}
    className={`px-2 py-1 ${ds.link.nav}`}
  >
    {children}
  </SafeLink>
);

function BrandBlock({
  aiBadge,
  showBadge = true,
  logoSize = "compact",
}: {
  aiBadge: string;
  showBadge?: boolean;
  logoSize?: "compact" | "header";
}) {
  const isMobileLogo = logoSize === "header";

  return (
    <div className="site-header__brand flex min-w-0 flex-col items-start gap-0.5 text-start">
      <Logo
        size={logoSize}
        className={isMobileLogo ? "site-header__logo shrink-0" : undefined}
      />
      {showBadge && (
        <p
          className={`brand-tagline-shimmer mt-0.5 font-medium leading-snug tracking-wide ${
            isMobileLogo
              ? "max-w-[11rem] text-[9px]"
              : "max-w-[13rem] text-[10px] sm:text-[11px]"
          }`}
        >
          {aiBadge}
        </p>
      )}
    </div>
  );
}

function HeaderActions({
  locale,
  pathname,
  isLoggedIn,
  tHeader,
}: {
  locale: string;
  pathname: string;
  isLoggedIn: boolean;
  tHeader: ReturnType<typeof useTranslations>;
}) {
  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-1">
        <DarkModeToggle />
        <LanguageToggle locale={locale} pathname={pathname} />
        <UserDropDown />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <MarketingButtonLink href="/auth/register" variant="compact" prefetch={false}>
        {tHeader("startNow")}
      </MarketingButtonLink>
      <MarketingButtonLink href="/auth/login" variant="ghost" prefetch={false}>
        {tHeader("signIn")}
      </MarketingButtonLink>
      <DarkModeToggle />
      <LanguageToggle locale={locale} pathname={pathname} />
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("");
  const tHeader = useTranslations("Landing.header");
  const profile = useAppSelector((state) => state.auth);
  const isLoggedIn = profile.loading === "yes";

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const closeMobileNav = () => setIsOpen(false);
    window.addEventListener(CLOSE_NAV_OVERLAYS_EVENT, closeMobileNav);
    return () =>
      window.removeEventListener(CLOSE_NAV_OVERLAYS_EVENT, closeMobileNav);
  }, []);

  const handleNavClick = () => setIsOpen(false);

  const scrollToHash = (hash: string) => {
    const element = document.querySelector(hash);
    if (element) {
      const offset =
        element.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  const handleInPageNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    handleNavClick();
    if (!href.startsWith("/#")) return;
    if (!isHomePathname(pathname)) return;
    e.preventDefault();
    scrollToHash(href.slice(1));
  };

  const navLinks = homeLinks.map((link) => ({
    name: t(link.title),
    href: link.href,
  }));

  const isAuthRoute = isAuthPathname(pathname);

  const headerPadding = isAuthRoute ? "py-1.5" : "py-2";

  const navShell = isScrolled
    ? `border-b border-slate-100/90 bg-white/95 ${headerPadding} shadow-[0_1px_0_rgba(124,58,237,0.05)] backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0d1117]/95`
    : `border-b border-transparent bg-white/80 ${headerPadding} backdrop-blur-sm dark:bg-[#0d1117]/80`;

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navShell} ${isAuthRoute ? "site-header--auth" : ""}`}
    >
      <div className="container relative">
        {/* Mobile: brand at inline-start, actions at inline-end (follows html[dir]) */}
        <div className="site-header__mobile-row flex min-h-10 items-center justify-between gap-2 py-0.5 lg:hidden">
          <BrandBlock aiBadge={tHeader("aiBadge")} logoSize="header" />
          <div className="flex shrink-0 items-center gap-1.5">
            {!isLoggedIn && !isAuthRoute && (
              <MarketingButtonLink
                href="/auth/register"
                variant="compact"
                prefetch={false}
                className="shrink-0 px-3.5 text-[11px]"
              >
                {tHeader("startNow")}
              </MarketingButtonLink>
            )}
            {isLoggedIn && <UserDropDown />}
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/*
          Desktop grid follows html[dir]:
          brand → inline-start column | nav → center | actions → inline-end column
        */}
        <div className="relative hidden h-12 items-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="col-start-1 flex items-center justify-self-start text-start">
            <BrandBlock aiBadge={tHeader("aiBadge")} />
          </div>

          <nav
            aria-label="Main"
            className="col-start-2 flex items-center justify-center gap-6 xl:gap-8"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                href={link.href}
                onClick={(e) => handleInPageNav(e, link.href)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="col-start-3 flex items-center justify-self-end text-end">
            <HeaderActions
              locale={locale}
              pathname={pathname}
              isLoggedIn={isLoggedIn}
              tHeader={tHeader}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 dark:border-slate-800 dark:bg-[#0d1117] lg:hidden">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <SafeLink
                key={link.name}
                href={link.href}
                prefetch={false}
                onClick={(e) => handleInPageNav(e, link.href)}
                onSameRoute={handleNavClick}
                className="rounded-lg px-3 py-3 text-start text-[14px] font-medium text-slate-700 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              >
                {link.name}
              </SafeLink>
            ))}
          </nav>

          {!isLoggedIn && (
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <SafeLink
                href="/auth/login"
                prefetch={false}
                onClick={handleNavClick}
                onSameRoute={handleNavClick}
                className="flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-purple-200 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300"
              >
                {tHeader("signIn")}
              </SafeLink>
              <SafeLink
                href="/auth/register"
                prefetch={false}
                onClick={handleNavClick}
                onSameRoute={handleNavClick}
                className="flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-[13px] font-medium text-white"
              >
                {tHeader("startNow")}
              </SafeLink>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <DarkModeToggle />
            <LanguageToggle locale={locale} pathname={pathname} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
