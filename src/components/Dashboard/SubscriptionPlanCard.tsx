"use client";

import { useState, type ReactNode } from "react";
import {
  HiArrowDown,
  HiArrowUp,
  HiCheck,
  HiChevronDown,
  HiOutlineChat,
  HiOutlineRefresh,
} from "react-icons/hi";
import { useTranslations } from "next-intl";
import ProPlanPriceSelector, {
  type ProBillingChoice,
} from "@/components/Pricing/ProPlanPriceSelector";
import { formatEgpPrice } from "@/lib/subscriptionPayment";
import { cn } from "@/lib/cn";
import type { Plan } from "@/types/Plan";
import { Alert, Button, Card, Skeleton, SkeletonRegion } from "@/components/ui";

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
  canRenew?: boolean;
  proPayLoading: boolean;
  downgradeLoading: boolean;
  renewLoading?: boolean;
  onUpgrade: () => void;
  onDowngrade: () => void;
  onRenew?: () => void;
  upgradeLabel: string;
  downgradeLabel: string;
  renewLabel?: string;
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

/**
 * A plan's contents, as a checklist.
 *
 * Rows share a hairline instead of floating on 10px gaps, so two plans placed
 * side by side line up row for row and can actually be compared — which is the
 * only reason this list exists.
 */
function PlanFeatureList({ features }: { features: string[] }) {
  return (
    <ul>
      {features.map((f, i) => (
        <li
          key={`${f}-${i}`}
          className="flex items-start gap-2 border-b border-line py-2 text-[13px] leading-snug text-fg last:border-b-0"
        >
          <HiCheck
            className="mt-0.5 size-3.5 shrink-0 text-success"
            aria-hidden
          />
          <span className="min-w-0">{f}</span>
        </li>
      ))}
    </ul>
  );
}

function CollapsiblePlanFeatureList({
  features,
  initialVisibleCount = INITIAL_VISIBLE_FEATURES,
}: {
  features: string[];
  initialVisibleCount?: number;
}) {
  const t = useTranslations("PricingPage");
  const [expanded, setExpanded] = useState(false);
  const hasMore = features.length > initialVisibleCount;
  const visibleFeatures = expanded
    ? features
    : features.slice(0, initialVisibleCount);

  return (
    <div className="min-h-0 flex-1">
      <PlanFeatureList features={visibleFeatures} />
      {hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={
            <HiChevronDown
              className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
            />
          }
          aria-expanded={expanded}
        >
          {expanded ? t("mobileShowLess") : t("mobileShowMore")}
        </Button>
      )}
    </div>
  );
}

/** The price line. Mono and display-size, because it is the figure the reader
 *  came for and every column must align on it. */
function PlanFigure({ children }: { children: ReactNode }) {
  return (
    <p className="ui-figure text-[26px] leading-none text-fg" lang="en">
      {children}
    </p>
  );
}

/**
 * One plan column.
 *
 * The previous card marked the recommended plan with a floating gradient pill,
 * a 2px tinted border, a ring and a drop shadow — four signals for one fact,
 * and none of them survived greyscale. Here the current plan takes the brand
 * live edge (`active`) and the recommended plan takes a filled brand strip
 * along its top edge. Nothing floats, nothing lifts on hover, and the price is
 * the loudest thing in the column.
 */
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
  canRenew = false,
  proPayLoading,
  downgradeLoading,
  renewLoading = false,
  onUpgrade,
  onDowngrade,
  onRenew,
  upgradeLabel,
  downgradeLabel,
  renewLabel,
  payingLabel,
  downgradingLabel,
  currentPlanLabel,
  mostPopularLabel,
  freePriceLabel,
  contactForDetailsLabel,
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
  void currencyEgp;

  const voucherOriginalPrice =
    voucherDiscountedPrice != null &&
    voucherDiscountAmount != null &&
    voucherDiscountAmount > 0
      ? voucherDiscountedPrice + voucherDiscountAmount
      : null;

  const resolvedActiveBilling: "monthly" | "yearly" =
    activeBillingCycle === "yearly" ? "yearly" : "monthly";

  const showPopularStrip = isMostPopular && !isCurrentPlan;

  return (
    <Card
      as="article"
      padded="none"
      active={isCurrentPlan}
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <p
        className={cn(
          "ui-label border-b border-line px-4 py-1.5 text-center",
          showPopularStrip
            ? "border-brand bg-brand text-on-brand"
            : isCurrentPlan
              ? "bg-accent-soft text-accent-strong"
              : "text-fg-subtle",
        )}
      >
        {showPopularStrip
          ? mostPopularLabel
          : isCurrentPlan
            ? currentPlanLabel
            : planDisplayName}
      </p>

      <div className="flex flex-1 flex-col p-4">
        <header className="text-start">
          <h3 className="text-base font-semibold tracking-[-0.02em] text-fg">
            {planDisplayName}
          </h3>
          {plan.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
              {plan.description}
            </p>
          ) : null}
        </header>

        <div className="mt-4 text-start">
          {isFreePlan && plan.priceMonthly === 0 ? (
            <PlanFigure>{freePriceLabel}</PlanFigure>
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
            resolvedActiveBilling === "monthly" && plan.priceMonthly > 0 ? (
              <PlanFigure>
                {monthlyPriceFormatted(
                  formatEgpPrice(plan.firstMonthlyPrice ?? plan.priceMonthly),
                )}
              </PlanFigure>
            ) : plan.priceYearly > 0 ? (
              <PlanFigure>
                {yearlyPriceFormatted(
                  formatEgpPrice(plan.firstYearlyPrice ?? plan.priceYearly),
                )}
              </PlanFigure>
            ) : null
          ) : (
            <p className="text-[13px] text-fg-muted">{contactForDetailsLabel}</p>
          )}
        </div>

        <div className="mt-4 border-t border-line pt-1">
          <CollapsiblePlanFeatureList features={features} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-line bg-surface-2/40 p-3">
        {isCurrentPlan && !canRenew && (
          <p className="flex items-center justify-center gap-1.5 py-1 text-[13px] font-medium text-accent-strong">
            <HiCheck className="size-4 shrink-0" aria-hidden />
            {currentPlanLabel}
          </p>
        )}
        {canRenew && onRenew && (
          <Button
            type="button"
            fullWidth
            onClick={onRenew}
            disabled={proPayLoading || renewLoading}
            loading={proPayLoading || renewLoading}
            startIcon={<HiOutlineRefresh aria-hidden />}
          >
            {proPayLoading || renewLoading
              ? payingLabel
              : (renewLabel ?? currentPlanLabel)}
          </Button>
        )}
        {canUpgrade && (
          <>
            {voucherDurationHint && (
              <Alert tone="warning">{voucherDurationHint}</Alert>
            )}
            <Button
              type="button"
              fullWidth
              onClick={onUpgrade}
              disabled={proPayLoading || Boolean(voucherDurationHint)}
              loading={proPayLoading}
              startIcon={<HiArrowUp aria-hidden />}
            >
              {proPayLoading ? payingLabel : upgradeLabel}
            </Button>
          </>
        )}
        {canDowngrade && (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onDowngrade}
            disabled={downgradeLoading}
            loading={downgradeLoading}
            startIcon={<HiArrowDown aria-hidden />}
          >
            {downgradeLoading ? downgradingLabel : downgradeLabel}
          </Button>
        )}
        {children}
      </div>
    </Card>
  );
}

export function SubscriptionPlanCardSkeleton() {
  return (
    <SkeletonRegion
      label="Loading plan"
      className="flex h-full min-h-[380px] flex-col rounded-xl border border-line bg-surface p-4"
    >
      <Skeleton className="mb-4 h-4 w-2/5" rounded="sm" />
      <Skeleton className="mb-6 h-7 w-3/5" rounded="sm" />
      <div className="flex-1 space-y-2.5 border-t border-line pt-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-3.5" rounded="sm" />
        ))}
      </div>
      <Skeleton className="mt-4 h-9 w-full" rounded="lg" />
    </SkeletonRegion>
  );
}

export function CustomSubscriptionPlanCard({
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
    <Card
      as="article"
      padded="none"
      active={isCurrentCustomPlan}
      className={cn("flex h-full flex-col overflow-hidden", className)}
    >
      <p
        className={cn(
          "ui-label border-b border-line px-4 py-1.5 text-center",
          isCurrentCustomPlan
            ? "bg-accent-soft text-accent-strong"
            : "text-fg-subtle",
        )}
      >
        {isCurrentCustomPlan ? currentPlanLabel : planCustomLabel}
      </p>

      <div className="flex flex-1 flex-col p-4">
        <header className="text-start">
          <h3 className="text-base font-semibold tracking-[-0.02em] text-fg">
            {planCustomLabel}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-fg-muted">
            {planDescription ?? contactForDetailsLabel}
          </p>
        </header>

        <div className="mt-4 text-start">
          <PlanFigure>{customPriceLabel}</PlanFigure>
        </div>

        <div className="mt-4 border-t border-line pt-1">
          <CollapsiblePlanFeatureList features={customPlanFeatures} />
        </div>
      </div>

      <div className="border-t border-line bg-surface-2/40 p-3">
        {isCurrentCustomPlan ? (
          <p className="flex items-center justify-center gap-1.5 py-1 text-[13px] font-medium text-accent-strong">
            <HiCheck className="size-4 shrink-0" aria-hidden />
            {currentPlanLabel}
          </p>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            startIcon={<HiOutlineChat aria-hidden />}
            onClick={() =>
              window.open(whatsappUrl, "_blank", "noopener,noreferrer")
            }
          >
            {contactWhatsAppLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
