"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ProPlanPriceSelector, {
  type ProBillingChoice,
} from "@/components/Pricing/ProPlanPriceSelector";
import {
  PRIMARY_MOBILE_ROW_IDS,
  type CellVal,
  type ComparisonRow,
  type PlanId,
} from "@/components/Pricing/pricingComparisonTypes";
import {
  HiCheck,
  HiChevronDown,
  HiOutlineChat,
  HiStar,
  HiX,
} from "react-icons/hi";

const WHATSAPP_URL = "https://wa.me/201500800050";

const MOBILE_PLAN_ORDER: PlanId[] = ["free", "pro", "custom"];

function renderMobileValue(
  value: CellVal,
  tYes: string,
  tNo: string,
): ReactNode {
  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
          value
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {value ? (
          <HiCheck className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <HiX className="h-4 w-4 shrink-0" aria-hidden />
        )}
        <span>{value ? tYes : tNo}</span>
      </span>
    );
  }

  return (
    <span className="max-w-[52%] text-end text-sm font-semibold leading-snug text-slate-800 dark:text-slate-100">
      {value}
    </span>
  );
}

type PlanCtaVariant = "free" | "pro" | "custom";

function MobilePlanCta({
  href,
  label,
  variant,
  external = false,
}: {
  href: string;
  label: string;
  variant: PlanCtaVariant;
  external?: boolean;
}) {
  const base =
    "mt-6 flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-bold transition active:scale-[0.98]";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500`}
      >
        <HiOutlineChat className="h-5 w-5 shrink-0" aria-hidden />
        {label}
      </a>
    );
  }

  if (variant === "pro") {
    return (
      <Link
        href={href}
        className={`${base} bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/25`}
      >
        <HiStar className="text-amber-200" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${base} border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/14`}
    >
      {label}
    </Link>
  );
}

function MobileFeatureList({
  rows,
  planId,
  tYes,
  tNo,
}: {
  rows: ComparisonRow[];
  planId: PlanId;
  tYes: string;
  tNo: string;
}) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800/70">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-start justify-between gap-4 py-3.5 text-start"
        >
          <span className="min-w-0 flex-1 text-[15px] leading-snug text-slate-600 dark:text-slate-400">
            {row.label}
          </span>
          {renderMobileValue(row[planId], tYes, tNo)}
        </li>
      ))}
    </ul>
  );
}

type PricingMobilePlanCardsProps = {
  rows: ComparisonRow[];
  proBillingChoice: ProBillingChoice;
  onBillingChange: (choice: ProBillingChoice) => void;
  proPriceMonthly: number;
  proPriceYearly: number;
  proFirstMonthlyPrice?: number;
  proFirstYearlyPrice?: number;
  isRTL: boolean;
  subscriptionUpgradeHref: string;
  freeHighlights: readonly string[];
};

export default function PricingMobilePlanCards({
  rows,
  proBillingChoice,
  onBillingChange,
  proPriceMonthly,
  proPriceYearly,
  proFirstMonthlyPrice,
  proFirstYearlyPrice,
  isRTL,
  subscriptionUpgradeHref,
  freeHighlights,
}: PricingMobilePlanCardsProps) {
  const t = useTranslations("PricingPage");
  const tLanding = useTranslations("Landing.pricing");
  const tProfile = useTranslations("personalProfile");
  const tYes = t("yes");
  const tNo = t("no");

  const [expanded, setExpanded] = useState<Record<PlanId, boolean>>({
    pro: false,
    free: false,
    custom: false,
  });

  const primaryRows = rows.filter((row) =>
    (PRIMARY_MOBILE_ROW_IDS as readonly string[]).includes(row.id),
  );
  const secondaryRows = rows.filter(
    (row) => !(PRIMARY_MOBILE_ROW_IDS as readonly string[]).includes(row.id),
  );

  const planMeta: Record<
    PlanId,
    {
      name: string;
      description: string;
      badges: string[];
      highlight: boolean;
      cta: { href: string; label: string; variant: PlanCtaVariant; external?: boolean };
    }
  > = {
    pro: {
      name: t("planProName"),
      description: t("staticProDescription"),
      badges: [tLanding("popular"), t("proStaffMobileAppBullet")],
      highlight: true,
      cta: {
        href: subscriptionUpgradeHref,
        label: t("ctaUpgrade"),
        variant: "pro",
      },
    },
    free: {
      name: tLanding("planFree"),
      description: t("staticFreeDescription"),
      badges: [...freeHighlights],
      highlight: false,
      cta: {
        href: "/auth/register",
        label: t("ctaRegister"),
        variant: "free",
      },
    },
    custom: {
      name: tLanding("planCustom"),
      description: tLanding("customDescription"),
      badges: [t("billingCustom")],
      highlight: false,
      cta: {
        href: WHATSAPP_URL,
        label: t("ctaContact"),
        variant: "custom",
        external: true,
      },
    },
  };

  return (
    <div className="pricing-mobile-plan-cards space-y-5 md:hidden">
      {MOBILE_PLAN_ORDER.map((planId) => {
        const meta = planMeta[planId];
        const isExpanded = expanded[planId];
        const cardClass =
          planId === "pro"
            ? "pricing-plan-card pricing-plan-card--pro border-violet-300/70 bg-gradient-to-b from-violet-50/90 via-white to-white shadow-xl shadow-violet-500/10 dark:border-violet-500/30 dark:from-violet-500/10 dark:via-slate-900/90 dark:to-slate-900/80"
            : planId === "free"
              ? "pricing-plan-card pricing-plan-card--free border-slate-200/90 bg-white dark:border-slate-700/70 dark:bg-slate-900/85"
              : "pricing-plan-card pricing-plan-card--custom border-slate-200/90 bg-white dark:border-slate-700/70 dark:bg-slate-900/85";

        return (
          <article
            key={planId}
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-7 ${cardClass} ${
              meta.highlight ? "ring-2 ring-violet-500/25" : ""
            }`}
          >
            {meta.highlight && (
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet-400/15 to-transparent dark:from-violet-500/10"
                aria-hidden
              />
            )}

            <div className="relative">
              <div className="mb-4 flex flex-wrap gap-2">
                {meta.badges.map((badge) => (
                  <span
                    key={badge}
                    className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${
                      planId === "pro" && badge === tLanding("popular")
                        ? "bg-linear-to-r from-violet-500 to-indigo-500 text-white shadow-sm"
                        : "border border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
                    }`}
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {meta.name}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
                {meta.description}
              </p>

              <div className="mt-5">
                {planId === "pro" && (
                  <ProPlanPriceSelector
                    billingChoice={proBillingChoice}
                    onBillingChange={onBillingChange}
                    priceMonthly={proPriceMonthly}
                    priceYearly={proPriceYearly}
                    firstMonthlyPrice={proFirstMonthlyPrice}
                    firstYearlyPrice={proFirstYearlyPrice}
                    isRTL={isRTL}
                    size="large"
                  />
                )}
                {planId === "free" && (
                  <p className="text-4xl font-black text-slate-900 dark:text-white">
                    {tProfile("freePrice")}
                  </p>
                )}
                {planId === "custom" && (
                  <p className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                    {tLanding("customPrice")}
                  </p>
                )}
              </div>

              <div className="mt-7">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {t("mobileKeyFeatures")}
                </p>
                <MobileFeatureList
                  rows={primaryRows}
                  planId={planId}
                  tYes={tYes}
                  tNo={tNo}
                />
              </div>

              {isExpanded && secondaryRows.length > 0 && (
                <div className="pricing-mobile-features-expand mt-1 border-t border-slate-100 pt-1 dark:border-slate-800/70">
                  <MobileFeatureList
                    rows={secondaryRows}
                    planId={planId}
                    tYes={tYes}
                    tNo={tNo}
                  />
                </div>
              )}

              {secondaryRows.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [planId]: !prev[planId],
                    }))
                  }
                  className="mt-4 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? t("mobileShowLess") : t("mobileShowMore")}
                  <HiChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
              )}

              <MobilePlanCta {...meta.cta} />
            </div>
          </article>
        );
      })}

      <p className="px-1 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-500">
        {t("staticFiguresNote")}
      </p>
    </div>
  );
}
