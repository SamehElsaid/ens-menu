"use client";

import { useTranslations } from "next-intl";
import ForwardArrow from "@/components/Global/ForwardArrow";
import {
  MarketingButtonLink,
  MarketingButtonRow,
} from "@/components/marketing";
import ExperienceScene from "../ExperienceScene";
import ExperienceStrip from "../ExperienceStrip";

export default function RevealScene() {
  const t = useTranslations("experienceHome");

  return (
    <ExperienceScene
      index={5}
      height="compact"
      className="justify-between bg-[#faf8f5] dark:bg-[#0a0a0c]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgb(124_58_237/0.08),transparent)]"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-purple-600/70 dark:text-purple-400/80">
          ENSmenu
        </p>
        <h2 className="mb-4 max-w-lg text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("revealLine1")}
        </h2>
        <p className="mb-10 max-w-md text-base text-slate-500 sm:text-lg dark:text-slate-400">
          {t("revealLine2")}
        </p>
        <MarketingButtonRow>
          <MarketingButtonLink href="/auth/register" prefetch={false}>
            {t("cta")}
            <ForwardArrow />
          </MarketingButtonLink>
          <MarketingButtonLink
            href="/Pricing"
            variant="secondary"
            prefetch={false}
          >
            {t("ctaSecondary")}
          </MarketingButtonLink>
        </MarketingButtonRow>
      </div>

      <ExperienceStrip />
    </ExperienceScene>
  );
}
