"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pushPurchaseEvent } from "@/shared/gtmEvents";

type ApiRedirectResponse = {
  success?: boolean;
  data?: {
    payment_status?: string;
    synced_from_redirect?: boolean;
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

  useEffect(() => {
    const qs = searchParams.toString();
    if (!qs.trim()) {
      setPhase("error");
      setMessage(t("paymentResultNoCheckout"));
      return;
    }

    const base = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
    const url = `${base}/payment/redirect?${qs}`;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept-Language": locale,
          },
        });
        const data = (await res.json().catch(() => ({}))) as ApiRedirectResponse;
        if (cancelled) return;

        if (!res.ok) {
          setPhase("error");
          setMessage(
            data.error ||
              data.errorEn ||
              data.message ||
              t("paymentResultFailedStatus"),
          );
          return;
        }

        const synced = data.data?.synced_from_redirect === true;
        const ps = String(data.data?.payment_status ?? "").toLowerCase();
        if (ps === "completed" || synced) {
          const orderId = data.data?.order_id;
          let value = Number(data.data?.value);
          let currency = data.data?.currency?.trim() || "USD";

          if (!Number.isFinite(value) || value <= 0) {
            try {
              const pending = JSON.parse(
                sessionStorage.getItem("gtm_pending_purchase") ?? "null",
              ) as { value?: number; currency?: string } | null;
              if (pending?.value && pending.value > 0) {
                value = pending.value;
                currency = pending.currency?.trim() || "USD";
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
          return;
        }
        if (ps === "pending") {
          setPhase("pending");
          setMessage(t("paymentResultPending"));
          return;
        }
        setPhase("error");
        setMessage(t("paymentResultFailed"));
      } catch (e: unknown) {
        if (cancelled) return;
        setPhase("error");
        setMessage(e instanceof Error ? e.message : t("paymentResultFailedStatus"));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, locale, t]);

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
