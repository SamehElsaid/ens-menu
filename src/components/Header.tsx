"use client";
import { useState } from "react";
import LinkTo from "@/components/Global/LinkTo";
import { homeLinks } from "@/modules/Header";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import Drawer from "./Global/Drawer";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

import UserDropDown from "./UserDropDown";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profile = useAppSelector((state) => state.auth);
  const locale = useLocale();
  const t = useTranslations("");

  const handleNavClick = () => setIsMenuOpen(false);

  const renderLinks = () => (
    <ul className="flex flex-col gap-5 text-base font-medium text-slate-600 lg:flex-row lg:items-center lg:gap-6">
      {homeLinks.map((link) => (
        <li key={link.href}>
          <LinkTo
            href={link.href}
            onClick={handleNavClick}
            className="transition hover:text-secondary"
          >
            {t(link.title as keyof typeof t)}
          </LinkTo>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="container flex w-full items-center justify-between py-3">
          <LinkTo
            href="/"
            onClick={() => {
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 text-xl font-semibold text-slate-900"
          >
            <span className="relative flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span>NATQI</span>
            </span>
          </LinkTo>

          <nav className="hidden lg:block">{renderLinks()}</nav>

          <div className="hidden items-center gap-1 lg:flex">
            <LanguageSwitcher />
            {profile.loading === "yes" ? (
              <UserDropDown />
            ) : (
              <>
                <LinkTo href="/auth/login">
                  <button className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-secondary hover:text-secondary">
                    Log in
                  </button>
                </LinkTo>
                <LinkTo href="/auth/register">
                  <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                    Get started
                  </button>
                </LinkTo>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={isMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200"
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute inset-x-0 top-0 h-0.5 bg-slate-800 transition ${
                    isMenuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-slate-800 transition ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-slate-800 transition ${
                    isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </span>
            </button>
            <LanguageSwitcher />
            {profile.loading === "yes" && <UserDropDown />}
          </div>
        </div>
      </header>
      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Parent"
        right={locale === "ar" ? true : false}
      >
        <ul className="flex flex-col  ">
          {homeLinks.map((link, index) => (
            <li key={link.title}>
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                }}
                key={link.title}
                href={link.href}
                className={` font-medium block ${
                  homeLinks.length - 1 === index
                    ? ""
                    : "border-b border-primary/20"
                }  hover:text-secondary duration-200 py-2 px-4`}
              >
                {t(link.title as keyof typeof t)}
              </Link>
            </li>
          ))}
        </ul>
        {profile.loading !== "yes" && (
          <div className="absolute bg-gray-50 bottom-0 left-0 flex justify-between px-4 w-full py-4 items-center bg-background  main-shadow">
            <div className="w-full gap-2 flex items-center justify-end">
              <>
                <LinkTo href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-secondary hover:text-secondary">
                    Log in
                  </button>
                </LinkTo>
                <LinkTo href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                  <button className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                    Get started
                  </button>
                </LinkTo>
              </>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}

export default Header;
