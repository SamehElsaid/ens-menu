"use client";

import { useLocale, useTranslations } from "next-intl";
import { FiArrowLeft, FiArrowRight, FiHelpCircle } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import FaqAccordion from "@/components/HomePage/FaqAccordion";
import { FAQ_CONFIG } from "@/modules/FAQ";

export default function FaqPageView() {
  const t = useTranslations("Landing.faq");
  const tLegal = useTranslations("legalPages");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const BackIcon = isRtl ? FiArrowRight : FiArrowLeft;

  return (
    <div className="relative min-h-screen bg-gradient-app">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/15"
          aria-hidden
        />
        <div
          className="absolute top-24 right-0 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl dark:bg-purple-400/10"
          aria-hidden
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 pb-16 pt-28 md:pt-32">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-bold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <BackIcon
            className="size-4 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
            aria-hidden
          />
          {tLegal("backToHome")}
        </Link>

        <div className="mx-auto mt-10 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[35px] border border-purple-200 bg-purple-100 text-purple-600 shadow-2xl shadow-purple-100 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:shadow-purple-900/50">
            <FiHelpCircle size={FAQ_CONFIG.iconSize} />
          </div>
          <h1 className="mb-4 text-4xl font-black text-slate-900 dark:text-white lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-base font-medium text-slate-500 dark:text-slate-400">
            {t("description")}
          </p>
        </div>

        <div className="mx-auto mt-12">
          <FaqAccordion />
        </div>
      </div>
    </div>
  );
}
