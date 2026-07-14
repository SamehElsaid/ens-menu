"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import UserDropDown from "../UserDropDown";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import Logo from "../Global/Logo";
import { homeLinks } from "@/modules/Header";
import LanguageToggle from "./LanguageTogle";
import DarkModeToggle from "./DarkModeToggle";
import { MarketingButtonLink } from "@/components/marketing";
import HeaderSearch from "./HeaderSearch";

const SCROLL_THRESHOLD = 16;
const NAVBAR_SCROLL_OFFSET = 72;

const navLinkClass =
  "px-2 py-1 text-[13px] font-medium text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300";

const authBtn = {
  compact:
    "inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
  ghost:
    "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300",
} as const;

function isHomePathname(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return normalized === "/" || normalized === "/en";
}

function isAuthPathname(pathname: string) {
  return /\/auth\//.test(pathname);
}

function scrollToHash(hash: string) {
  const element = document.querySelector(hash);
  if (!element) return;

  const top =
    element.getBoundingClientRect().top +
    window.pageYOffset -
    NAVBAR_SCROLL_OFFSET;

  window.scrollTo({ top, behavior: "smooth" });
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

function NavLink({
  href,
  children,
  onClick,
  className = navLinkClass,
}: NavLinkProps) {
  return (
    <Link href={href} prefetch={false} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { name: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={`${navLinkClass} flex items-center gap-1`}
      >
        {label}
        <FiChevronDown
          size={13}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+6px)] z-20 min-w-[170px] overflow-hidden rounded-xl border border-slate-100/80 bg-white py-1 shadow-lg ring-1 ring-slate-900/5 dark:border-slate-800 dark:bg-[#0d1117] ltr:left-0 rtl:right-0">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="block px-4 py-2.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-400 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
              ? "max-w-44 text-[9px]"
              : "max-w-52 text-[10px] sm:text-[11px]"
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
        <HeaderSearch />
        <DarkModeToggle />
        <LanguageToggle locale={locale} pathname={pathname} />
        <UserDropDown />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <MarketingButtonLink
        href="/auth/register"
        variant="compact"
        prefetch={false}
      >
        {tHeader("startNow")}
      </MarketingButtonLink>
      <MarketingButtonLink href="/auth/login" variant="ghost" prefetch={false}>
        {tHeader("signIn")}
      </MarketingButtonLink>
      <HeaderSearch />
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
  const isLoggedIn = useAppSelector((state) => state.auth.loading === "yes");

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeMobileNav = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleInPageNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    closeMobileNav();
    if (!href.startsWith("/#") || !isHomePathname(pathname)) return;
    e.preventDefault();
    scrollToHash(href.slice(1));
  };

  const navItems = homeLinks.map((link) => ({
    name: t(link.title),
    href: link.href,
    children: link.children?.map((child) => ({
      name: t(child.title),
      href: child.href,
    })),
  }));

  const isAuthRoute = isAuthPathname(pathname);
  const headerPadding = isAuthRoute ? "py-1.5" : "py-2";

  const navShell = isScrolled
    ? `border-b border-slate-100/90 bg-white/95 ${headerPadding} shadow-[0_1px_0_rgba(124,58,237,0.05)] backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0d1117]/95`
    : `border-b border-transparent bg-white/80 ${headerPadding} backdrop-blur-sm dark:bg-[#0d1117]/80`;

  const mobileNavLinkClass =
    "rounded-lg px-3 py-3 text-start text-[14px] font-medium text-slate-700 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-300 dark:hover:bg-purple-500/10 dark:hover:text-purple-300";

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-all duration-300 ${navShell} ${isAuthRoute ? "site-header--auth" : ""}`}
    >
      <div className="container relative">
        <div className="site-header__mobile-row flex min-h-10 items-center justify-between gap-2 py-0.5 lg:hidden">
          <BrandBlock aiBadge={tHeader("aiBadge")} logoSize="header" />
          <div className="flex shrink-0 items-center gap-1.5">
            {!isLoggedIn && !isAuthRoute && (
              <>
                <Link
                  href="/auth/register"
                  prefetch={false}
                  className={`${authBtn.compact} shrink-0 px-3.5 text-[11px]`}
                >
                  {tHeader("startNow")}
                </Link>
                <Link
                  href="/auth/login"
                  prefetch={false}
                  className={`${authBtn.ghost} shrink-0 px-3.5 text-[11px]`}
                >
                  {tHeader("signIn")}
                </Link>
              </>
            )}
            {isLoggedIn && <UserDropDown />}
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setIsOpen((open) => !open)}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        <div className="relative hidden h-12 items-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="col-start-1 flex items-center justify-self-start text-start">
            <BrandBlock aiBadge={tHeader("aiBadge")} />
          </div>

          <nav
            aria-label="Main"
            className="col-start-2 flex items-center justify-center gap-6 xl:gap-8"
          >
            {navItems.map((item) =>
              item.children ? (
                <NavDropdown
                  key={item.name}
                  label={item.name}
                  items={item.children}
                />
              ) : (
                <NavLink
                  key={item.name}
                  href={item.href!}
                  onClick={(e) => handleInPageNav(e, item.href!)}
                >
                  {item.name}
                </NavLink>
              ),
            )}
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

      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 dark:border-slate-800 dark:bg-[#0d1117] lg:hidden">
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) =>
              item.children ? (
                item.children.map((child) => (
                  <NavLink
                    key={child.href}
                    href={child.href}
                    onClick={(e) => handleInPageNav(e, child.href)}
                    className={mobileNavLinkClass}
                  >
                    {child.name}
                  </NavLink>
                ))
              ) : (
                <NavLink
                  key={item.name}
                  href={item.href!}
                  onClick={(e) => handleInPageNav(e, item.href!)}
                  className={mobileNavLinkClass}
                >
                  {item.name}
                </NavLink>
              ),
            )}
          </nav>

          {!isLoggedIn && (
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Link
                href="/auth/login"
                prefetch={false}
                onClick={closeMobileNav}
                className="flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:border-purple-200 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300"
              >
                {tHeader("signIn")}
              </Link>
              <Link
                href="/auth/register"
                prefetch={false}
                onClick={closeMobileNav}
                className="flex w-full items-center justify-center rounded-full bg-purple-600 px-4 py-2.5 text-[13px] font-medium text-white"
              >
                {tHeader("startNow")}
              </Link>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <HeaderSearch />
            <DarkModeToggle />
            <LanguageToggle locale={locale} pathname={pathname} />
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
