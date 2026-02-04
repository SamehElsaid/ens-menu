"use client";

import { useTranslations, useLocale } from "next-intl";
import { BsCheckCircle } from "react-icons/bs";

export const HowItWorks = () => {
  const t = useTranslations("Landing.howItWorks");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const steps = Array.from({ length: 3 }).map((_, i) => ({
    number: t(`steps.${i}.number`),
    title: t(`steps.${i}.title`),
    description: t(`steps.${i}.description`),
  }));

  return (
    <section
      id="how-it-works"
      className="py-24 bg-slate-50 dark:bg-[#15203c]/50"
    >
      <div className="container mx-auto px-6">
        <div
          className={`text-center mb-16 ${
            isRTL ? "text-right" : "text-left"
          } md:text-center`}
        >
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t("title")}{" "}
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">
            {t("description")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-10 bg-white dark:bg-[#15203c] rounded-[45px] shadow-xl border border-white dark:border-slate-800"
            >
              <span className="absolute top-6 left-10 text-7xl font-black text-slate-100/80 dark:text-slate-800/50">
                {step.number}
              </span>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 flex items-center justify-center text-white mb-6 shadow-xl">
                  <BsCheckCircle size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-medium">
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
