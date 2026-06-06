"use client";

import { useTranslations } from "next-intl";

export type ProBillingChoice = "monthly" | "yearly";

type ProPlanPriceSelectorProps = {
  billingChoice: ProBillingChoice;
  onBillingChange: (choice: ProBillingChoice) => void;
  priceMonthly: number;
  priceYearly: number;
  firstMonthlyPrice?: number;
  firstYearlyPrice?: number;
  isRTL?: boolean;
  /** Larger price typography for landing cards */
  size?: "default" | "large";
  /** Compact layout for comparison table header */
  compact?: boolean;
  className?: string;
  voucherOriginalPrice?: number | null;
  voucherDiscountedPrice?: number | null;
};

export function formatEgpPrice(value: number): string {
  return value.toLocaleString("en-US");
}

export default function ProPlanPriceSelector({
  billingChoice,
  onBillingChange,
  priceMonthly,
  priceYearly,
  firstMonthlyPrice,
  firstYearlyPrice,
  isRTL = false,
  size = "default",
  compact = false,
  className = "",
  voucherOriginalPrice,
  voucherDiscountedPrice,
}: ProPlanPriceSelectorProps) {
  const tProfile = useTranslations("personalProfile");
  const tLanding = useTranslations("Landing.pricing");

  const monthlyDisplay = firstMonthlyPrice ?? priceMonthly;
  const yearlyDisplay = firstYearlyPrice ?? priceYearly;
  const baseDisplay =
    billingChoice === "monthly" ? monthlyDisplay : yearlyDisplay;
  const hasVoucherDiscount =
    voucherDiscountedPrice != null &&
    voucherOriginalPrice != null &&
    voucherDiscountedPrice < voucherOriginalPrice;
  const showFirstMonthOffer =
    !hasVoucherDiscount &&
    billingChoice === "monthly" &&
    firstMonthlyPrice != null &&
    firstMonthlyPrice > 0 &&
    firstMonthlyPrice < priceMonthly;
  const showFirstYearOffer =
    !hasVoucherDiscount &&
    billingChoice === "yearly" &&
    firstYearlyPrice != null &&
    firstYearlyPrice > 0 &&
    firstYearlyPrice < priceYearly;

  const priceClass = compact
    ? "text-xl sm:text-2xl font-black text-violet-800 dark:text-violet-100"
    : size === "large"
      ? "text-3xl font-black text-slate-900 dark:text-white"
      : "text-2xl sm:text-3xl font-black text-slate-900 dark:text-white";

  return (
    <div className={`space-y-2 ${className}`}>
      {!compact && (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tProfile("selectBillingCycle")}
        </p>
      )}
      <div
        className={`inline-flex w-full rounded-xl border border-slate-200 dark:border-slate-600 p-1 bg-white dark:bg-slate-900 ${
          isRTL ? "flex-row-reverse" : ""
        } ${compact ? "max-w-[11rem] mx-auto" : ""}`}
        role="group"
        aria-label={tProfile("selectBillingCycle")}
      >
        {(["monthly", "yearly"] as const).map((cycle) => (
          <button
            key={cycle}
            type="button"
            onClick={() => onBillingChange(cycle)}
            className={`flex-1 rounded-lg font-semibold transition-colors ${
              compact ? "px-2 py-1 text-[10px] sm:text-xs" : "px-3 py-2 text-sm"
            } ${
              billingChoice === cycle
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {cycle === "monthly" ? tProfile("monthly") : tProfile("yearly")}
          </button>
        ))}
      </div>
      <div className={compact ? "text-center" : undefined}>
        {hasVoucherDiscount ? (
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={priceClass}>
                {formatEgpPrice(voucherDiscountedPrice!)}
              </span>
              <span
                className={`text-slate-500 dark:text-slate-400 ms-1 ${
                  compact ? "text-[10px] sm:text-xs" : "text-sm"
                }`}
              >
                {tLanding("currencyEgp")}
                {billingChoice === "monthly"
                  ? tLanding("perMonth")
                  : tLanding("perYear")}
              </span>
            </div>
            <p
              className={`text-slate-500 dark:text-slate-400 line-through ${
                compact ? "text-[10px] sm:text-xs" : "text-sm"
              }`}
            >
              {formatEgpPrice(voucherOriginalPrice!)}{" "}
              {tLanding("currencyEgp")}
              {billingChoice === "monthly"
                ? tLanding("perMonth")
                : tLanding("perYear")}
            </p>
          </div>
        ) : (
          <>
            <span className={priceClass}>
              {formatEgpPrice(baseDisplay)}
            </span>
            <span
              className={`text-slate-500 dark:text-slate-400 ms-1 ${
                compact ? "text-[10px] sm:text-xs" : "text-sm"
              }`}
            >
              {tLanding("currencyEgp")}
              {billingChoice === "monthly"
                ? tLanding("perMonth")
                : tLanding("perYear")}
            </span>
          </>
        )}
      </div>
      {showFirstMonthOffer && (
        <p
          className={`text-slate-500 dark:text-slate-400 line-through ${
            compact ? "text-[10px] sm:text-xs text-center" : "text-sm"
          }`}
        >
          {tProfile("monthlyPriceBeforeDiscount", {
            price: formatEgpPrice(priceMonthly),
            currency: tLanding("currencyEgp"),
          })}
        </p>
      )}
      {showFirstMonthOffer && (
        <p
          className={`font-semibold text-primary dark:text-purple-300 ${
            compact
              ? "text-[10px] sm:text-xs text-center leading-snug"
              : "text-sm"
          }`}
        >
          {tProfile("proFirstMonthlyOffer", {
            price: formatEgpPrice(priceMonthly),
            currency: tLanding("currencyEgp"),
          })}
        </p>
      )}
      {showFirstYearOffer && (
        <p
          className={`text-slate-500 dark:text-slate-400 line-through ${
            compact ? "text-[10px] sm:text-xs text-center" : "text-sm"
          }`}
        >
          {tProfile("yearlyPriceBeforeDiscount", {
            price: formatEgpPrice(priceYearly),
            currency: tLanding("currencyEgp"),
          })}
        </p>
      )}
      {showFirstYearOffer && (
        <p
          className={`font-semibold text-primary dark:text-purple-300 ${
            compact
              ? "text-[10px] sm:text-xs text-center leading-snug"
              : "text-sm"
          }`}
        >
          {tProfile("proFirstYearlyOffer")}
        </p>
      )}
    </div>
  );
}
