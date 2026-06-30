"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  getExtraMenuMonthlyPrice,
  getExtraMenusRenewalAmount,
} from "@/lib/subscriptionMenus";
import type { Subscription } from "@/types/Subscription";

type RenewExtraMenusSelectorProps = {
  subscription: Subscription | null;
  billingCycle: "monthly" | "yearly";
  value: number;
  onChange: (count: number) => void;
  disabled?: boolean;
  className?: string;
};

export default function RenewExtraMenusSelector({
  subscription,
  billingCycle,
  value,
  onChange,
  disabled = false,
  className = "",
}: RenewExtraMenusSelectorProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("personalProfile");

  const monthlyPrice = getExtraMenuMonthlyPrice(subscription);
  const baseMax = subscription?.maxMenus ?? 4;
  const currentExtra = subscription?.extraMenus ?? 0;
  const renewalTotal = getExtraMenusRenewalAmount(
    value,
    billingCycle,
    monthlyPrice,
  );
  const periodLabel =
    billingCycle === "yearly" ? t("yearly") : t("monthly");

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 dark:border-slate-700/80 dark:bg-slate-900/50 ${isRTL ? "text-right" : "text-left"} ${className}`}
    >
      <p className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {t("renewExtraMenusTitle")}
      </p>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {t("renewExtraMenusDescription", {
          current: String(currentExtra),
          base: String(baseMax),
          price: String(monthlyPrice),
          period: periodLabel,
        })}
      </p>

      <label
        htmlFor="renew-extra-menus-qty"
        className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        {t("renewExtraMenusQuantityLabel")}
      </label>
      <div
        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <button
          type="button"
          disabled={disabled || value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-lg font-bold disabled:opacity-40 dark:border-slate-600"
          aria-label={t("renewExtraMenusDecrease")}
        >
          −
        </button>
        <input
          id="renew-extra-menus-qty"
          type="number"
          min={0}
          max={50}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (Number.isFinite(v) && v >= 0 && v <= 50) {
              onChange(v);
            }
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-center text-lg font-semibold dark:border-slate-600 dark:bg-slate-900 disabled:opacity-60"
        />
        <button
          type="button"
          disabled={disabled || value >= 50}
          onClick={() => onChange(Math.min(50, value + 1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-lg font-bold disabled:opacity-40 dark:border-slate-600"
          aria-label={t("renewExtraMenusIncrease")}
        >
          +
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {t("renewExtraMenusTotalMenus", {
          total: String(baseMax + value),
        })}
      </p>

      <div
        className={`mt-3 flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {value > 0
            ? t("renewExtraMenusAddonLine", {
                count: String(value),
                amount: String(renewalTotal),
              })
            : t("renewExtraMenusNoneSelected")}
        </span>
      </div>
    </div>
  );
}
