"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FiChevronDown } from "react-icons/fi";
import {
  MarketingHeading,
  MarketingSection,
  MarketingText,
} from "@/components/marketing";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type FaqItem = { q: string; a: string };

export default function FaqApp() {
  const t = useTranslations("Landing.FaqApp");

  const items = t.raw("items") as FaqItem[];
  const [open, setOpen] = useState<number | null>(0);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <MarketingSection variant="default">
      <div className="container max-w-3xl">
        <div className="mb-10 text-center sm:mb-12">
          <MarketingHeading as="h2" level="section" className="mb-3">
            {t("title")}
          </MarketingHeading>
          <MarketingText
            variant="subtitle"
            className="mx-auto max-w-lg text-center"
          >
            {t("subtitle")}
          </MarketingText>
        </div>

        <div
          className={cn(
            ds.card.base,
            ds.card.shadow,
            "overflow-hidden divide-y divide-slate-100 dark:divide-slate-800",
          )}
        >
          {items.map((item, i) => {
            const isOpen = open === i;
            const answerId = `mobile-app-faq-answer-${i}`;

            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start focus:outline-none sm:px-6"
                >
                  <h3
                    className={cn(
                      "flex-1 text-[15px] font-semibold transition-colors",
                      isOpen
                        ? "text-purple-700 dark:text-purple-300"
                        : "text-slate-800 dark:text-slate-200",
                    )}
                  >
                    {item.q}
                  </h3>

                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full transition-all",
                      isOpen
                        ? "rotate-180 bg-purple-600 text-white dark:bg-purple-500"
                        : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
                    )}
                  >
                    <FiChevronDown size={18} />
                  </span>
                </button>

                <div
                  id={answerId}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 sm:px-6 dark:text-slate-400">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MarketingSection>
  );
}
