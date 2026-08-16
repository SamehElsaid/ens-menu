"use client";

import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { Odometer } from "@/motion/Odometer";
import { cn } from "@/lib/cn";
import { formatEgpPrice } from "@/lib/formatNumber";

export { formatEgpPrice } from "@/lib/formatNumber";

export type BillingCycle = "monthly" | "yearly";

/**
 * Billing switch for the public pricing page.
 *
 * A square segmented control whose selected half is filled with the deep violet
 * ink rather than the brand purple. The brand purple is spent a few elements
 * further down on "this is the recommended plan", and a pricing page that says
 * it twice says it about neither.
 *
 * There is no divider between the halves: the fill is always on exactly one of
 * them, so it already draws the split, and a line at the fill's leading edge
 * would only read as an artefact.
 *
 * Separate from `Pricing/ProPlanPriceSelector` on purpose: that one also renders
 * inside the dashboard's subscription panel, at the product's compact size, and
 * must not inherit marketing typography.
 */
const CYCLES = ["monthly", "yearly"] as const;

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

  /* A radio group rather than two toggle buttons, because that is what it is:
     one value with two options, not two independent states. The payoff is
     behavioural — arrow keys move between the options and only the selected one
     is a tab stop, so a keyboard user reaches the control once and then changes
     it, instead of tabbing through every segment. */
  const move = (offset: number) => {
    const next =
      CYCLES[(CYCLES.indexOf(value) + offset + CYCLES.length) % CYCLES.length];
    onChange(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={tProfile("selectBillingCycle")}
      onKeyDown={(event) => {
        /* Logical, not physical: in Arabic the visual order of the segments is
           mirrored, so "next" has to follow the writing direction. */
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        if (event.key === "ArrowRight") move(rtl ? -1 : 1);
        else if (event.key === "ArrowLeft") move(rtl ? 1 : -1);
        else if (event.key === "ArrowDown") move(1);
        else if (event.key === "ArrowUp") move(-1);
        else return;
        event.preventDefault();
      }}
      className={cn(
        /* Equal tracks rather than shrink-to-fit halves. Two labels of different
           lengths would otherwise give the control two different segment widths,
           and a fill that travels between segments of different widths has to be
           measured at runtime — which is the difference between this being CSS
           and this being JavaScript. Equal halves are also just the better
           segmented control.

           `inline-grid`, so the control stays inline-level and keeps sizing to
           its content the way the previous `inline-flex` did. Two `1fr` tracks
           under shrink-to-fit both take the width of the wider label. */
        "relative isolate inline-grid grid-cols-2 overflow-hidden rounded-site-sm border border-site-line-strong bg-site-bg",
        className,
      )}
    >
      {/* The fill travels between the two halves instead of switching off here
          and on there, which is what states that these are one control holding
          one value rather than two independent buttons. */}
      <span
        aria-hidden
        className="s-seg-pill bg-site-ink"
        style={
          {
            "--s-seg-count": CYCLES.length,
            "--s-seg-index": CYCLES.indexOf(value),
          } as CSSProperties
        }
      />
      {CYCLES.map((cycle) => {
        const selected = value === cycle;
        return (
          <button
            key={cycle}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(cycle)}
            className={cn(
              /* Above the pill, and transparent, so the pill shows through the
                 selected half. */
              "s-ticket relative z-10 px-5 py-2.5",
              "transition-[color,transform] duration-(--dur-tint) ease-(--ease-settle)",
              "motion-safe:active:scale-[0.98]",
              selected
                ? "text-site-ground"
                : "text-site-fg hover:text-site-ink",
            )}
          >
            {cycle === "monthly" ? tProfile("monthly") : tProfile("yearly")}
          </button>
        );
      })}
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
        <PriceFigure>
          <Odometer
            value={formatEgpPrice(headline)}
            label={`${tLanding("currencyEgp")}${per}`}
          />
        </PriceFigure>
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

/**
 * One typographic treatment for the figure, whether it is a number, the word
 * "Free", or "Contact us".
 *
 * Mono and tabular: every price on the site is a machine figure, and three plan
 * columns only line up on the decimal if the digits are the same width.
 */
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
        "font-site-mono text-[2.5rem] leading-none font-semibold tracking-[-0.02em] text-site-ink tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}
