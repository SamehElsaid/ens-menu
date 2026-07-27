"use client";

import { useTranslations } from "next-intl";
import { FiBell, FiShoppingCart, FiCoffee, FiBarChart2 } from "react-icons/fi";
import {
  MarketingHeading,
  MarketingSection,
  MarketingText,
} from "@/components/marketing";
import { cn } from "@/lib/cn";

const icons = [FiBell, FiShoppingCart, FiCoffee, FiBarChart2] as const;

type WorkflowStep = { title: string; desc: string };

export default function WorkflowApp() {
  const t = useTranslations("Landing.WorkflowApp");

  const stepsRaw = t.raw("steps");
  const steps: WorkflowStep[] = Array.isArray(stepsRaw)
    ? (stepsRaw as WorkflowStep[])
    : [];

  if (steps.length === 0) return null;

  return (
    <MarketingSection variant="muted">
      <div className="container max-w-6xl">
        <div className="mb-12 text-center sm:mb-16">
          <MarketingHeading as="h2" level="section" className="mb-3">
            {t("title")}
          </MarketingHeading>
          <MarketingText
            variant="subtitle"
            className="mx-auto max-w-xl text-center"
          >
            {t("subtitle")}
          </MarketingText>
        </div>

        <div className="relative grid gap-8 md:grid-cols-4">
          <div
            className="absolute top-8 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent md:block dark:via-purple-500/30"
            aria-hidden
          />

          {steps.map((step, i) => {
            const Icon = icons[i];

            return (
              <div
                key={i}
                className="relative flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "relative z-10 flex size-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-sm shadow-purple-600/20 dark:bg-purple-500 dark:shadow-purple-500/10",
                  )}
                >
                  <Icon size={20} />
                </div>

                <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </MarketingSection>
  );
}
