"use client";

import { useState, type ReactNode } from "react";
import {
  HiArrowDown,
  HiArrowUp,
  HiCheck,
  HiChevronDown,
  HiOutlineChat,
  HiOutlineGift,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineTag,
} from "react-icons/hi";
import { useTranslations } from "next-intl";
import ProPlanPriceSelector, {
  type ProBillingChoice,
} from "@/components/Pricing/ProPlanPriceSelector";
import { formatEgpPrice } from "@/lib/subscriptionPayment";
import type { Plan } from "@/types/Plan";
import { Alert, Badge, Button, Skeleton, SkeletonRegion } from "@/components/ui";

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
          className={`flex gap-2.5 text-sm text-fg-muted leading-snug ${
            isRTL ? "flex-row-reverse text-right" : ""
          }`}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft">
            <HiCheck className="h-3.5 w-3.5 text-success-fg" />
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
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() => setExpanded((prev) => !prev)}
          className={isRTL ? "flex-row-reverse" : ""}
          endIcon={
            <HiChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
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
        "group relative flex h-full flex-col rounded-2xl p-6 md:p-7 transition-all duration-300",
        isProPlan && !isCurrentPlan
          ? "border-2 border-brand-line bg-surface shadow-md z-[1]"
          : isCurrentPlan
            ? "border-2 border-brand bg-surface shadow-md ring-1 ring-brand-line"
            : "border border-line bg-surface shadow-sm hover:border-line-strong hover:shadow-md",
        className,
      ].join(" ")}
    >
      {isMostPopular && !isCurrentPlan && (
        <div className="absolute -top-3 inset-x-0 flex justify-center pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand px-4 py-1 text-xs font-bold text-on-brand shadow-sm">
            <HiOutlineSparkles className="h-3.5 w-3.5" />
            {mostPopularLabel}
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div
          className={`absolute top-4 ${isRTL ? "start-4" : "end-4"} pointer-events-none`}
        >
          <Badge tone="brand" icon={<HiOutlineTag className="h-3.5 w-3.5" />}>
            {currentPlanLabel}
          </Badge>
        </div>
      )}

      <header
        className={`mb-5 ${isRTL ? "text-right" : "text-left"} ${isCurrentPlan ? "pe-20" : ""}`}
      >
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${
            isProPlan
              ? "bg-brand-soft text-brand-soft-fg"
              : isFreePlan
                ? "bg-surface-2 text-fg-muted"
                : "bg-success-soft text-success-fg"
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
        <h3 className="text-xl font-bold tracking-tight text-fg">
          {planDisplayName}
        </h3>
        {plan.description ? (
          <p className="mt-1 text-sm text-fg-muted line-clamp-2">
            {plan.description}
          </p>
        ) : null}
      </header>

      <div className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        {isFreePlan && plan.priceMonthly === 0 ? (
          <span className="text-4xl font-black text-fg">
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
              <p className="text-2xl font-black text-fg tabular-nums">
                {monthlyPriceFormatted(
                  formatEgpPrice(plan.firstMonthlyPrice ?? plan.priceMonthly),
                )}
              </p>
            ) : plan.priceYearly > 0 ? (
              <p className="text-2xl font-black text-fg tabular-nums">
                {yearlyPriceFormatted(
                  formatEgpPrice(plan.firstYearlyPrice ?? plan.priceYearly),
                )}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-fg-muted">
            {contactForDetailsLabel}
          </p>
        )}
      </div>

      <div className="mb-5 h-px bg-line" />

      <CollapsiblePlanFeatureList features={features} isRTL={isRTL} />

      <div className="mt-6 flex flex-col gap-2 pt-2">
        {isCurrentPlan && !canRenew && (
          <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-soft-fg">
            <HiCheck className="h-4 w-4" />
            {currentPlanLabel}
          </span>
        )}
        {canRenew && onRenew && (
          <Button
            type="button"
            fullWidth
            onClick={onRenew}
            disabled={proPayLoading || renewLoading}
            loading={proPayLoading || renewLoading}
            startIcon={
              !proPayLoading && !renewLoading ? (
                <HiOutlineRefresh className="h-4 w-4 shrink-0" />
              ) : undefined
            }
          >
            {proPayLoading || renewLoading ? payingLabel : renewLabel ?? currentPlanLabel}
          </Button>
        )}
        {canUpgrade && (
          <>
            {voucherDurationHint && (
              <Alert tone="warning" className="text-center text-xs">
                {voucherDurationHint}
              </Alert>
            )}
            <Button
              type="button"
              fullWidth
              onClick={onUpgrade}
              disabled={proPayLoading || Boolean(voucherDurationHint)}
              loading={proPayLoading}
              startIcon={!proPayLoading ? <HiArrowUp className="h-4 w-4 shrink-0" /> : undefined}
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
            startIcon={
              !downgradeLoading ? <HiArrowDown className="h-4 w-4 shrink-0" /> : undefined
            }
          >
            {downgradeLoading ? downgradingLabel : downgradeLabel}
          </Button>
        )}
        {children}
      </div>
    </article>
  );
}

export function SubscriptionPlanCardSkeleton() {
  return (
    <SkeletonRegion
      label="Loading plan"
      className="flex h-full min-h-[420px] flex-col rounded-2xl border border-line bg-surface p-6 md:p-7"
    >
      <Skeleton className="mb-5 h-11 w-11" rounded="lg" />
      <Skeleton className="mb-2 h-6 w-2/5" rounded="md" />
      <Skeleton className="mb-6 h-4 w-3/5" />
      <Skeleton className="mb-6 h-10 w-full" rounded="lg" />
      <div className="mb-5 h-px bg-line" />
      <div className="flex-1 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      <Skeleton className="mt-6 h-12 w-full" rounded="lg" />
    </SkeletonRegion>
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
        "relative flex h-full flex-col rounded-2xl border border-line bg-surface p-6 md:p-7 shadow-sm transition-all duration-300 hover:border-line-strong hover:shadow-md",
        isCurrentCustomPlan &&
          "border-2 border-brand ring-1 ring-brand-line shadow-md",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isCurrentCustomPlan && (
        <div
          className={`absolute top-4 ${isRTL ? "start-4" : "end-4"}`}
        >
          <Badge tone="brand">{currentPlanLabel}</Badge>
        </div>
      )}

      <header className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        <div
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success-fg ${
            isRTL ? "ms-auto" : ""
          }`}
        >
          <HiOutlineChat className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-fg">
          {planCustomLabel}
        </h3>
        <p className="mt-1 text-sm text-fg-muted">
          {planDescription ?? contactForDetailsLabel}
        </p>
      </header>

      <div className={`mb-5 ${isRTL ? "text-right" : "text-left"}`}>
        <span className="text-2xl font-black text-fg">
          {customPriceLabel}
        </span>
      </div>

      <div className="mb-5 h-px bg-line" />

      <CollapsiblePlanFeatureList features={customPlanFeatures} isRTL={isRTL} />

      <div className="mt-6 pt-2">
        {isCurrentCustomPlan ? (
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-soft-fg">
            <HiCheck className="h-4 w-4" />
            {currentPlanLabel}
          </span>
        ) : (
          <Button
            variant="primary"
            fullWidth
            className="bg-success text-white hover:bg-success-hover"
            startIcon={<HiOutlineChat className="h-5 w-5" />}
            onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
          >
            {contactWhatsAppLabel}
          </Button>
        )}
      </div>
    </article>
  );
}
