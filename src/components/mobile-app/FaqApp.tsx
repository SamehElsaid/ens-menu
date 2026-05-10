"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";

type FaqItem = { q: string; a: string };

const FaqApp = () => {
  const t = useTranslations("Landing.FaqApp");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const items = t.raw("items") as FaqItem[];
  const [open, setOpen] = useState<number | null>(0);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-24 dark:bg-[#0d1117]">
      <div className="absolute top-1/2 left-0 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-50 blur-[100px] dark:bg-purple-900/20" />

      <div className="container relative z-10 mx-auto max-w-4xl px-6">
        <div className={`mb-16 text-center ${isRTL ? "text-right md:text-center" : ""}`}>
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[35px] border border-purple-200 bg-purple-100 text-purple-600 shadow-2xl shadow-purple-100 dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400 dark:shadow-purple-900/50">
            <FiHelpCircle size={28} />
          </div>

          <h2 className="mb-4 text-4xl font-black text-slate-900 dark:text-white lg:text-5xl">
            {t("title")}
          </h2>
          <p className="text-base font-medium text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="overflow-hidden rounded-[50px] border border-slate-100 bg-white shadow-2xl shadow-slate-100/30 dark:border-slate-800 dark:bg-[#15203c] dark:shadow-slate-900/50">
          {items.map((item: FaqItem, i: number) => {
            const isOpen = open === i;
            const answerId = `mobile-app-faq-answer-${i}`;

            return (
              <div
                key={i}
                className={`overflow-hidden border-b border-slate-100 transition-colors dark:border-slate-800 ${
                  isOpen ? "bg-purple-50/30 dark:bg-purple-500/10" : "bg-transparent"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className={`group flex w-full items-center justify-between gap-4 px-6 py-7 focus:outline-none ${
                    isRTL ? "flex-row-reverse text-right" : "text-left"
                  }`}
                >
                  <h4
                    className={`flex-1 text-[17px] font-bold transition-colors ${
                      isOpen
                        ? "text-purple-700 dark:text-purple-400"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {item.q}
                  </h4>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                        isOpen
                          ? "rotate-180 bg-purple-600 text-white dark:bg-purple-500"
                          : "bg-slate-100 text-slate-400 group-hover:bg-purple-100 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-purple-500/20 dark:group-hover:text-purple-400"
                      }`}
                    >
                      <FiChevronDown size={20} />
                    </div>
                  </div>
                </button>

                <div
                  id={answerId}
                  className={`transition-all duration-500 ease-in-out ${
                    isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div
                    className={`px-6 pb-8 text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400 ${
                      isRTL ? "pr-16" : "pl-16"
                    }`}
                  >
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqApp;