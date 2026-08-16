"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import {
  HiOutlineCollection,
  HiOutlineCreditCard,
  HiOutlineRefresh,
  HiOutlineSparkles,
} from "react-icons/hi";
import { IoTicketOutline, IoRemoveOutline, IoAddOutline } from "react-icons/io5";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  Alert,
  Button,
  Card,
  Input,
  SectionHeader,
  SegmentedControl,
} from "@/components/ui";
import { cn } from "@/lib/cn";
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
import { getPaymentAttemptKey } from "@/lib/paymentIdempotency";

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
  onVoucherApplied: (
    code: string,
    result: VoucherValidationResult | null,
  ) => void;
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
  const setExtraMenusValue = canRenewPro
    ? onRenewExtraMenusChange
    : setPurchaseQty;

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
  const extraMenusPurchaseTotal =
    !canRenewPro && isProUser ? purchaseQty * pricePerMenu : 0;

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

    const payload = {
      name: nameToSend,
      email: profile?.email?.trim() || undefined,
      mobile: phoneToSend,
      quantity: purchaseQty,
      currency: "EGP",
    };
    const idempotencyKey = getPaymentAttemptKey(
      "extra-menus",
      JSON.stringify(payload),
    );
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
    >(
      "/payment/subscription/extra-menus/initiate",
      locale,
      payload,
      undefined,
      undefined,
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    setPurchaseLoading(false);

    if (res?.status && res.data?.data?.redirectUrl) {
      const amount = Number(res.data.data.amount);
      const currency = res.data.data.currency || "EGP";
      sessionStorage.setItem(
        "gtm_pending_purchase",
        JSON.stringify({
          ...(Number.isFinite(amount) && amount > 0 ? { value: amount } : {}),
          currency,
          orderId: res.data.data.order_id,
          scope: "extra-menus",
        }),
      );
      toast.info(tMenus("extraMenusPaying"));
      window.location.href = res.data.data.redirectUrl;
      return;
    }

    const serverMsg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(serverMsg ?? tMenus("extraMenusPayError"));
  }, [
    profile,
    purchaseQty,
    locale,
    tMenus,
    onRequirePhone,
    setPurchaseLoading,
  ]);

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
    canRenewPro || canUpgradeToPro || isProUser || Boolean(appliedVoucherCode);

  if (!showPanel) return null;

  const periodLabel =
    proBillingChoice === "yearly" ? t("yearly") : t("monthly");

  const summaryLines: { key: string; label: string; amount: number }[] = [];
  if ((canRenewPro || canUpgradeToPro) && proPlanPrice > 0) {
    summaryLines.push({
      key: "plan",
      label: `${canRenewPro ? t("summaryRenewPro") : t("summaryUpgradePro")} (${periodLabel})`,
      amount: proPlanPrice,
    });
  }
  if (canRenewPro && renewExtraMenusCount > 0) {
    summaryLines.push({
      key: "extra-renewal",
      label: t("summaryExtraMenusRenewal", {
        count: String(renewExtraMenusCount),
      }),
      amount: extraMenusRenewalAmount,
    });
  }
  if (isProUser && !canRenewPro && purchaseQty > 0) {
    summaryLines.push({
      key: "extra-purchase",
      label: t("summaryExtraMenusPurchase", { count: String(purchaseQty) }),
      amount: extraMenusPurchaseTotal,
    });
  }

  const discountAmount =
    hasDiscountVoucher && (voucherValidation?.discountAmount ?? 0) > 0
      ? (voucherValidation?.discountAmount ?? 0)
      : 0;

  const showSummary =
    (canRenewPro || canUpgradeToPro || (isProUser && !canRenewPro)) &&
    !hasDurationVoucher;

  /* Quantity is a single control, not three: the buttons share edges with the
     field so the group reads as one object and cannot be mistaken for two
     unrelated actions flanking an input. */
  const stepperEdge =
    "flex size-9 shrink-0 items-center justify-center border-line-control text-fg " +
    "transition-colors duration-(--dur-fast) hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-45 sm:size-8";

  return (
    <Card
      as="section"
      padded="none"
      className={cn("flex min-w-0 flex-col", className)}
      aria-labelledby="subscription-manage-heading"
    >
      <div className="border-b border-line px-3 py-3 sm:px-4">
        <p className="ui-label mb-1">{t("orderSummaryTitle")}</p>
        <div className="flex items-start gap-2">
          <HiOutlineCreditCard
            className="mt-0.5 size-4 shrink-0 text-fg-subtle"
            aria-hidden
          />
          <div className="min-w-0">
            <h2
              id="subscription-manage-heading"
              className="text-sm font-semibold tracking-[-0.02em] text-fg"
            >
              {t("managePanelTitle")}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-fg-muted">
              {t("managePanelDescription")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4 p-3 sm:p-4">
        {canRenewPro && subscription ? (
          <Alert tone="info">
            {t("renewKeepsRemainingDays", {
              days: String(getSubscriptionDaysRemaining(subscription)),
            })}
          </Alert>
        ) : null}

        {showBilling ? (
          <div className="min-w-0">
            <p className="ui-label mb-1.5">{t("selectBillingCycle")}</p>
            <SegmentedControl
              label={t("selectBillingCycle")}
              value={proBillingChoice}
              onChange={onProBillingChange}
              options={[
                { value: "monthly", label: t("monthly") },
                { value: "yearly", label: t("yearly") },
              ]}
              className="w-full [&>button]:flex-1 [&>button]:justify-center"
            />
          </div>
        ) : null}

        {showExtraMenus ? (
          <div className="flex min-w-0 flex-col gap-2.5 border-t border-line pt-3.5">
            <SectionHeader
              title={
                canRenewPro
                  ? t("renewExtraMenusTitle")
                  : t("purchaseExtraMenusSectionTitle")
              }
              description={
                canRenewPro
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
                    })
              }
            />

            {showShortPeriodWarning ? (
              <Alert tone="warning">
                {tMenus("extraMenusShortPeriodWarning", {
                  days: String(daysRemaining),
                  price: String(monthlyPrice),
                })}
              </Alert>
            ) : null}

            <div className="flex items-center gap-3">
              <div className="flex items-stretch rounded-lg border border-line-control bg-surface">
                <button
                  type="button"
                  disabled={isBusy || extraMenusValue <= extraMenusMin}
                  onClick={() =>
                    setExtraMenusValue(
                      Math.max(extraMenusMin, extraMenusValue - 1),
                    )
                  }
                  className={cn(stepperEdge, "rounded-s-lg border-e")}
                  aria-label={t("renewExtraMenusDecrease")}
                >
                  <IoRemoveOutline className="size-4" aria-hidden />
                </button>
                <Input
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
                  className="ui-figure w-16 rounded-none border-0 text-center text-base"
                  aria-label={t("renewExtraMenusQuantityLabel")}
                />
                <button
                  type="button"
                  disabled={isBusy || extraMenusValue >= 50}
                  onClick={() =>
                    setExtraMenusValue(Math.min(50, extraMenusValue + 1))
                  }
                  className={cn(stepperEdge, "rounded-e-lg border-s")}
                  aria-label={t("renewExtraMenusIncrease")}
                >
                  <IoAddOutline className="size-4" aria-hidden />
                </button>
              </div>

              <p className="min-w-0 text-xs leading-relaxed text-fg-muted">
                {t("renewExtraMenusTotalMenus", {
                  total: String(baseMax + extraMenusValue),
                })}
              </p>
            </div>
          </div>
        ) : null}

        <div className="border-t border-line pt-3.5">
          <SubscriptionVoucherSection
            key={appliedVoucherCode ?? ""}
            locale={locale}
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
        </div>
      </div>

      {/* The bill is a ledger, and the total is the largest figure on the
          panel — on a checkout the number being agreed to should be the thing
          the eye lands on, not the button that agrees to it. */}
      {showSummary ? (
        <div className="border-t border-line bg-surface-2/40">
          <p className="ui-label px-3 pt-2.5 sm:px-4">
            {t("orderSummaryTitle")}
          </p>
          <ul className="mt-1.5 divide-y divide-line border-y border-line">
            {summaryLines.map((line) => (
              <li
                key={line.key}
                className="flex items-baseline justify-between gap-3 px-3 py-2 sm:px-4"
              >
                <span className="min-w-0 text-[13px] text-fg-muted">
                  {line.label}
                </span>
                <span className="ui-figure shrink-0 text-[13px] text-fg">
                  {formatEgpPrice(line.amount)} {currencyLabel}
                </span>
              </li>
            ))}
            {discountAmount > 0 ? (
              <li className="flex items-baseline justify-between gap-3 px-3 py-2 sm:px-4">
                <span className="min-w-0 text-[13px] text-success">
                  {t("summaryDiscount")}
                </span>
                <span className="ui-figure shrink-0 text-[13px] text-success">
                  −{formatEgpPrice(discountAmount)} {currencyLabel}
                </span>
              </li>
            ) : null}
          </ul>
          <div className="flex items-baseline justify-between gap-3 px-3 py-2.5 sm:px-4">
            <span className="ui-label">{t("orderSummaryTotal")}</span>
            <span className="ui-figure text-xl leading-none font-semibold text-fg">
              {formatEgpPrice(orderTotal)}{" "}
              <span className="text-xs font-normal text-fg-muted">
                {currencyLabel}
              </span>
            </span>
          </div>
        </div>
      ) : null}

      {primaryAction ? (
        <div className="flex flex-col gap-2 border-t border-line p-3 sm:p-4">
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            loading={isBusy}
            startIcon={<primaryAction.icon className="size-4" />}
          >
            {isBusy && !voucherRedeemLoading
              ? t("paying")
              : voucherRedeemLoading
                ? t("voucherRedeeming")
                : primaryAction.label}
          </Button>

          {canUpgradeToPro && !canRenewPro && !isProUser ? (
            <p className="text-xs leading-relaxed text-fg-subtle">
              {t("managePanelUpgradeHint")}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
