"use client";

import { useLocale, useTranslations } from "next-intl";

import {
  HiOutlineGift,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { IoWarningOutline } from "react-icons/io5";

import {
  getEffectiveMaxMenus,
  getSubscriptionDaysRemaining,
} from "@/lib/subscriptionMenus";
import type { Subscription } from "@/types/Subscription";

type CurrentPlanSummaryProps = {
  subscriptionInfo: Subscription | null;

  loading: boolean;

  currentPlanName: string;

  menusUsed?: number | null;

  className?: string;
};

function formatPlanDate(
  d: string | null | undefined,
  locale: string,
): string {
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

function getSubscriptionProgress(subscription: Subscription | null): number | null {
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

export default function CurrentPlanSummary({
  subscriptionInfo,

  loading,

  currentPlanName,

  menusUsed = null,

  className = "",
}: CurrentPlanSummaryProps) {
  const locale = useLocale();

  const isRTL = locale === "ar";

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
  const progressPercent = isPro ? getSubscriptionProgress(subscriptionInfo) : null;

  const statusLabel = (() => {
    if (isInGracePeriod) return t("subscriptionGraceStatus");
    const status = String(subscriptionInfo?.status ?? "").toLowerCase();
    if (status === "active") return t("active");
    if (status) return String(subscriptionInfo?.status);
    return t("active");
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
      <div
        className={`rounded-[24px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 md:p-6 animate-pulse space-y-4 ${className}`}
        aria-hidden
      >
        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-lg" />

        <div className="h-8 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-lg" />

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/8 via-white to-slate-50 dark:from-primary/15 dark:via-slate-900 dark:to-slate-950 p-5 md:p-6 shadow-sm ${isRTL ? "text-right" : "text-left"} ${className}`}
    >
      <div
        className={`absolute top-0 ${isRTL ? "left-0 rounded-br-[80px]" : "right-0 rounded-bl-[80px]"} h-24 w-24 bg-primary/10 dark:bg-primary/15 pointer-events-none`}
        aria-hidden
      />

      <p className="relative text-xs font-semibold uppercase tracking-wider text-primary/80 dark:text-primary mb-3">
        {t("currentPlanSummary")}
      </p>

      <div
        className={`relative flex flex-wrap items-center gap-3 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <div
          className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {isPro ? (
              <HiOutlineSparkles className="h-5 w-5" />
            ) : (
              <HiOutlineGift className="h-5 w-5" />
            )}
          </span>

          <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
            {displayPlanName}
          </span>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            isInGracePeriod
              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {isInGracePeriod && (
        <div
          role="alert"
          className={`relative mb-5 flex gap-3 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 dark:border-amber-700/60 dark:bg-amber-950/40 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
        >
          <IoWarningOutline className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {t("subscriptionGraceWarning")}
          </p>
        </div>
      )}

      {isPro && daysRemaining > 0 && progressPercent != null && (
        <div className="relative mb-5 space-y-2">
          <div
            className={`flex items-center justify-between gap-2 text-sm ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t("daysRemainingLabel", { days: String(daysRemaining) })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatPlanDate(subscriptionInfo?.endDate as string, locale)}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("daysRemainingLabel", { days: String(daysRemaining) })}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent <= 15
                  ? "bg-amber-500"
                  : progressPercent <= 30
                    ? "bg-amber-400"
                    : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {menusUsed != null && effectiveMaxMenus > 0 && (
        <div className="relative mb-5">
          <div
            className={`mb-2 flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {t("menusUsedLabel", {
                used: String(menusUsed),
                total: String(effectiveMaxMenus),
              })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Math.round((menusUsed / effectiveMaxMenus) * 100)}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
            <div
              className={`h-full rounded-full ${
                menusUsed >= effectiveMaxMenus
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(100, Math.round((menusUsed / effectiveMaxMenus) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      <dl className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          {
            label: t("billingCycle"),
            value: billingCycleLabel,
          },
          {
            label: t("maxMenusLabel"),
            value: menusLimitValue,
          },
          {
            label: t("maxProductsLabel"),
            value: t("maxProductsUnlimited"),
          },
          ...(subscriptionInfo?.startDate
            ? [
                {
                  label: t("startDate"),
                  value: formatPlanDate(
                    subscriptionInfo.startDate as string,
                    locale,
                  ),
                },
              ]
            : []),
          {
            label: t("renewalDate"),
            value: formatPlanDate(
              subscriptionInfo?.endDate as string | undefined,
              locale,
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-900/50 px-3 py-2.5"
          >
            <dt className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {item.label}
            </dt>

            <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
