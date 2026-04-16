"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FiChevronDown } from "react-icons/fi";
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
      className={`overflow-hidden border-b border-slate-100 transition-colors dark:border-slate-800 ${
        isOpen ? "bg-purple-50/30 dark:bg-purple-500/10" : "bg-transparent"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center justify-between gap-4 px-6 py-7 ${
          isRTL ? "flex-row-reverse" : ""
        } ${isRTL ? "text-right" : "text-left"} group focus:outline-none`}
      >
        <h4
          className={`flex-1 text-[17px] font-bold transition-colors ${
            isOpen
              ? "text-purple-700 dark:text-purple-400"
              : "text-slate-800 dark:text-slate-200"
          }`}
        >
          {question}
        </h4>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
              isOpen
                ? "rotate-180 bg-purple-600 text-white dark:bg-purple-500"
                : "bg-slate-100 text-slate-400 group-hover:bg-purple-100 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-purple-500/20 dark:group-hover:text-purple-400"
            }`}
          >
            <FiChevronDown size={FAQ_CONFIG.chevronSize} />
          </div>
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-6 pb-8 text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400 ${
            isRTL ? "pr-16" : "pl-16"
          }`}
        >
          {answer}
        </div>
      </div>
    </div>
  );
};

export default function FaqAccordion() {
  const t = useTranslations("Landing.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = Array.from({ length: FAQ_ITEMS_COUNT }).map((_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  return (
    <div className="overflow-hidden rounded-[50px] border border-slate-100 bg-white shadow-2xl shadow-slate-100/30 dark:border-slate-800 dark:bg-[#15203c] dark:shadow-slate-900/50">
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
  );
}
