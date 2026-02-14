"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import UserDropDown from "../UserDropDown";
import { FiMenu, FiX } from "react-icons/fi";
import Logo from "../Global/Logo";
import { homeLinks } from "@/modules/Header";
import LanguageToggle from "./LanguageTogle";
import DarkModeToggle from "./DarkModeToggle";

// NavLink Component
interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.FC<{ size?: number; className?: string }>;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  icon: Icon,
  onClick,
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="relative group text-slate-600 dark:text-slate-300 text-[14px] font-bold transition-colors duration-300 py-1 flex items-center gap-1.5 cursor-pointer"
  >
    <Icon
      size={16}
      className="text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
    />
    <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
      {children}
    </span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full rounded-full shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
  </Link>
);

function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("");
  const profile = useAppSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => setIsOpen(false);

  const navLinks = homeLinks.map((link) => ({
    name: t(link.title),
    href: `/${locale}${link.href === "/" ? "" : link.href}`,
    icon: link.icon,
  }));

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "backdrop-blur-xl bg-white/70 dark:bg-[#0d1117]/70 py-3 shadow-sm border-b border-purple-100 dark:border-purple-900"
          : "bg-transparent py-6 border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          onClick={handleNavClick}
          className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white"
        >
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-10 lg:gap-5 xl:gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              href={link.href}
              icon={link.icon}
              onClick={handleNavClick}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center ms-auto lg:ms-0 gap-1 lg:gap-2 xl:gap-4">
          {/* Language Toggle */}
          <LanguageToggle locale={locale} pathname={pathname} />

          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* Auth Buttons */}
          {profile.loading === "yes" ? (
            <UserDropDown />
          ) : (
            <>
              {/* Sign In Button */}
              <Link
                href={`/${locale}/auth/login`}
                className="px-5 hidden lg:block py-2 rounded-full font-bold text-[14px] text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/20 transition-all"
              >
                {locale === "ar" ? "دخول" : "Sign In"}
              </Link>

              {/* Sign Up Button */}
              <div className="hidden lg:block">
                <Link
                  href={`/${locale}/auth/register`}
                  className="px-7 py-2.5 rounded-full bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white font-bold text-[14px] shadow-lg shadow-purple-200 dark:shadow-purple-900/50 transition-all hover:shadow-xl"
                >
                  {locale === "ar" ? "ابدأ الآن" : "Start Now"}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex items-center justify-center text-slate-900 dark:text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 backdrop-blur-xl bg-white/90 dark:bg-[#0d1117]/90 shadow-2xl p-8 lg:hidden flex flex-col gap-3 text-center border-t border-purple-50 dark:border-purple-900">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={handleNavClick}
              className="py-4 text-lg font-bold text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-4 cursor-pointer"
            >
              <link.icon size={22} className="text-purple-500" />
              {link.name}
            </Link>
          ))}

          {profile.loading !== "yes" && (
            <div className="pt-4 flex flex-col gap-3">
              <Link
                href={`/${locale}/auth/login`}
                onClick={handleNavClick}
                className="block w-full py-3 rounded-2xl border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 font-bold text-base hover:bg-purple-50 dark:hover:bg-purple-500/20 transition-all"
              >
                {locale === "ar" ? "دخول" : "Sign In"}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                onClick={handleNavClick}
                className="block w-full py-4 rounded-2xl bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white font-bold text-base"
              >
                {locale === "ar" ? "ابدأ الآن" : "Start Now"}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Header;
