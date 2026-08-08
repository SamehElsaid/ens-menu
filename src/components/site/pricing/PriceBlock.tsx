"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export type BillingCycle = "monthly" | "yearly";

export function formatEgpPrice(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Billing switch for the public pricing page.
 *
 * Separate from `Pricing/ProPlanPriceSelector` on purpose: that one also renders
 * inside the dashboard's subscription panel, at the product's compact size, and
 * must not inherit marketing typography.
 */
export function BillingSwitch({
  value,
  onChange,
  className,
}: {
  value: BillingCycle;
  onChange: (next: BillingCycle) => void;
  className?: string;
}) {
  const tProfile = useTranslations("personalProfile");

  return (
    <div
      role="group"
      aria-label={tProfile("selectBillingCycle")}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-site-line bg-site-bg p-1 shadow-site-sm",
        className,
      )}
    >
      {(["monthly", "yearly"] as const).map((cycle) => (
        <button
          key={cycle}
          type="button"
          onClick={() => onChange(cycle)}
          aria-pressed={value === cycle}
          className={cn(
            "rounded-full px-4 py-2 text-site-sm font-semibold transition-colors duration-150",
            value === cycle
              ? "bg-site-brand text-white"
              : "text-site-fg hover:text-site-ink",
          )}
        >
          {cycle === "monthly" ? tProfile("monthly") : tProfile("yearly")}
        </button>
      ))}
    </div>
  );
}

/**
 * The price itself. Any first-period offer is shown as the headline figure with
 * the standard price struck through beside it — the visitor needs to see both,
 * or the renewal is a surprise.
 */
export function PriceBlock({
  cycle,
  priceMonthly,
  priceYearly,
  firstMonthlyPrice,
  firstYearlyPrice,
  note,
}: {
  cycle: BillingCycle;
  priceMonthly: number;
  priceYearly: number;
  firstMonthlyPrice?: number;
  firstYearlyPrice?: number;
  /** Shown under the figure when there is no introductory offer to explain. */
  note: string;
}) {
  const tLanding = useTranslations("Landing.pricing");
  const tProfile = useTranslations("personalProfile");

  const standard = cycle === "monthly" ? priceMonthly : priceYearly;
  const offer = cycle === "monthly" ? firstMonthlyPrice : firstYearlyPrice;
  const hasOffer = offer != null && offer > 0 && offer < standard;
  const headline = hasOffer ? offer : standard;
  const per = cycle === "monthly" ? tLanding("perMonth") : tLanding("perYear");

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <PriceFigure>{formatEgpPrice(headline)}</PriceFigure>
        <span className="text-site-sm text-site-muted">
          {tLanding("currencyEgp")}
          {per}
        </span>
      </p>
      <p className="mt-2 text-site-sm text-site-muted">
        {hasOffer
          ? cycle === "monthly"
            ? tProfile("proFirstMonthlyOffer", {
                price: formatEgpPrice(standard),
                currency: tLanding("currencyEgp"),
              })
            : tProfile("proFirstYearlyOffer")
          : note}
      </p>
    </div>
  );
}

/** One typographic treatment for the figure, whether it is a number, the word
 *  "Free", or "Contact us". */
export function PriceFigure({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-site-display text-[2.5rem] leading-none font-extrabold text-site-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
