"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Global/Logo";
import PoweredByEnsEg from "@/components/Global/PoweredByEnsEg";
import LegalNavLink from "@/components/Legal/LegalNavLink";
import { getSocialLinks } from "@/modules/Footer";

export default function HomeMinimalFooter() {
  const t = useTranslations("Landing.footer");
  const currentYear = new Date().getFullYear();

  const socialLinks = useMemo(
    () =>
      getSocialLinks().filter((s) =>
        ["Instagram", "Facebook", "TikTok", "Youtube"].includes(s.name),
      ),
    [],
  );

  const links = [
    { name: t("linkAbout"), path: "/about" as const },
    { name: t("linkContact"), path: "/contact" as const },
    { name: t("privacy"), path: "/privacy-policy" as const },
    { name: t("terms"), path: "/terms-and-conditions" as const },
  ];

  return (
    <footer className="home-minimal-footer">
      <div className="home-section-shell py-4 sm:py-7">
        <div className="flex flex-col items-center gap-2.5 border-b border-white/[0.04] pb-3.5 sm:gap-3 sm:pb-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8 sm:gap-y-2">
          <nav
            aria-label={t("quickLinks")}
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 sm:gap-x-5 sm:gap-y-1"
          >
            {links.map((link) => (
              <LegalNavLink key={link.path} href={link.path}>
                {link.name}
              </LegalNavLink>
            ))}
          </nav>

          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {socialLinks.map((social, index) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`home-minimal-footer__social-link flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-purple-300 sm:h-8 sm:w-8 ${index >= 2 ? "hidden sm:flex" : ""}`}
              >
                <social.icon className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
              </a>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-md flex-col items-center text-center sm:mt-6">
          <div className="home-minimal-footer__brand">
            <Logo size="compact" variant="white" />
          </div>

          <div className="home-minimal-footer__powered mt-4 hidden w-full sm:mt-5 sm:block">
            <PoweredByEnsEg />
          </div>

          <p className="mt-2 text-[10px] text-slate-500 sm:mt-5 sm:text-[11px]">
            © {currentYear} ENSMENU · {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
