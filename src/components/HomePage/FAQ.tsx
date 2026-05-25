"use client";

import { useTranslations } from "next-intl";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import FaqAccordion from "@/components/HomePage/FaqAccordion";
import {
  SectionBadge,
  sectionDescriptionClassName,
  sectionHeadingClassName,
} from "@/components/HomePage/SectionBadge";

const FAQ = () => {
  const t = useTranslations("Landing.faq");

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-slate-50/30 py-10 dark:bg-[#070a0f] border-t border-slate-100 dark:border-slate-900/60"
    >
      <div className="pointer-events-none absolute -top-24 start-0 h-72 w-72 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/5" />
      <div className="pointer-events-none absolute bottom-0 end-0 h-80 w-80 rounded-full bg-fuchsia-200/10 blur-3xl dark:bg-fuchsia-900/5" />

      <div className="container relative z-10 mx-auto max-w-4xl px-6">
        
        <div className="mb-10 flex flex-col items-center text-center">
          
          <SectionBadge
            icon={<HiOutlineQuestionMarkCircle className="h-4 w-4" aria-hidden />}
          >
            {t("badge")}
          </SectionBadge>

          <h2 className={sectionHeadingClassName}>{t("title")}</h2>

          <p className={sectionDescriptionClassName}>{t("description")}</p>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white/60 p-2 shadow-xl shadow-slate-200/40 backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#111827]/40 dark:shadow-black/20 sm:p-4">
          <FaqAccordion />
        </div>

      </div>
    </section>
  );
};

export default FAQ;