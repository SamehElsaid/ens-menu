"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { focusRingInset } from "@/components/ui";

export type ProBillingChoice = "monthly" | "yearly";

type ProPlanPriceSelectorProps = {
  billingChoice: ProBillingChoice;
  onBillingChange: (choice: ProBillingChoice) => void;
  priceMonthly: number;
  priceYearly: number;
  firstMonthlyPrice?: number;
  firstYearlyPrice?: number;
  /** Kept for the call sites that still pass it; direction is handled by
   *  logical properties, so the component no longer branches on it. */
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

/**
 * Billing cycle and the price it produces, inside the dashboard's plan cards.
 *
 * The toggle was a violet→indigo gradient pill on a ringed glow, which made the
 * control louder than the number it was there to change. It is now an
 * edge-sharing segmented control: one rounded box, two halves divided by a
 * single rule, and the chosen half filled in purple — the accent's job in this
 * system is exactly "this is the one that is selected" (DESIGN.md §3).
 *
 * Prices are set in the figure face, so the monthly and yearly
 * amounts occupy the same width and a reader comparing them is not also
 * comparing digit positions.
 */
export default function ProPlanPriceSelector({
  billingChoice,
  onBillingChange,
  priceMonthly,
  priceYearly,
  firstMonthlyPrice,
  firstYearlyPrice,
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

  const priceClass = cn(
    "ui-figure text-fg",
    compact
      ? "text-xl sm:text-2xl"
      : size === "large"
        ? "text-3xl"
        : "text-2xl sm:text-3xl",
  );
  const suffixClass = cn(
    "ms-1 text-fg-muted",
    compact ? "text-[10px] sm:text-xs" : "text-sm",
  );
  const strikeClass = cn(
    "text-fg-subtle line-through",
    compact ? "text-center text-[10px] sm:text-xs" : "text-sm",
  );
  const offerClass = cn(
    "font-medium text-accent",
    compact ? "text-center text-[10px] leading-snug sm:text-xs" : "text-sm",
  );
  const periodLabel =
    billingChoice === "monthly" ? tLanding("perMonth") : tLanding("perYear");

  return (
    <div className={`space-y-2 ${className}`}>
      {!compact && <p className="ui-label">{tProfile("selectBillingCycle")}</p>}

      <div
        role="radiogroup"
        aria-label={tProfile("selectBillingCycle")}
        className={cn(
          "inline-flex w-full overflow-hidden rounded-lg border border-line-control",
          compact && "mx-auto max-w-44",
        )}
      >
        {(["monthly", "yearly"] as const).map((cycle, index) => {
          const selected = billingChoice === cycle;
          return (
            <button
              key={cycle}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onBillingChange(cycle)}
              className={cn(
                "flex-1 font-medium row-settle",
                focusRingInset,
                index > 0 && "border-s border-line-strong",
                compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-[13px]",
                selected
                  ? "bg-accent text-on-accent"
                  : "bg-surface text-fg-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              {cycle === "monthly" ? tProfile("monthly") : tProfile("yearly")}
            </button>
          );
        })}
      </div>

      <div className={compact ? "text-center" : undefined}>
        {hasVoucherDiscount ? (
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className={priceClass} lang="en">
                {formatEgpPrice(voucherDiscountedPrice!)}
              </span>
              <span className={suffixClass}>
                {tLanding("currencyEgp")}
                {periodLabel}
              </span>
            </div>
            <p className={strikeClass}>
              {formatEgpPrice(voucherOriginalPrice!)} {tLanding("currencyEgp")}
              {periodLabel}
            </p>
          </div>
        ) : (
          <>
            <span className={priceClass} lang="en">
              {formatEgpPrice(baseDisplay)}
            </span>
            <span className={suffixClass}>
              {tLanding("currencyEgp")}
              {periodLabel}
            </span>
          </>
        )}
      </div>

      {showFirstMonthOffer && (
        <>
          <p className={strikeClass}>
            {tProfile("monthlyPriceBeforeDiscount", {
              price: formatEgpPrice(priceMonthly),
              currency: tLanding("currencyEgp"),
            })}
          </p>
          <p className={offerClass}>
            {tProfile("proFirstMonthlyOffer", {
              price: formatEgpPrice(priceMonthly),
              currency: tLanding("currencyEgp"),
            })}
          </p>
        </>
      )}

      {showFirstYearOffer && (
        <>
          <p className={strikeClass}>
            {tProfile("yearlyPriceBeforeDiscount", {
              price: formatEgpPrice(priceYearly),
              currency: tLanding("currencyEgp"),
            })}
          </p>
          <p className={offerClass}>{tProfile("proFirstYearlyOffer")}</p>
        </>
      )}
    </div>
  );
}
