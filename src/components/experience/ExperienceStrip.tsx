"use client";

import { useTranslations } from "next-intl";
import LegalNavLink from "@/components/Legal/LegalNavLink";

export default function ExperienceStrip() {
  const t = useTranslations("experienceHome");
  const year = new Date().getFullYear();

  return (
    <footer className="experience-strip border-t border-slate-200/60 bg-white/80 px-5 py-3 text-center backdrop-blur-sm dark:border-slate-800/60 dark:bg-[#0d1117]/90">
      <div className="container flex flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row sm:text-start dark:text-slate-500">
        <p>© {year} ENSmenu</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 sm:justify-end">
          <LegalNavLink href="/contact" variant="light" className="text-[11px] sm:text-[11px]">
            {t("stripContact")}
          </LegalNavLink>
          <LegalNavLink
            href="/privacy-policy"
            variant="light"
            className="text-[11px] sm:text-[11px]"
          >
            {t("stripPrivacy")}
          </LegalNavLink>
          <LegalNavLink
            href="/terms-and-conditions"
            variant="light"
            className="text-[11px] sm:text-[11px]"
          >
            {t("stripTerms")}
          </LegalNavLink>
        </div>
      </div>
    </footer>
  );
}
