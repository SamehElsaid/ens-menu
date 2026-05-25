"use client";

import { useTranslations } from "next-intl";
import { BsCheckCircle } from "react-icons/bs";
import { HiOutlineSparkles } from "react-icons/hi2";
import {
  SectionBadge,
  sectionDescriptionClassName,
  sectionHeadingClassName,
  sectionHighlightClassName,
} from "@/components/HomePage/SectionBadge";

export const HowItWorks = () => {
  const t = useTranslations("Landing.howItWorks");

  const steps = Array.from({ length: 3 }).map((_, i) => ({
    title: t(`steps.${i}.title`),
    description: t(`steps.${i}.description`),
  }));

  return (
    <section
      id="how-it-works"
      className="py-16 bg-slate-50 dark:bg-[#15203c]/50"
    >
      <div className="container mx-auto px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <SectionBadge icon={<HiOutlineSparkles className="h-4 w-4" aria-hidden />}>
            {t("badge")}
          </SectionBadge>
          <h2 className={sectionHeadingClassName}>
            {t("title")}{" "}
            <span className={sectionHighlightClassName}>{t("subtitle")}</span>
          </h2>
          <p className={sectionDescriptionClassName}>{t("description")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-[45px] border border-white bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#15203c] sm:p-8 lg:p-10"
            >
              <div className="relative z-10">
                <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-xl dark:from-purple-500 dark:to-purple-600 sm:h-14 sm:w-14">
                    <BsCheckCircle className="h-[22px] w-[22px] sm:h-7 sm:w-7" aria-hidden />
                  </div>
                  <span
                    aria-hidden
                    className="select-none font-black tabular-nums leading-none text-4xl text-purple-300/90 sm:text-5xl lg:text-6xl dark:text-purple-400/50"
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-black text-slate-900 dark:text-white sm:mb-3 sm:text-lg lg:text-xl">
                  {step.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
