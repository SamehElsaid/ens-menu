"use client";

import { useLocale, useTranslations } from "next-intl";
import { HiOutlineCreditCard, HiOutlineArrowRight } from "react-icons/hi2";
import { HiLightningBolt } from "react-icons/hi";
import { Link } from "@/i18n/navigation";
import {
  SectionBadge,
  sectionDescriptionClassName,
  sectionHeadingClassName,
} from "@/components/HomePage/SectionBadge";
import PricingPlanCards from "./PricingPlanCards";
import { usePricingPlanCards } from "./usePricingPlanCards";

export default function PricingPlanCardsSection() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Landing.pricing");
  const { cards, popularLabel } = usePricingPlanCards();

  return (
    <section
      id="pricing"
      className="pricing-page relative overflow-x-clip bg-[#f8f9fc] py-14 dark:bg-[#070a0f] sm:py-16 lg:py-20"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Premium & Subtle Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-24 start-1/4 h-80 w-80 rounded-full bg-violet-400/10 blur-[100px] dark:bg-violet-600/5" />
        <div className="absolute top-1/3 end-1/4 h-80 w-80 rounded-full bg-indigo-300/10 blur-[100px] dark:bg-indigo-900/5" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <header className="mx-auto mb-16 max-w-2xl text-center">
          <div className="flex justify-center">
            <SectionBadge
              icon={<HiOutlineCreditCard className="h-4 w-4" aria-hidden />}
            >
              {t("badge")}
            </SectionBadge>
          </div>

          <h2 className={sectionHeadingClassName}>{t("title")}</h2>

          <p className={sectionDescriptionClassName}>{t("description")}</p>
          
          {/* Annual Notice Badge */}
         {/*  <p className="mx-auto mt-4 inline-flex max-w-lg items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900 dark:border-violet-500/20 dark:bg-violet-950/40 dark:text-violet-200">
            <HiLightningBolt className="h-3.5 w-3.5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
            {t("proAnnualOnly")}
          </p> */}
        </header>

        {/* Pricing Cards Grid */}
        <PricingPlanCards cards={cards} popularLabel={popularLabel} />

        {/* Bottom CTA — Compare Plans */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/Pricing"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-xs transition duration-200 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:text-violet-200"
          >
            {t("comparePlansCta")}
            <HiOutlineArrowRight
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:text-current ${
                isRTL 
                  ? "rotate-180 group-hover:-translate-x-0.5" 
                  : "group-hover:translate-x-0.5"
              }`}
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}