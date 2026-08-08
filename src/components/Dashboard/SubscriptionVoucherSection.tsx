"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IoTicketOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoPricetagOutline,
} from "react-icons/io5";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { pickFailedRequestMessage } from "@/lib/subscriptionPayment";
import type {
  VoucherBillingCycle,
  VoucherValidationResult,
} from "@/types/Voucher";

type VoucherSectionProps = {
  locale: string;
  isRTL?: boolean;
  billingCycle: "monthly" | "yearly";
  onBillingChange?: (cycle: "monthly" | "yearly") => void;
  showBillingChoice?: boolean;
  showBillingHint?: boolean;
  isProUser?: boolean;
  canUpgradeToPro?: boolean;
  currencyLabel: string;
  disabled?: boolean;
  appliedCode: string | null;
  validation: VoucherValidationResult | null;
  onApplied: (code: string, result: VoucherValidationResult | null) => void;
  onRedeemDuration?: () => Promise<void>;
  redeemLoading?: boolean;
  /** Flat layout inside a parent checkout panel */
  embedded?: boolean;
  /** Hide duration redeem button — parent panel owns the primary CTA */
  suppressDurationRedeem?: boolean;
};

function formatDurationValue(
  result: VoucherValidationResult,
  locale: string,
): string {
  const v = result.voucher;
  if (v.durationUnit === "days") {
    return locale === "ar"
      ? `${v.durationValue} ${Number(v.durationValue) === 1 ? "يوم" : "أيام"}`
      : `${v.durationValue} day${Number(v.durationValue) === 1 ? "" : "s"}`;
  }
  return locale === "ar"
    ? `${v.durationValue} ${Number(v.durationValue) === 1 ? "شهر" : "أشهر"}`
    : `${v.durationValue} month${Number(v.durationValue) === 1 ? "" : "s"}`;
}

function formatBillingRestriction(
  cycle: VoucherBillingCycle | null | undefined,
  t: ReturnType<typeof useTranslations>,
): string | null {
  if (!cycle || cycle === "both") return null;
  if (cycle === "monthly") return t("voucherBillingMonthlyOnly");
  return t("voucherBillingYearlyOnly");
}

export default function SubscriptionVoucherSection({
  locale,
  isRTL = false,
  billingCycle,
  onBillingChange,
  showBillingChoice = false,
  showBillingHint = false,
  isProUser = false,
  canUpgradeToPro = false,
  currencyLabel,
  disabled,
  appliedCode,
  validation,
  onApplied,
  onRedeemDuration,
  redeemLoading,
  embedded = false,
  suppressDurationRedeem = false,
}: VoucherSectionProps) {
  const t = useTranslations("personalProfile");
  const [codeInput, setCodeInput] = useState(appliedCode ?? "");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setCodeInput(appliedCode ?? "");
  }, [appliedCode]);

  const handleApply = useCallback(async () => {
    const code = codeInput.trim();
    if (!code) return;
    setChecking(true);
    const res = await axiosPost<
      { code: string; billingCycle: "monthly" | "yearly" },
      { success?: boolean; data?: VoucherValidationResult }
    >("/vouchers/validate", locale, { code, billingCycle });
    setChecking(false);

    if (res.status && res.data?.data) {
      const result = res.data.data;
      if (result.voucher.type === "discount" && isProUser && !canUpgradeToPro) {
        toast.info(t("voucherDiscountRequiresUpgrade"));
        onApplied("", null);
        return;
      }
      onApplied(code.toUpperCase(), result);
      return;
    }
    onApplied("", null);
    const msg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(msg ?? t("voucherInvalid"));
  }, [
    codeInput,
    locale,
    billingCycle,
    onApplied,
    t,
    isProUser,
    canUpgradeToPro,
  ]);

  const handleClear = () => {
    setCodeInput("");
    onApplied("", null);
  };

  const isDuration = validation?.voucher.type === "duration";
  const isDiscount = validation?.voucher.type === "discount";
  const billingRestriction = formatBillingRestriction(
    validation?.voucher.billingCycle,
    t,
  );

  const sectionDescription = isProUser
    ? t("voucherSectionDescPro")
    : t("voucherSectionDesc");

  return (
    <div
      id="subscription-voucher-section"
      className={
        embedded
          ? "rounded-lg border border-line/80 bg-slate-50/80 p-4 dark:border-line/80 dark:bg-slate-950/50"
          : "rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-white to-violet-50/50 p-5 shadow-sm dark:border-primary/25 dark:from-primary/10 dark:via-slate-900 dark:to-slate-950 md:p-6"
      }
    >
      <div
        className={`${embedded ? "mb-3" : "mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"} ${!embedded && isRTL ? "sm:flex-row-reverse" : ""}`}
      >
        <div className={isRTL ? "text-right" : "text-left"}>
          <div
            className={`${embedded ? "mb-1" : "mb-2"} flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {!embedded && (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <IoTicketOutline className="text-xl" />
              </span>
            )}
            <h2
              className={
                embedded
                  ? "text-sm font-semibold text-fg"
                  : "text-lg font-bold text-fg"
              }
            >
              {t("voucherSectionTitle")}
            </h2>
          </div>
          {!embedded && (
            <p className="text-sm text-fg-muted">{sectionDescription}</p>
          )}
        </div>

        {showBillingChoice && onBillingChange && (
          <div className={`shrink-0 ${isRTL ? "text-right" : "text-left"}`}>
            <p className="mb-1.5 text-xs font-medium text-fg-muted">
              {t("voucherBillingForDiscount")}
            </p>
            <div
              className={`inline-flex rounded-lg border border-line bg-white p-1   ${isRTL ? "flex-row-reverse" : ""}`}
              role="group"
              aria-label={t("selectBillingCycle")}
            >
              {(["monthly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  disabled={disabled || checking || redeemLoading}
                  onClick={() => onBillingChange(cycle)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                    billingCycle === cycle
                      ? "bg-brand text-on-brand shadow-sm"
                      : "text-fg-muted hover:bg-slate-50  dark:hover:bg-slate-800"
                  }`}
                >
                  {cycle === "monthly"
                    ? t("voucherBillingMonthly")
                    : t("voucherBillingYearly")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {appliedCode && validation ? (
        <div className="space-y-3">
          <div
            className={`flex items-start justify-between gap-3 rounded-lg border border-primary/20 bg-white p-4 dark:border-primary/30  ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex-1 space-y-2 ${isRTL ? "text-right" : "text-left"}`}
            >
              <div
                className={`flex flex-wrap items-center gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {isDuration ? (
                    <>
                      <IoTimeOutline className="h-3.5 w-3.5" />
                      {t("voucherTypeDuration")}
                    </>
                  ) : (
                    <>
                      <IoPricetagOutline className="h-3.5 w-3.5" />
                      {t("voucherTypeDiscount")}
                    </>
                  )}
                </span>
                {billingRestriction && (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    {billingRestriction}
                  </span>
                )}
              </div>
              <p className="font-mono text-lg font-bold tracking-wide text-primary">
                {appliedCode}
              </p>
              {isDiscount &&
              validation.discountAmount != null &&
              validation.discountedPrice != null ? (
                <p className="text-sm text-fg-muted">
                  {t("voucherAppliedDiscount", {
                    amount: validation.discountAmount,
                    price: validation.discountedPrice,
                    currency: currencyLabel,
                  })}
                </p>
              ) : isDuration ? (
                <p className="text-sm text-fg-muted">
                  {t("voucherAppliedDuration", {
                    value: formatDurationValue(validation, locale),
                  })}
                </p>
              ) : null}
              {isDiscount && canUpgradeToPro && (
                <p className="text-xs text-fg-subtle">
                  {t("voucherDiscountPayHint")}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || redeemLoading}
              className="rounded-lg p-2 text-fg-subtle transition-colors hover:bg-surface-2"
              aria-label={t("voucherClear")}
            >
              <IoCloseOutline className="text-xl" />
            </button>
          </div>

          {isDuration && onRedeemDuration && !suppressDurationRedeem && (
            <button
              type="button"
              onClick={() => void onRedeemDuration()}
              disabled={disabled || redeemLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-60"
            >
              <IoTimeOutline className="h-5 w-5" />
              {redeemLoading
                ? t("voucherRedeeming")
                : t("voucherRedeemDuration")}
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="subscription-voucher-code"
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleApply();
            }}
            placeholder={t("voucherCodePlaceholder")}
            disabled={disabled || checking}
            className={`flex-1 rounded-lg border border-line bg-white px-4 py-3 text-sm uppercase tracking-wide   ${isRTL ? "text-right" : "text-left"}`}
          />
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={disabled || checking || !codeInput.trim()}
            className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60 sm:min-w-[7rem]"
          >
            {checking ? t("voucherApplying") : t("voucherApply")}
          </button>
        </div>
      )}
    </div>
  );
}
