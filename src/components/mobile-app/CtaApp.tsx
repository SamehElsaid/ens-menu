"use client";

import { useTranslations } from "next-intl";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import {
  MarketingHeading,
  MarketingSection,
  MarketingText,
} from "@/components/marketing";
import { STAFF_GOOGLE_PLAY_URL } from "@/components/mobile-app/staffPlayStore";

export default function CtaApp() {
  const t = useTranslations("Landing.MobileAppCta");

  return (
    <MarketingSection variant="muted" className="py-16 sm:py-20 lg:py-24">
      <div className="container relative z-10 text-center">
        <MarketingHeading as="h2" level="section" className="mb-3">
          {t("title")}
        </MarketingHeading>
        <MarketingText
          variant="subtitle"
          className="mx-auto mb-6 max-w-md text-center"
        >
          {t("subtitle")}
        </MarketingText>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
            <span
              className="size-1.5 shrink-0 rounded-full bg-emerald-500"
              aria-hidden
            />
            <span dir="ltr" className="font-semibold tracking-tight">
              Android
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden>
              ·
            </span>
            <span>{t("androidStatus")}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-4 py-2 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/30 dark:text-slate-400">
            <span
              className="size-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600"
              aria-hidden
            />
            <span dir="ltr" className="font-semibold tracking-tight">
              iOS
            </span>
            <span className="text-slate-300 dark:text-slate-600" aria-hidden>
              ·
            </span>
            <span>{t("iosStatus")}</span>
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={STAFF_GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[210px] items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-900 px-8 py-4 text-white shadow-xl transition-all hover:scale-[1.03] hover:bg-slate-800 active:scale-95 dark:border-slate-700 dark:bg-black"
          >
            <FaGooglePlay size={26} className="shrink-0 text-emerald-400" />
            <span className="border-s border-white/15 ps-4 text-start leading-tight">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
                {t("getItOn")}
              </span>
              <span className="block text-base font-bold tracking-tight">
                {t("googlePlay")}
              </span>
            </span>
          </a>

          <div className="relative inline-flex min-w-[210px] cursor-not-allowed select-none items-center gap-4 rounded-2xl border border-slate-200/60 bg-slate-100/80 px-8 py-4 text-slate-400 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-500">
            <FaApple size={28} className="shrink-0 opacity-50" />
            <span className="border-s border-slate-300/60 ps-4 text-start leading-tight dark:border-slate-600/60">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">
                {t("downloadOnThe")}
              </span>
              <span className="block text-base font-bold tracking-tight">
                App Store
              </span>
            </span>
            <span className="absolute -top-2.5 -end-2 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-amber-900 uppercase shadow-md">
              {t("appleComingSoon")}
            </span>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
