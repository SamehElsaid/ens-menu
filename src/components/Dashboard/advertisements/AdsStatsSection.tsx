"use client";

import { useTranslations } from "next-intl";
import { SectionHeader, StatCard, StatGrid } from "@/components/ui";

/** Retained for call-site compatibility; metrics no longer carry a tint. */
type MetricTone = "sky" | "amber" | "emerald";

export type AdSummaryMetric = {
  id: string;
  label: string;
  value: string;
  tone: MetricTone;
};

interface AdsStatsSectionProps {
  items: AdSummaryMetric[];
  dir: "rtl" | "ltr";
}

/**
 * Campaign totals.
 *
 * Three differently-tinted tiles made impressions, clicks and CTR look like
 * three unrelated facts. Edge-sharing metrics read as one instrument panel, and
 * with the tint gone the figures are the only thing carrying weight.
 */
export default function AdsStatsSection({ items, dir }: AdsStatsSectionProps) {
  const t = useTranslations("Advertisements.page");

  return (
    <section className="dashboard-ads-stats flex flex-col gap-2.5" dir={dir}>
      <SectionHeader title={t("metricsTitle")} />
      <StatGrid columns={3} ruled>
        {items.map((item) => (
          <StatCard
            key={item.id}
            label={item.label}
            value={<span lang="en">{item.value}</span>}
          />
        ))}
      </StatGrid>
    </section>
  );
}
