"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pushPurchaseEvent } from "@/shared/gtmEvents";
import { axiosGet, axiosPost } from "@/shared/axiosCall";

type ApiRedirectResponse = {
  success?: boolean;
  data?: {
    payment_status?: string;
    redirect_status?: string;
    synced_from_redirect?: boolean;
    subscription_synced?: boolean;
    order_id?: string;
    value?: number;
    currency?: string;
  };
  error?: string;
  errorEn?: string;
  message?: string;
};

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("personalProfile");
  const [phase, setPhase] = useState<"loading" | "success" | "pending" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const redirectParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  useEffect(() => {
    if (Object.keys(redirectParams).length === 0) {
      setPhase("error");
      setMessage(t("paymentResultNoCheckout"));
      return;
    }

    let cancelled = false;

    const finishSuccess = (data: ApiRedirectResponse) => {
      const orderId = data.data?.order_id;
      let value = Number(data.data?.value);
      let currency = data.data?.currency?.trim() || "EGP";

      if (!Number.isFinite(value) || value <= 0) {
        try {
          const pending = JSON.parse(
            sessionStorage.getItem("gtm_pending_purchase") ?? "null",
          ) as { value?: number; currency?: string } | null;
          if (pending?.value && pending.value > 0) {
            value = pending.value;
            currency = pending.currency?.trim() || "EGP";
          }
        } catch {
          /* ignore */
        }
      }
      sessionStorage.removeItem("gtm_pending_purchase");

      if (Number.isFinite(value) && value > 0) {
        const dedupeKey = orderId
          ? `gtm_purchase_${orderId}`
          : "gtm_purchase_anonymous";
        if (!sessionStorage.getItem(dedupeKey)) {
          sessionStorage.setItem(dedupeKey, "1");
          pushPurchaseEvent({ value, currency });
        }
      }

      setPhase("success");
      setMessage(t("paymentResultSuccessPro"));
    };

    void (async () => {
      const res = await axiosGet<ApiRedirectResponse>(
        "/payment/redirect",
        locale,
        undefined,
        redirectParams,
      );
      if (cancelled) return;

      const data = res.data ?? {};
      if (!res.status) {
        setPhase("error");
        setMessage(
          (data as ApiRedirectResponse).error ||
            (data as ApiRedirectResponse).errorEn ||
            (data as ApiRedirectResponse).message ||
            t("paymentResultFailedStatus"),
        );
        return;
      }

      const ps = String(data.data?.payment_status ?? "").toLowerCase();
      const redirectStatus = String(data.data?.redirect_status ?? "").toUpperCase();
      const synced = data.data?.synced_from_redirect === true;
      const subscriptionSynced = data.data?.subscription_synced === true;
      const redirectPaid = redirectStatus === "PAID";

      if (
        ps === "completed" ||
        synced ||
        subscriptionSynced ||
        redirectPaid
      ) {
        finishSuccess(data);
        return;
      }
      if (ps === "pending") {
        setPhase("pending");
        setMessage(t("paymentResultPending"));
        return;
      }
      setPhase("error");
      setMessage(t("paymentResultFailed"));
    })();

    return () => {
      cancelled = true;
    };
  }, [redirectParams, locale, t]);

  const handleRecover = async () => {
    setPhase("loading");
    const orderId =
      typeof redirectParams.customerReference === "string"
        ? (() => {
            try {
              const parsed = JSON.parse(redirectParams.customerReference) as {
                orderId?: string;
              };
              return parsed.orderId ?? "";
            } catch {
              return "";
            }
          })()
        : "";

    const res = await axiosPost<
      { orderId?: string },
      { message?: string }
    >("/user/subscription/recover-payment", locale, {
      orderId: orderId || undefined,
    });

    if (res.status) {
      setPhase("success");
      setMessage(t("paymentResultSuccessPro"));
      return;
    }

    setPhase("error");
    setMessage(t("paymentResultFailedStatus"));
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("paymentResultTitle")}
        </h1>
        {phase === "loading" && (
          <p className="text-slate-600 dark:text-slate-300">
            {t("paymentResultChecking")}
          </p>
        )}
        {phase !== "loading" && (
          <p
            className={`text-sm ${
              phase === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : phase === "pending"
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            {message}
          </p>
        )}
        {phase === "success" && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            {t("yourPlanUpdateHint")}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          {phase === "error" && (
            <button
              type="button"
              onClick={() => void handleRecover()}
              className="inline-flex justify-center rounded-xl border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              {t("paymentRecoverCta")}
            </button>
          )}
          <Link
            href="/dashboard"
            className="inline-flex justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {t("paymentBackToPersonal")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
          …
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
