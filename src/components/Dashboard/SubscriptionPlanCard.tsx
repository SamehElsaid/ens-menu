"use client";

import { useState, type ReactNode } from "react";
import {
  HiArrowDown,
  HiArrowUp,
  HiCheck,
  HiChevronDown,
  HiOutlineChat,
  HiOutlineGift,
  HiOutlineSparkles,
  HiOutlineTag,
} from "react-icons/hi";
import { useTranslations } from "next-intl";
import ProPlanPriceSelector, {
  type ProBillingChoice,
} from "@/components/Pricing/ProPlanPriceSelector";
import { formatEgpPrice } from "@/lib/subscriptionPayment";
import type { Plan } from "@/types/Plan";

type SubscriptionPlanCardProps = {
  plan: Plan;
  planDisplayName: string;
  features: string[];
  isRTL: boolean;
  isCurrentPlan: boolean;
  isMostPopular: boolean;
  isProPlan: boolean;
  isFreePlan: boolean;
  showProBilling: boolean;
  proBillingChoice: ProBillingChoice;
  onProBillingChange: (choice: ProBillingChoice) => void;
  canUpgrade: boolean;
  canDowngrade: boolean;
  proPayLoading: boolean;
  downgradeLoading: boolean;
  onUpgrade: () => void;
  onDowngrade: () => void;
  upgradeLabel: string;
  downgradeLabel: string;
  payingLabel: string;
  downgradingLabel: string;
  currentPlanLabel: string;
  mostPopularLabel: string;
  freePriceLabel: string;
  contactForDetailsLabel: string;
  contactWhatsAppLabel: string;
  currencyEgp: string;
  monthlyPriceFormatted: (price: string) => string;
  yearlyPriceFormatted: (price: string) => string;
  voucherDiscountedPrice?: number | null;
  voucherDiscountAmount?: number | null;
  voucherDurationHint?: string | null;
  /** When Pro is current plan — show one price line matching active subscription */
  activeBillingCycle?: "monthly" | "yearly" | null;
  className?: string;
  children?: ReactNode;
};

const INITIAL_VISIBLE_FEATURES = 6;

function PlanFeatureList({
  features,
  isRTL,
}: {
  features: string[];
  isRTL: boolean;
}) {
  return (
    <ul className="space-y-2.5">
      {features.map((f, i) => (
        <li
          key={`${f}-${i}`}
          className={`flex gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-snug ${
            isRTL ? "flex-row-reverse text-right" : ""
          }`}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 dark:bg-emerald-500/20">
            <HiCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

function CollapsiblePlanFeatureList({
  features,
  isRTL,
  initialVisibleCount = INITIAL_VISIBLE_FEATURES,
}: {
  features: string[];
  isRTL: boolean;
  initialVisibleCount?: number;
}) {
  const t = useTranslations("PricingPage");
  const [expanded, setExpanded] = useState(false);
  const hasMore = features.length > initialVisibleCount;
  const visibleFeatures = expanded
    ? features
    : features.slice(0, initialVisibleCount);

  return (
    <div className="flex-1 min-h-0">
      <PlanFeatureList features={visibleFeatures} isRTL={isRTL} />
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`mt-4 flex w-full min-h-[40px] items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
          aria-expanded={expanded}
        >
          {expanded ? t("mobileShowLess") : t("mobileShowMore")}
          <HiChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

export default function SubscriptionPlanCard({
  plan,
  planDisplayName,
  features,
  isRTL,
  isCurrentPlan,
  isMostPopular,
  isProPlan,
  isFreePlan,
  showProBilling,
  proBillingChoice,
  onProBillingChange,
  canUpgrade,
  canDowngrade,
  proPayLoading,
  downgradeLoading,
  onUpgrade,
  onDowngrade,
  upgradeLabel,
  downgradeLabel,
  payingLabel,
  downgradingLabel,
  currentPlanLabel,
  mostPopularLabel,
  freePriceLabel,
  contactForDetailsLabel,
  contactWhatsAppLabel,
  currencyEgp,
  monthlyPriceFormatted,
  yearlyPriceFormatted,
  voucherDiscountedPrice,
  voucherDiscountAmount,
  voucherDurationHint,
  activeBillingCycle,
  className = "",
  children,
}: SubscriptionPlanCardProps) {
  const voucherOriginalPrice =
    voucherDiscountedPrice != null &&
    voucherDiscountAmount != null &&
    voucherDiscountAmount > 0
      ? voucherDiscountedPrice + voucherDiscountAmount
      : null;

  const resolvedActiveBilling: "monthly" | "yearly" =
    activeBillingCycle === "yearly" ? "yearly" : "monthly";

  return (
    <article
      className={[
        "group relative flex h-full flex-col rounded-[28px] p-6 md:p-7 transition-all duration-300",
        isProPlan && !isCurrentPlan
          ? "border-2 border-primary/50 dark:border-primary/60 bg-gradient-to-b from-primary/[0.06] to-white dark:from-primary/10 dark:to-slate-900 shadow-xl shadow-primary/10 md:-translate-y-1 md:scale-[1.02] z-[1]"
          : isCurrentPlan
            ? "border-2 border-primary bg-gradient-to-br from-primary/8 via-white to-white dark:from-primary/15 dark:via-slate-900 dark:to-slate-900 shadow-lg shadow-primary/15 ring-1 ring-primary/20"
            : "border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-900/80 shadow-md shadow-slate-200/40 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg",
        className,
      ].join(" ")}
    >
      {isMostPopular && !isCurrentPlan && (
        <div className="absolute -top-3 inset-x-0 flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-md shadow-primary/30">
            <HiOutlineSparkles className="h-3.5 w-3.5" />
            {mostPopularLabel}
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div
          className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} pointer-events-none`}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 dark:bg-primary/25 px-2.5 py-1 text-[11px] font-semibold text-primary dark:text-primary-foreground">
            <HiOutlineTag className="h-3.5 w-3.5" />
            {currentPlanLabel}
          </span>
        </div>
      )}

      <header
        className={`mb-5 ${isRTL ? "text-right" : "text-left"} ${isCurrentPlan ? "pe-20" : ""}`}
      >
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${
            isProPlan
              ? "bg-primary/15 text-primary"
              : isFreePlan
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          } ${isRTL ? "ms-auto" : ""}`}
        >
          {isProPlan ? (
            <HiOutlineSparkles className="h-6 w-6" />
          ) : isFreePlan ? (
            <HiOutlineGift className="h-6 w-6" />
          ) : (
            <span className="text-lg font-black">★</span>
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {planDisplayName}
        </h3>
        {plan.description ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {plan.description}
          </p>
        ) : null}
      </header>

      <div className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        {isFreePlan && plan.priceMonthly === 0 ? (
          <span className="text-4xl font-black text-slate-900 dark:text-white">
            {freePriceLabel}
          </span>
        ) : showProBilling && isProPlan ? (
          <ProPlanPriceSelector
            billingChoice={proBillingChoice}
            onBillingChange={onProBillingChange}
            priceMonthly={plan.priceMonthly}
            priceYearly={plan.priceYearly}
            firstMonthlyPrice={plan.firstMonthlyPrice}
            firstYearlyPrice={plan.firstYearlyPrice}
            isRTL={isRTL}
            size="large"
            voucherOriginalPrice={voucherOriginalPrice}
            voucherDiscountedPrice={voucherDiscountedPrice}
          />
        ) : isProPlan ? (
          <div className="space-y-1">
            {resolvedActiveBilling === "monthly" && plan.priceMonthly > 0 ? (
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {monthlyPriceFormatted(
                  formatEgpPrice(plan.firstMonthlyPrice ?? plan.priceMonthly),
                )}
              </p>
            ) : plan.priceYearly > 0 ? (
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                {yearlyPriceFormatted(
                  formatEgpPrice(plan.firstYearlyPrice ?? plan.priceYearly),
                )}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {contactForDetailsLabel}
          </p>
        )}
      </div>

      <div className="mb-5 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

      <CollapsiblePlanFeatureList features={features} isRTL={isRTL} />

      <div className="mt-6 flex flex-col gap-2 pt-2">
        {isCurrentPlan && (
          <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary dark:text-primary-foreground">
            <HiCheck className="h-4 w-4" />
            {currentPlanLabel}
          </span>
        )}
        {canUpgrade && (
          <>
            {voucherDurationHint && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                {voucherDurationHint}
              </p>
            )}
            <button
              type="button"
              onClick={onUpgrade}
              disabled={proPayLoading || Boolean(voucherDurationHint)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HiArrowUp className="h-4 w-4 shrink-0" />
              {proPayLoading ? payingLabel : upgradeLabel}
            </button>
          </>
        )}
        {canDowngrade && (
          <button
            type="button"
            onClick={onDowngrade}
            disabled={downgradeLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HiArrowDown className="h-4 w-4 shrink-0" />
            {downgradeLoading ? downgradingLabel : downgradeLabel}
          </button>
        )}
        {children}
      </div>
    </article>
  );
}

export function SubscriptionPlanCardSkeleton() {
  return (
    <div
      className="flex h-full min-h-[420px] flex-col rounded-[28px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 md:p-7 animate-pulse"
      aria-hidden
    >
      <div className="mb-5 h-11 w-11 rounded-2xl bg-slate-200 dark:bg-slate-700" />
      <div className="mb-2 h-6 w-2/5 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mb-6 h-4 w-3/5 rounded bg-slate-100 dark:bg-slate-800" />
      <div className="mb-6 h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
      <div className="mb-5 h-px bg-slate-100 dark:bg-slate-800" />
      <div className="flex-1 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 rounded bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
      <div className="mt-6 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function CustomSubscriptionPlanCard({
  isRTL,
  isCurrentCustomPlan,
  planCustomLabel,
  contactForDetailsLabel,
  customPriceLabel,
  contactWhatsAppLabel,
  currentPlanLabel,
  customPlanFeatures,
  planDescription,
  whatsappUrl,
  className = "",
}: {
  isRTL: boolean;
  isCurrentCustomPlan: boolean;
  planCustomLabel: string;
  contactForDetailsLabel: string;
  customPriceLabel: string;
  contactWhatsAppLabel: string;
  currentPlanLabel: string;
  customPlanFeatures: string[];
  planDescription?: string;
  whatsappUrl: string;
  className?: string;
}) {
  return (
    <article
      className={[
        "relative flex h-full flex-col rounded-[28px] border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-900/80 p-6 md:p-7 shadow-md transition-all duration-300 hover:border-emerald-300/60 hover:shadow-lg dark:hover:border-emerald-700/50",
        isCurrentCustomPlan &&
          "border-2 border-primary ring-1 ring-primary/20 shadow-lg shadow-primary/10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isCurrentCustomPlan && (
        <div
          className={`absolute top-4 ${isRTL ? "left-4" : "right-4"}`}
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
            {currentPlanLabel}
          </span>
        </div>
      )}

      <header className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ${
            isRTL ? "ms-auto" : ""
          }`}
        >
          <HiOutlineChat className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          {planCustomLabel}
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {planDescription ?? contactForDetailsLabel}
        </p>
      </header>

      <div className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        <span className="text-2xl font-black text-slate-900 dark:text-white">
          {customPriceLabel}
        </span>
      </div>

      <div className="mb-5 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

      <CollapsiblePlanFeatureList features={customPlanFeatures} isRTL={isRTL} />

      <div className="mt-6 pt-2">
        {isCurrentCustomPlan ? (
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            <HiCheck className="h-4 w-4" />
            {currentPlanLabel}
          </span>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-all hover:bg-emerald-600 hover:shadow-lg active:scale-[0.98]"
          >
            <HiOutlineChat className="h-5 w-5" />
            {contactWhatsAppLabel}
          </a>
        )}
      </div>
    </article>
  );
}
