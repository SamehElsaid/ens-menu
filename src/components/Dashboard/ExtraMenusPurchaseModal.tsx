"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import {
  formatPhoneForPaymentGateway,
  pickFailedRequestMessage,
} from "@/lib/subscriptionPayment";
import {
  getExtraMenuMonthlyPrice,
  getExtraMenuProratedPrice,
  getSubscriptionDaysRemaining,
  shouldShowExtraMenuShortPeriodWarning,
} from "@/lib/subscriptionMenus";
import type { Subscription } from "@/types/Subscription";
import { IoWarningOutline } from "react-icons/io5";
import { FiMinus, FiPlus } from "react-icons/fi";
import { Alert, Button, Field, Input, Modal } from "@/components/ui";

type AuthUser = {
  name?: string;
  email?: string;
  phoneNumber?: string;
};

interface ExtraMenusPurchaseModalProps {
  subscription: Subscription | null;
  currentCount: number;
  onClose: () => void;
}

export default function ExtraMenusPurchaseModal({
  subscription,
  currentCount,
  onClose,
}: ExtraMenusPurchaseModalProps) {
  const t = useTranslations("Menus");
  const tStepper = useTranslations("personalProfile");
  const locale = useLocale();
  const authData = useAppSelector((state) => state.auth.data) as {
    user?: AuthUser;
  } | null;
  const profile = authData?.user;

  const monthlyPrice = getExtraMenuMonthlyPrice(subscription);
  const pricePerMenu = getExtraMenuProratedPrice(subscription);
  const daysRemaining = getSubscriptionDaysRemaining(subscription);
  const showShortPeriodWarning =
    shouldShowExtraMenuShortPeriodWarning(subscription);
  const baseMax = subscription?.maxMenus ?? 4;
  const extraMenus = subscription?.extraMenus ?? 0;

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const total = quantity * pricePerMenu;

  const handlePay = useCallback(async () => {
    const nameToSend = profile?.name?.trim() ?? "";
    const rawPhone = profile?.phoneNumber?.trim() ?? "";
    const phoneToSend = formatPhoneForPaymentGateway(rawPhone);

    if (!nameToSend || !phoneToSend) {
      toast.error(t("extraMenusPayError"));
      return;
    }

    setLoading(true);
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
      quantity,
      currency: "EGP",
    });
    setLoading(false);

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
      toast.info(t("extraMenusPaying"));
      window.location.href = res.data.data.redirectUrl;
      return;
    }

    const serverMsg = pickFailedRequestMessage(res?.data as unknown);
    toast.error(serverMsg ?? t("extraMenusPayError"));
  }, [profile, quantity, locale, t]);

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={t("limitReached")}
      description={t("extraMenusDescription", {
        current: String(currentCount),
        max: String(baseMax + extraMenus),
        monthly: String(monthlyPrice),
        unitPrice: String(pricePerMenu),
      })}
      icon={<IoWarningOutline className="size-5" />}
      iconTone="warning"
      dismissible={!loading}
      closeLabel={t("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void handlePay()}
            loading={loading}
          >
            {loading ? t("extraMenusPaying") : t("extraMenusPayNow")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {showShortPeriodWarning && (
          <Alert tone="warning">
            {t("extraMenusShortPeriodWarning", {
              days: String(daysRemaining),
              price: String(monthlyPrice),
            })}
          </Alert>
        )}

        <p className="rounded-lg bg-surface-2 px-4 py-3 text-sm text-fg-muted">
          {t("extraMenusMonthlyBreakdown", {
            monthly: String(monthlyPrice),
            unit: String(pricePerMenu),
          })}
        </p>

        <div className="rounded-lg bg-surface-2 p-4">
          <Field
            label={t("extraMenusQuantityLabel")}
            hint={t("extraMenusRenewalNote")}
            htmlFor="extra-menus-qty"
          >
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                iconOnly
                aria-label={tStepper("renewExtraMenusDecrease")}
                disabled={quantity <= 1 || loading}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <FiMinus className="size-4" />
              </Button>
              <Input
                type="number"
                min={1}
                max={50}
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v >= 1 && v <= 50) {
                    setQuantity(v);
                  }
                }}
                className="text-center font-semibold tabular-nums"
                data-autofocus
              />
              <Button
                variant="secondary"
                iconOnly
                aria-label={tStepper("renewExtraMenusIncrease")}
                disabled={quantity >= 50 || loading}
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              >
                <FiPlus className="size-4" />
              </Button>
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-brand-line bg-brand-soft px-4 py-3">
          <span className="text-sm text-brand-soft-fg">
            {t("extraMenusTotal")}
          </span>
          <span className="text-base font-semibold tabular-nums text-brand-soft-fg">
            {total} {t("extraMenusCurrency")}
          </span>
        </div>
      </div>
    </Modal>
  );
}
