"use client";

import { useTranslations } from "next-intl";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import HeroBackground from "@/components/HomePage/HeroBackground";
import {
  MarketingAccent,
  MarketingBadge,
  MarketingHeading,
  MarketingPill,
  MarketingPillRow,
  MarketingSection,
  MarketingSplit,
  MarketingSplitContent,
  MarketingSplitVisual,
  MarketingText,
} from "@/components/marketing";
import { ds } from "@/lib/designSystem";
import { STAFF_GOOGLE_PLAY_URL } from "@/components/mobile-app/staffPlayStore";

const APP_VIDEO_SRC = "/app/order.mp4";

const FEATURE_KEYS = ["liveAlerts", "tables", "staffOnly"] as const;

export default function HeroApp() {
  const t = useTranslations("Landing.Hero");

  return (
    <MarketingSection
      id="staff-app-hero"
      variant="hero"
      className="relative overflow-visible! pb-10! sm:pb-12! lg:pb-14!"
    >
      <HeroBackground />

      <div className="container relative z-10">
        <MarketingSplit className="gap-8 sm:gap-10 lg:gap-14">
          <MarketingSplitContent>
            <MarketingBadge className="mb-6">{t("badge")}</MarketingBadge>

            <MarketingHeading as="h1" level="display" className="mb-5">
              {t("titleStart")}
              <MarketingAccent>{t("titleHighlight")}</MarketingAccent>
            </MarketingHeading>

            <MarketingText variant="subtitle" className="mb-8">
              {t("description")}
            </MarketingText>

            <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <a
                href={STAFF_GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-[180px] items-center gap-3 rounded-xl border border-white/10 bg-black px-5 py-3 text-white shadow-lg transition-all hover:scale-[1.03] hover:brightness-110 active:scale-95"
              >
                <FaGooglePlay size={26} className="shrink-0" />
                <span className="text-start leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide opacity-75">
                    {t("getItOn")}
                  </span>
                  <span className="block text-[17px] font-bold tracking-tight">
                    Google Play
                  </span>
                </span>
              </a>

              <div className="relative inline-flex min-w-[180px] cursor-not-allowed select-none items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-white/40">
                <FaApple size={28} className="shrink-0" />
                <span className="text-start leading-tight">
                  <span className="block text-[10px] font-medium tracking-wide opacity-75">
                    {t("downloadOnThe")}
                  </span>
                  <span className="block text-[17px] font-bold tracking-tight">
                    App Store
                  </span>
                </span>
                <span className="absolute -top-2.5 -end-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-900 uppercase shadow">
                  {t("appleComingSoon")}
                </span>
              </div>
            </div>

            <MarketingText variant="caption" className="mb-6">
              {t("safeInstall")}
            </MarketingText>

            <MarketingPillRow>
              {FEATURE_KEYS.map((key) => (
                <MarketingPill key={key}>{t(`features.${key}`)}</MarketingPill>
              ))}
            </MarketingPillRow>
          </MarketingSplitContent>

          <MarketingSplitVisual className="mx-auto w-full max-w-[min(100%,280px)] sm:max-w-[300px] lg:mx-0 lg:w-[min(100%,320px)] lg:min-w-[280px] lg:max-w-[320px] lg:shrink-0 lg:py-4">
            <div className="relative mx-auto w-full">
              <div className={ds.glow} aria-hidden />
              <div className="relative aspect-9/19 overflow-hidden rounded-[2.5rem] border-10 border-slate-900 bg-slate-950 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] ring-2 ring-slate-700/30 dark:border-slate-800">
                <div className="absolute top-3 left-1/2 z-20 flex h-6 w-24 -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-slate-800 bg-slate-900">
                  <div className="size-1.5 rounded-full bg-slate-800" />
                  <div className="h-1 w-8 rounded-full bg-slate-800 opacity-40" />
                </div>
                <video
                  src={APP_VIDEO_SRC}
                  className="size-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={t("videoAlt")}
                />
              </div>
            </div>
          </MarketingSplitVisual>
        </MarketingSplit>
      </div>
    </MarketingSection>
  );
}
