"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  HiOutlineCollection,
  HiOutlineCreditCard,
  HiOutlineRefresh,
  HiOutlineSparkles,
} from "react-icons/hi";
import { IoTicketOutline, IoWarningOutline } from "react-icons/io5";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  formatPhoneForPaymentGateway,
  formatEgpPrice,
  pickFailedRequestMessage,
} from "@/lib/subscriptionPayment";
import {
  getEffectiveMaxMenus,
  getExtraMenuMonthlyPrice,
  getExtraMenuProratedPrice,
  getExtraMenusRenewalAmount,
  getSubscriptionDaysRemaining,
  shouldShowExtraMenuShortPeriodWarning,
} from "@/lib/subscriptionMenus";
import SubscriptionVoucherSection from "@/components/Dashboard/SubscriptionVoucherSection";
import type { Plan } from "@/types/Plan";
import type { Subscription } from "@/types/Subscription";
import type { VoucherValidationResult } from "@/types/Voucher";

type AuthUser = {
  name?: string;
  email?: string;
  phoneNumber?: string;
};

type SubscriptionManagePanelProps = {
  locale: string;
  isRTL: boolean;
  subscription: Subscription | null;
  menusUsed: number | null;
  proPlan: Plan | null;
  isProUser: boolean;
  canRenewPro: boolean;
  canUpgradeToPro: boolean;
  proBillingChoice: "monthly" | "yearly";
  onProBillingChange: (cycle: "monthly" | "yearly") => void;
  renewExtraMenusCount: number;
  onRenewExtraMenusChange: (count: number) => void;
  appliedVoucherCode: string | null;
  voucherValidation: VoucherValidationResult | null;
  onVoucherApplied: (code: string, result: VoucherValidationResult | null) => void;
  onRenew: () => void;
  onUpgrade: () => void;
  onRedeemDuration: () => void;
  onRequirePhone: () => void;
  loading: boolean;
  voucherRedeemLoading: boolean;
  currencyLabel: string;
  className?: string;
};

function getProPlanPrice(
  plan: Plan | null,
  billing: "monthly" | "yearly",
  voucherDiscountedPrice: number | null,
  /** Renewals never use the first-period intro price. */
  useFullPrice = false,
): number {
  if (!plan) return 0;
  if (voucherDiscountedPrice != null) return voucherDiscountedPrice;
  if (billing === "yearly") {
    return useFullPrice
      ? plan.priceYearly
      : (plan.firstYearlyPrice ?? plan.priceYearly);
  }
  return useFullPrice
    ? plan.priceMonthly
    : (plan.firstMonthlyPrice ?? plan.priceMonthly);
}

export default function SubscriptionManagePanel({
  locale,
  isRTL,
  subscription,
  menusUsed,
  proPlan,
  isProUser,
  canRenewPro,
  canUpgradeToPro,
  proBillingChoice,
  onProBillingChange,
  renewExtraMenusCount,
  onRenewExtraMenusChange,
  appliedVoucherCode,
  voucherValidation,
  onVoucherApplied,
  onRenew,
  onUpgrade,
  onRedeemDuration,
  onRequirePhone,
  loading,
  voucherRedeemLoading,
  currencyLabel,
  className = "",
}: SubscriptionManagePanelProps) {
  const t = useTranslations("personalProfile");
  const tMenus = useTranslations("Menus");
  const authData = useAppSelector((state) => state.auth.data) as {
    user?: AuthUser;
  } | null;
  const profile = authData?.user;

  const monthlyPrice = getExtraMenuMonthlyPrice(subscription);
  const pricePerMenu = getExtraMenuProratedPrice(subscription);
  const effectiveMax = getEffectiveMaxMenus(subscription);
  const baseMax = Number(subscription?.maxMenus ?? 1);
  const showShortPeriodWarning =
    !canRenewPro &&
    isProUser &&
    shouldShowExtraMenuShortPeriodWarning(subscription);
  const daysRemaining = getSubscriptionDaysRemaining(subscription);

  const [purchaseQty, setPurchaseQty] = useState(1);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const hasDurationVoucher =
    Boolean(appliedVoucherCode) &&
    voucherValidation?.voucher.type === "duration";
  const hasDiscountVoucher =
    Boolean(appliedVoucherCode) &&
    voucherValidation?.voucher.type === "discount";
  const voucherDiscountedPrice = hasDiscountVoucher
    ? (voucherValidation?.discountedPrice ?? null)
    : null;

  const showBilling = canRenewPro || canUpgradeToPro;
  const showExtraMenus = isProUser;
  const extraMenusMin = canRenewPro ? 0 : 1;
  const extraMenusValue = canRenewPro ? renewExtraMenusCount : purchaseQty;
  const setExtraMenusValue = canRenewPro ? onRenewExtraMenusChange : setPurchaseQty;

  const proPlanPrice = getProPlanPrice(
    proPlan,
    proBillingChoice,
    canUpgradeToPro || canRenewPro ? voucherDiscountedPrice : null,
    canRenewPro,
  );
  const extraMenusRenewalAmount = canRenewPro
    ? getExtraMenusRenewalAmount(
        renewExtraMenusCount,
        proBillingChoice,
        monthlyPrice,
      )
    : 0;
  const extraMenusPurchaseTotal = !canRenewPro && isProUser
    ? purchaseQty * pricePerMenu
    : 0;

  const orderTotal = useMemo(() => {
    if (hasDurationVoucher) return 0;
    if (canRenewPro) return proPlanPrice + extraMenusRenewalAmount;
    if (canUpgradeToPro) return proPlanPrice;
    if (isProUser && !canRenewPro) return extraMenusPurchaseTotal;
    return 0;
  }, [
    hasDurationVoucher,
    canRenewPro,
    canUpgradeToPro,
    isProUser,
    proPlanPrice,
    extraMenusRenewalAmount,
    extraMenusPurchaseTotal,
  ]);

  const handlePurchaseExtraMenus = useCallback(async () => {
    const nameToSend = profile?.name?.trim() ?? "";
    const rawPhone = profile?.phoneNumber?.trim() ?? "";
    const phoneToSend = formatPhoneForPaymentGateway(rawPhone);

    if (!nameToSend || !phoneToSend) {
      onRequirePhone();
      return;
    }

    setPurchaseLoading(true);
    const res = await axiosPost<
      {
        name: string;
        email?: string;
        mobile: string;
        quantity: number;
        currency?: string;
      },
      {
        success?: boolean;
        data?: {
          redirectUrl?: string | null;
          amount?: number;
          order_id?: string;
          currency?: string;
        };
      }
    >("/payment/subscription/extra-menus/initiate", locale, {
      name: nameToSend,
      email: profile?.email?.trim() || undefined,
      mobile: phoneToSend,
      quantity: purchaseQty,
      currency: "EGP",
    });
    setPurchaseLoading(false);

    if (res?.status && res.data?.data?.redirectUrl) {
      const amount = Number(res.data.data.amount);
      const currency = res.data.data.currency || "EGP";
      if (Number.isFinite(amount) && amount > 0) {
        sessionStorage.setItem(
          "gtm_pending_purchase",
          JSON.stringify({
            value: amount,
            currency,
            orderId: res.data.data.order_id,
          }),
        );
      }
      toast.info(tMenus("extraMenusPaying"));
      window.location.href = res.data.data.redirectUrl;
      return;
    }

    const serverMsg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(serverMsg ?? tMenus("extraMenusPayError"));
  }, [profile, purchaseQty, locale, tMenus, onRequirePhone]);

  const isBusy = loading || purchaseLoading || voucherRedeemLoading;

  const primaryAction = useMemo(() => {
    if (hasDurationVoucher) {
      return {
        label: t("voucherRedeemDuration"),
        icon: IoTicketOutline,
        onClick: onRedeemDuration,
        disabled: isBusy,
      };
    }
    if (canRenewPro) {
      return {
        label:
          proBillingChoice === "monthly"
            ? t("renewProMonthlyCta")
            : t("renewProYearlyCta"),
        icon: HiOutlineRefresh,
        onClick: onRenew,
        disabled: isBusy,
      };
    }
    if (canUpgradeToPro) {
      return {
        label:
          proBillingChoice === "monthly"
            ? t("upgradeToProMonthlyCta")
            : t("upgradeToProYearlyCta"),
        icon: HiOutlineSparkles,
        onClick: onUpgrade,
        disabled: isBusy || Boolean(hasDurationVoucher),
      };
    }
    if (isProUser) {
      return {
        label: tMenus("extraMenusPayNow"),
        icon: HiOutlineCollection,
        onClick: () => void handlePurchaseExtraMenus(),
        disabled: isBusy || purchaseQty < 1,
      };
    }
    return null;
  }, [
    hasDurationVoucher,
    canRenewPro,
    canUpgradeToPro,
    isProUser,
    proBillingChoice,
    isBusy,
    purchaseQty,
    t,
    tMenus,
    onRedeemDuration,
    onRenew,
    onUpgrade,
    handlePurchaseExtraMenus,
  ]);

  const showPanel =
    canRenewPro ||
    canUpgradeToPro ||
    isProUser ||
    Boolean(appliedVoucherCode);

  if (!showPanel) return null;

  const periodLabel =
    proBillingChoice === "yearly" ? t("yearly") : t("monthly");

  return (
    <section
      className={`rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900 ${className}`}
      aria-labelledby="subscription-manage-heading"
    >
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 md:px-6">
        <div
          className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <HiOutlineCreditCard className="h-5 w-5" />
          </span>
          <div>
            <h2
              id="subscription-manage-heading"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {t("managePanelTitle")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("managePanelDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 md:p-6">
        {canRenewPro && subscription && (
          <p
            className={`rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("renewKeepsRemainingDays", {
              days: String(getSubscriptionDaysRemaining(subscription)),
            })}
          </p>
        )}

        {showBilling && (
          <div>
            <p
              className={`mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("selectBillingCycle")}
            </p>
            <div
              className={`inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950 ${isRTL ? "flex-row-reverse" : ""}`}
              role="group"
              aria-label={t("selectBillingCycle")}
            >
              {(["monthly", "yearly"] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  disabled={isBusy}
                  onClick={() => onProBillingChange(cycle)}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    proBillingChoice === cycle
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {cycle === "monthly" ? t("monthly") : t("yearly")}
                </button>
              ))}
            </div>
          </div>
        )}

        {showExtraMenus && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/80 dark:bg-slate-950/50">
            <p
              className={`mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100 ${isRTL ? "text-right" : "text-left"}`}
            >
              {canRenewPro ? t("renewExtraMenusTitle") : t("purchaseExtraMenusSectionTitle")}
            </p>
            <p
              className={`mb-4 text-xs text-slate-500 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"}`}
            >
              {canRenewPro
                ? t("renewExtraMenusDescription", {
                    current: String(subscription?.extraMenus ?? 0),
                    base: String(baseMax),
                    price: String(monthlyPrice),
                    period: periodLabel,
                  })
                : t("purchaseExtraMenusSectionDesc", {
                    used:
                      menusUsed != null
                        ? String(menusUsed)
                        : String(effectiveMax),
                    max: String(effectiveMax),
                    price: String(monthlyPrice),
                  })}
            </p>

            {showShortPeriodWarning && (
              <div
                role="alert"
                className={`mb-4 flex gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 dark:border-amber-700 dark:bg-amber-950/40 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
              >
                <IoWarningOutline className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                  {tMenus("extraMenusShortPeriodWarning", {
                    days: String(daysRemaining),
                    price: String(monthlyPrice),
                  })}
                </p>
              </div>
            )}

            <div
              className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button
                type="button"
                disabled={isBusy || extraMenusValue <= extraMenusMin}
                onClick={() =>
                  setExtraMenusValue(Math.max(extraMenusMin, extraMenusValue - 1))
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900"
                aria-label={t("renewExtraMenusDecrease")}
              >
                −
              </button>
              <input
                type="number"
                min={extraMenusMin}
                max={50}
                value={extraMenusValue}
                disabled={isBusy}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v >= extraMenusMin && v <= 50) {
                    setExtraMenusValue(v);
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-semibold dark:border-slate-600 dark:bg-slate-900 disabled:opacity-60"
                aria-label={t("renewExtraMenusQuantityLabel")}
              />
              <button
                type="button"
                disabled={isBusy || extraMenusValue >= 50}
                onClick={() =>
                  setExtraMenusValue(Math.min(50, extraMenusValue + 1))
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold disabled:opacity-40 dark:border-slate-600 dark:bg-slate-900"
                aria-label={t("renewExtraMenusIncrease")}
              >
                +
              </button>
            </div>

            <p
              className={`mt-3 text-xs text-slate-500 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"}`}
            >
              {t("renewExtraMenusTotalMenus", {
                total: String(baseMax + extraMenusValue),
              })}
            </p>
          </div>
        )}

        <SubscriptionVoucherSection
          locale={locale}
          isRTL={isRTL}
          billingCycle={proBillingChoice}
          onBillingChange={onProBillingChange}
          showBillingChoice={false}
          showBillingHint={false}
          isProUser={isProUser}
          canUpgradeToPro={canUpgradeToPro}
          currencyLabel={currencyLabel}
          appliedCode={appliedVoucherCode}
          validation={voucherValidation}
          onApplied={onVoucherApplied}
          onRedeemDuration={undefined}
          redeemLoading={voucherRedeemLoading}
          disabled={isBusy}
          embedded
          suppressDurationRedeem
        />

        {(canRenewPro || canUpgradeToPro || (isProUser && !canRenewPro)) &&
          !hasDurationVoucher && (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/80 dark:bg-slate-950/50">
              <p
                className={`mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"}`}
              >
                {t("orderSummaryTitle")}
              </p>
              <ul className="space-y-2">
                {(canRenewPro || canUpgradeToPro) && proPlanPrice > 0 && (
                  <li
                    className={`flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className="text-slate-600 dark:text-slate-300">
                      {canRenewPro ? t("summaryRenewPro") : t("summaryUpgradePro")}{" "}
                      ({periodLabel})
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatEgpPrice(proPlanPrice)} {currencyLabel}
                    </span>
                  </li>
                )}
                {canRenewPro && renewExtraMenusCount > 0 && (
                  <li
                    className={`flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className="text-slate-600 dark:text-slate-300">
                      {t("summaryExtraMenusRenewal", {
                        count: String(renewExtraMenusCount),
                      })}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatEgpPrice(extraMenusRenewalAmount)} {currencyLabel}
                    </span>
                  </li>
                )}
                {isProUser && !canRenewPro && purchaseQty > 0 && (
                  <li
                    className={`flex items-center justify-between text-sm ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span className="text-slate-600 dark:text-slate-300">
                      {t("summaryExtraMenusPurchase", {
                        count: String(purchaseQty),
                      })}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatEgpPrice(extraMenusPurchaseTotal)} {currencyLabel}
                    </span>
                  </li>
                )}
                {hasDiscountVoucher &&
                  voucherValidation?.discountAmount != null &&
                  voucherValidation.discountAmount > 0 && (
                    <li
                      className={`flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <span>{t("summaryDiscount")}</span>
                      <span className="font-semibold tabular-nums">
                        −{formatEgpPrice(voucherValidation.discountAmount)}{" "}
                        {currencyLabel}
                      </span>
                    </li>
                  )}
              </ul>
              <div
                className={`mt-4 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {t("orderSummaryTotal")}
                </span>
                <span className="text-xl font-black tabular-nums text-primary">
                  {formatEgpPrice(orderTotal)} {currencyLabel}
                </span>
              </div>
            </div>
          )}

        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <primaryAction.icon className="h-5 w-5 shrink-0" />
            {isBusy && !voucherRedeemLoading
              ? t("paying")
              : voucherRedeemLoading
                ? t("voucherRedeeming")
                : primaryAction.label}
          </button>
        )}

        {canUpgradeToPro && !canRenewPro && !isProUser && (
          <p
            className={`text-center text-xs text-slate-500 dark:text-slate-400 ${isRTL ? "text-right" : "text-left"}`}
          >
            {t("managePanelUpgradeHint")}
          </p>
        )}
      </div>
    </section>
  );
}
