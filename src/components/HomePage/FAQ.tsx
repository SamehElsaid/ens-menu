"use client";

import { useTranslations, useLocale } from "next-intl";
import { FiHelpCircle } from "react-icons/fi";
import FaqAccordion from "@/components/HomePage/FaqAccordion";
import { FAQ_CONFIG } from "@/modules/FAQ";

const FAQ = () => {
  const t = useTranslations("Landing.faq");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-white py-24 dark:bg-[#0d1117]"
    >
      <div className="absolute top-1/2 left-0 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-50 blur-[100px] dark:bg-purple-900/20"></div>
      <div className="container relative z-10 mx-auto max-w-4xl px-6">
        <div
          className={`mb-16 text-center ${
            isRTL ? "text-right md:text-center" : ""
          }`}
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[35px] border border-purple-200 bg-purple-100 text-purple-600 shadow-2xl shadow-purple-100 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:shadow-purple-900/50">
            <FiHelpCircle size={FAQ_CONFIG.iconSize} />
          </div>
          <h2 className="mb-4 text-4xl font-black text-slate-900 dark:text-white lg:text-5xl">
            {t("title")}
          </h2>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">
            {t("description")}
          </p>
        </div>
        <FaqAccordion />
      </div>
    </section>
  );
};

export default FAQ;
