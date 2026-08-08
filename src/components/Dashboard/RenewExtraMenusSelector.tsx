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
  const periodLabel = billingCycle === "yearly" ? t("yearly") : t("monthly");

  return (
    <div
      className={`rounded-lg border border-line/80 bg-white/80 px-4 py-4 dark:border-line/80  ${isRTL ? "text-right" : "text-left"} ${className}`}
    >
      <p className="mb-1 text-sm font-semibold text-fg">
        {t("renewExtraMenusTitle")}
      </p>
      <p className="mb-4 text-xs text-fg-muted">
        {t("renewExtraMenusDescription", {
          current: String(currentExtra),
          base: String(baseMax),
          price: String(monthlyPrice),
          period: periodLabel,
        })}
      </p>

      <label
        htmlFor="renew-extra-menus-qty"
        className="mb-2 block text-xs font-medium text-fg-muted"
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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-lg font-bold disabled:opacity-40"
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
          className="w-full rounded-lg border border-line px-3 py-2 text-center text-lg font-semibold disabled:opacity-60"
        />
        <button
          type="button"
          disabled={disabled || value >= 50}
          onClick={() => onChange(Math.min(50, value + 1))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-lg font-bold disabled:opacity-40"
          aria-label={t("renewExtraMenusIncrease")}
        >
          +
        </button>
      </div>

      <p className="mt-3 text-xs text-fg-muted">
        {t("renewExtraMenusTotalMenus", {
          total: String(baseMax + value),
        })}
      </p>

      <div
        className={`mt-3 flex items-center justify-between rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 ${isRTL ? "flex-row-reverse" : ""}`}
      >
        <span className="text-xs text-fg-muted">
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
