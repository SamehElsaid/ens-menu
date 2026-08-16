"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  IoTicketOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoPricetagOutline,
} from "react-icons/io5";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionHeader,
  SegmentedControl,
} from "@/components/ui";
import { pickFailedRequestMessage } from "@/lib/subscriptionPayment";
import type {
  VoucherBillingCycle,
  VoucherValidationResult,
} from "@/types/Voucher";

type VoucherSectionProps = {
  locale: string;
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
  billingCycle,
  onBillingChange,
  showBillingChoice = false,
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

  const billingSelector =
    showBillingChoice && onBillingChange ? (
      <div className="min-w-0">
        <p className="ui-label mb-1">{t("voucherBillingForDiscount")}</p>
        <SegmentedControl
          label={t("selectBillingCycle")}
          value={billingCycle}
          onChange={onBillingChange}
          options={[
            { value: "monthly", label: t("voucherBillingMonthly") },
            { value: "yearly", label: t("voucherBillingYearly") },
          ]}
        />
      </div>
    ) : null;

  /**
   * The applied voucher is drawn as a stub: the card's brand inline edge marks
   * it as live, and the code itself is the largest thing in the block because
   * it is the one value the operator needs to read back to support.
   */
  const stub =
    appliedCode && validation ? (
      <div className="flex flex-col gap-2.5">
        <Card active padded="sm" className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                tone="accent"
                icon={
                  isDuration ? (
                    <IoTimeOutline aria-hidden />
                  ) : (
                    <IoPricetagOutline aria-hidden />
                  )
                }
              >
                {isDuration
                  ? t("voucherTypeDuration")
                  : t("voucherTypeDiscount")}
              </Badge>
              {billingRestriction ? (
                <Badge tone="warning">{billingRestriction}</Badge>
              ) : null}
            </div>

            <p className="ui-figure mt-1.5 text-base font-semibold tracking-[0.08em] text-fg uppercase">
              {appliedCode}
            </p>

            {isDiscount &&
            validation.discountAmount != null &&
            validation.discountedPrice != null ? (
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                {t("voucherAppliedDiscount", {
                  amount: validation.discountAmount,
                  price: validation.discountedPrice,
                  currency: currencyLabel,
                })}
              </p>
            ) : isDuration ? (
              <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                {t("voucherAppliedDuration", {
                  value: formatDurationValue(validation, locale),
                })}
              </p>
            ) : null}

            {isDiscount && canUpgradeToPro ? (
              <p className="mt-1 text-xs text-fg-subtle">
                {t("voucherDiscountPayHint")}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            iconOnly
            onClick={handleClear}
            disabled={disabled || redeemLoading}
            aria-label={t("voucherClear")}
          >
            <IoCloseOutline className="size-4" />
          </Button>
        </Card>

        {isDuration && onRedeemDuration && !suppressDurationRedeem ? (
          <Button
            type="button"
            fullWidth
            onClick={() => void onRedeemDuration()}
            loading={redeemLoading}
            disabled={disabled}
            startIcon={<IoTimeOutline aria-hidden />}
          >
            {redeemLoading ? t("voucherRedeeming") : t("voucherRedeemDuration")}
          </Button>
        ) : null}
      </div>
    ) : (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Field
          label={t("voucherSectionTitle")}
          labelClassName="sr-only"
          htmlFor="subscription-voucher-code"
          className="min-w-0 flex-1"
        >
          <Input
            id="subscription-voucher-code"
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleApply();
            }}
            placeholder={t("voucherCodePlaceholder")}
            disabled={disabled || checking}
            autoComplete="off"
            spellCheck={false}
            className="ui-figure tracking-[0.08em] uppercase"
          />
        </Field>
        <Button
          type="button"
          onClick={() => void handleApply()}
          loading={checking}
          disabled={disabled || !codeInput.trim()}
          className="sm:min-w-28"
        >
          {checking ? t("voucherApplying") : t("voucherApply")}
        </Button>
      </div>
    );

  /* Embedded, the section is a labelled band inside the checkout panel that
     owns the surface; standalone it needs its own ruled panel. */
  if (embedded) {
    return (
      <div id="subscription-voucher-section" className="flex flex-col gap-2.5">
        <SectionHeader
          ruled
          title={
            <span className="inline-flex items-center gap-2">
              <IoTicketOutline className="size-4 text-fg-subtle" aria-hidden />
              {t("voucherSectionTitle")}
            </span>
          }
          actions={billingSelector}
        />
        {stub}
      </div>
    );
  }

  return (
    <Card as="section" id="subscription-voucher-section">
      <SectionHeader
        ruled
        title={
          <span className="inline-flex items-center gap-2">
            <IoTicketOutline className="size-4 text-fg-subtle" aria-hidden />
            {t("voucherSectionTitle")}
          </span>
        }
        description={sectionDescription}
        actions={billingSelector}
      />
      <div className="mt-3.5">{stub}</div>
    </Card>
  );
}
