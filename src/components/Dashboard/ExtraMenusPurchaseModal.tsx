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
import { IoCloseOutline, IoCartOutline, IoWarningOutline } from "react-icons/io5";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <IoCloseOutline className="text-xl text-gray-400" />
        </button>

        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <IoCartOutline className="text-3xl text-primary" />
          </div>

          <div>
            <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-slate-100">
              {t("extraMenusTitle")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("extraMenusDescription", {
                current: String(currentCount),
                max: String(baseMax + extraMenus),
                monthly: String(monthlyPrice),
                unitPrice: String(pricePerMenu),
              })}
            </p>
          </div>

          {showShortPeriodWarning && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-start dark:border-amber-700 dark:bg-amber-950/40"
            >
              <IoWarningOutline className="mt-0.5 shrink-0 text-xl text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                {t("extraMenusShortPeriodWarning", {
                  days: String(daysRemaining),
                  price: String(monthlyPrice),
                })}
              </p>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
            {t("extraMenusMonthlyBreakdown", {
              monthly: String(monthlyPrice),
              unit: String(pricePerMenu),
            })}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-start dark:bg-slate-800/50">
            <label
              htmlFor="extra-menus-qty"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t("extraMenusQuantityLabel")}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={quantity <= 1 || loading}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold disabled:opacity-40 dark:border-slate-600"
              >
                −
              </button>
              <input
                id="extra-menus-qty"
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
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg font-semibold dark:border-slate-600 dark:bg-slate-900"
              />
              <button
                type="button"
                disabled={quantity >= 50 || loading}
                onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg font-bold disabled:opacity-40 dark:border-slate-600"
              >
                +
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {t("extraMenusRenewalNote")}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {t("extraMenusTotal")}
            </span>
            <span className="text-lg font-bold text-primary">
              {total} {t("extraMenusCurrency")}
            </span>
          </div>

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => void handlePay()}
              disabled={loading}
              className="flex-1 rounded-xl bg-linear-to-r from-primary to-primary/80 px-4 py-2.5 font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t("extraMenusPaying") : t("extraMenusPayNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
