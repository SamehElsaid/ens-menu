"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { FiChevronDown, FiHelpCircle } from "react-icons/fi";
import { FAQItemProps } from "@/types/types";
import { FAQ_ITEMS_COUNT, FAQ_CONFIG } from "@/modules/FAQ";

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
  isOpen,
  onClick,
}) => {
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <div
      className={`border-b border-slate-100 dark:border-slate-800 overflow-hidden transition-colors ${
        isOpen ? "bg-purple-50/30 dark:bg-purple-500/10" : "bg-transparent"
      }`}
    >
      <button
        onClick={onClick}
        className={`w-full py-7 px-6 flex items-center ${
          isRTL ? "flex-row-reverse" : ""
        } justify-between gap-4 ${
          isRTL ? "text-right" : "text-left"
        } focus:outline-none group`}
      >
        <h4
          className={`text-[17px] font-bold transition-colors flex-1 ${
            isOpen
              ? "text-purple-700 dark:text-purple-400"
              : "text-slate-800 dark:text-slate-200"
          }`}
        >
          {question}
        </h4>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isOpen
                ? "bg-purple-600 dark:bg-purple-500 text-white rotate-180"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 group-hover:text-purple-600 dark:group-hover:text-purple-400"
            }`}
          >
            <FiChevronDown size={FAQ_CONFIG.chevronSize} />
          </div>
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-6 pb-8 ${
            isRTL ? "pr-16" : "pl-16"
          } text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium`}
        >
          {answer}
        </div>
      </div>
    </div>
  );
};

export const FAQ = () => {
  const t = useTranslations("Landing.faq");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = Array.from({ length: FAQ_ITEMS_COUNT }).map((_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <section className="py-24 bg-white dark:bg-[#0d1117] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-[100px] -translate-x-1/2"></div>
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div
          className={`text-center mb-16 ${
            isRTL ? "text-right md:text-center" : ""
          }`}
        >
          <div className="w-24 h-24 rounded-[35px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-100 dark:shadow-purple-900/50 border border-purple-200 dark:border-purple-500/30">
            <FiHelpCircle size={FAQ_CONFIG.iconSize} />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
            {t("description")}
          </p>
        </div>
        <div className="bg-white dark:bg-[#15203c] rounded-[50px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-100/30 dark:shadow-slate-900/50 overflow-hidden">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === idx}
              onClick={() => {
                setOpenIndex(openIndex === idx ? null : idx);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
