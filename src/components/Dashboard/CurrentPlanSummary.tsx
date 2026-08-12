"use client";

import { useLocale, useTranslations } from "next-intl";

import { HiOutlineGift, HiOutlineSparkles } from "react-icons/hi2";

import {
  getEffectiveMaxMenus,
  getSubscriptionDaysRemaining,
} from "@/lib/subscriptionMenus";
import type { Subscription } from "@/types/Subscription";
import { Alert, Badge, Card, Skeleton, SkeletonRegion } from "@/components/ui";
import { cn } from "@/lib/cn";

type CurrentPlanSummaryProps = {
  subscriptionInfo: Subscription | null;

  loading: boolean;

  currentPlanName: string;

  menusUsed?: number | null;

  className?: string;
};

function formatPlanDate(d: string | null | undefined, locale: string): string {
  if (d == null || d === "") return "—";

  try {
    return new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function getSubscriptionProgress(
  subscription: Subscription | null,
): number | null {
  const endRaw = subscription?.endDate;
  const startRaw = subscription?.startDate;
  if (!endRaw || !startRaw) return null;

  const end = new Date(endRaw).getTime();
  const start = new Date(startRaw).getTime();
  if (!Number.isFinite(end) || !Number.isFinite(start) || end <= start) {
    return null;
  }

  const totalMs = end - start;
  const remainingMs = end - Date.now();
  const ratio = remainingMs / totalMs;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

/**
 * A quota row: ticket label, the fraction as a figure, then the bar.
 *
 * The bar is the secondary reading and the figure is the primary one — a bar
 * alone cannot be read by a screen reader, cannot be read in greyscale, and
 * cannot answer "how many exactly", so the numbers are printed beside it and
 * carried in `aria-valuetext`.
 */
function QuotaMeter({
  label,
  figure,
  /** Fill of the track, 0–100. */
  percent,
  /** How close the meter is to its ceiling, 0–100 — picks the fill colour. */
  pressure,
}: {
  label: string;
  figure: string;
  percent: number;
  pressure: number;
}) {
  const fill =
    pressure >= 100 ? "bg-danger" : pressure >= 80 ? "bg-warning" : "bg-accent";

  return (
    <div className="px-3 py-3 sm:px-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="ui-label min-w-0">{label}</p>
        <p className="ui-figure shrink-0 text-[13px] text-fg" lang="en">
          {figure}
        </p>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={figure}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full", fill)}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

export default function CurrentPlanSummary({
  subscriptionInfo,

  loading,

  currentPlanName,

  menusUsed = null,

  className = "",
}: CurrentPlanSummaryProps) {
  const locale = useLocale();

  const t = useTranslations("personalProfile");

  const displayPlanName = currentPlanName
    ? (() => {
        const n = String(currentPlanName).toLowerCase();

        if (n === "free") return t("planFree");

        if (n === "pro") return t("planPro");

        return currentPlanName;
      })()
    : t("planFree");

  const isPro = String(currentPlanName).toLowerCase() === "pro";
  const daysRemaining = getSubscriptionDaysRemaining(subscriptionInfo);
  const isInGracePeriod = subscriptionInfo?.isInGracePeriod === true;
  const effectiveMaxMenus = getEffectiveMaxMenus(subscriptionInfo);
  const baseMenus = Number(subscriptionInfo?.maxMenus ?? 1);
  const extraMenus = Number(subscriptionInfo?.extraMenus ?? 0);
  const progressPercent = isPro
    ? getSubscriptionProgress(subscriptionInfo)
    : null;

  const status = (() => {
    if (isInGracePeriod) {
      return { label: t("subscriptionGraceStatus"), tone: "warning" } as const;
    }
    const raw = String(subscriptionInfo?.status ?? "").toLowerCase();
    if (raw === "active" || !raw) {
      return { label: t("active"), tone: "success" } as const;
    }
    return {
      label: String(subscriptionInfo?.status),
      tone: "neutral",
    } as const;
  })();

  const billingCycleLabel = (() => {
    const c = String(subscriptionInfo?.billingCycle ?? "").toLowerCase();

    if (c === "yearly" || c === "annual") return t("yearly");

    if (c === "monthly") return t("monthly");

    if (c === "free" || !c) return t("freePrice");

    return subscriptionInfo?.billingCycle ?? "—";
  })();

  const menusLimitValue =
    extraMenus > 0
      ? t("maxMenusWithExtra", {
          total: String(effectiveMaxMenus),
          base: String(baseMenus),
          extra: String(extraMenus),
        })
      : t("maxMenusSimple", { total: String(effectiveMaxMenus) });

  if (loading) {
    return (
      <SkeletonRegion
        label={t("currentPlanSummary")}
        className={cn("rounded-xl border border-line bg-surface", className)}
      >
        <div className="border-b border-line px-3 py-3 sm:px-4">
          <Skeleton className="h-3 w-24" rounded="sm" />
          <Skeleton className="mt-2 h-5 w-32" rounded="sm" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4"
            >
              <Skeleton className="h-3 w-28" rounded="sm" />
              <Skeleton className="h-3 w-16" rounded="sm" />
            </div>
          ))}
        </div>
      </SkeletonRegion>
    );
  }

  const detailRows: { label: string; value: string; mono?: boolean }[] = [
    { label: t("billingCycle"), value: billingCycleLabel },
    { label: t("maxMenusLabel"), value: menusLimitValue },
    { label: t("maxProductsLabel"), value: t("maxProductsUnlimited") },
    ...(subscriptionInfo?.startDate
      ? [
          {
            label: t("startDate"),
            value: formatPlanDate(subscriptionInfo.startDate as string, locale),
            mono: true,
          },
        ]
      : []),
    {
      label: t("renewalDate"),
      value: formatPlanDate(
        subscriptionInfo?.endDate as string | undefined,
        locale,
      ),
      mono: true,
    },
  ];

  const periodPercent =
    isPro && daysRemaining > 0 && progressPercent != null
      ? progressPercent
      : null;
  const menusMeter =
    menusUsed != null && effectiveMaxMenus > 0
      ? {
          used: menusUsed,
          percent: Math.min(
            100,
            Math.round((menusUsed / effectiveMaxMenus) * 100),
          ),
        }
      : null;

  const PlanIcon = isPro ? HiOutlineSparkles : HiOutlineGift;

  return (
    <Card padded="none" className={cn("overflow-hidden", className)}>
      <div className="border-b border-line px-3 py-3 sm:px-4">
        <p className="ui-label">{t("currentPlanSummary")}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <PlanIcon className="size-4 shrink-0 text-fg-subtle" aria-hidden />
          <h3 className="text-lg leading-none font-semibold tracking-[-0.03em] text-fg">
            {displayPlanName}
          </h3>
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        </div>
      </div>

      {isInGracePeriod && (
        <div className="border-b border-line p-3 sm:p-4">
          <Alert tone="warning">{t("subscriptionGraceWarning")}</Alert>
        </div>
      )}

      {periodPercent != null || menusMeter ? (
        <div className="divide-y divide-line border-b border-line">
          {periodPercent != null ? (
            <QuotaMeter
              label={t("daysRemainingLabel", { days: String(daysRemaining) })}
              figure={`${periodPercent}%`}
              percent={periodPercent}
              /* The bar shows time left, so pressure is time spent — a period
                 nearly over is the urgent end of the scale. */
              pressure={100 - periodPercent}
            />
          ) : null}
          {menusMeter ? (
            <QuotaMeter
              label={t("menusUsedLabel", {
                used: String(menusMeter.used),
                total: String(effectiveMaxMenus),
              })}
              figure={`${menusMeter.used}/${effectiveMaxMenus}`}
              percent={menusMeter.percent}
              pressure={menusMeter.percent}
            />
          ) : null}
        </div>
      ) : null}

      <dl className="divide-y divide-line">
        {detailRows.map((item) => (
          <div
            key={item.label}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-3 py-2.5 sm:px-4"
          >
            <dt className="ui-label min-w-0">{item.label}</dt>
            <dd
              className={cn(
                "min-w-0 text-end",
                item.mono
                  ? "ui-figure text-[13px] text-fg"
                  : "text-[13px] font-medium text-fg",
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
