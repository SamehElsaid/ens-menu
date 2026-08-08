"use client";

import { useTranslations } from "next-intl";

type MetricTone = "sky" | "amber" | "emerald";

export type AdSummaryMetric = {
  id: string;
  label: string;
  value: string;
  tone: MetricTone;
};

const toneClasses: Record<MetricTone, string> = {
  sky: "border-sky-200/80 bg-sky-50/90 dark:border-sky-800/50 dark:bg-sky-950/30",
  amber:
    "border-amber-200/80 bg-amber-50/90 dark:border-amber-800/50 dark:bg-amber-950/30",
  emerald:
    "border-emerald-200/80 bg-emerald-50/90 dark:border-emerald-800/50 dark:bg-emerald-950/30",
};

interface AdsStatsSectionProps {
  items: AdSummaryMetric[];
  dir: "rtl" | "ltr";
}

export default function AdsStatsSection({ items, dir }: AdsStatsSectionProps) {
  const t = useTranslations("Advertisements.page");

  return (
    <section
      className="dashboard-ads-stats mb-4 rounded-lg border border-line bg-white p-3 shadow-sm md:mb-6 md:p-5"
      dir={dir}
    >
      <h2 className="mb-2 text-sm font-semibold text-fg md:mb-3 md:text-base">
        {t("metricsTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-lg border px-3 py-2.5 md:px-4 md:py-3 ${toneClasses[item.tone]} ${
              index === 2 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <p className="mb-0.5 text-[10px] font-medium text-fg-subtle md:text-xs dark:text-fg-subtle">
              {item.label}
            </p>
            <p className="text-lg font-bold tabular-nums text-fg md:text-2xl">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
