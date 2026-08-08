"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { pushPurchaseEvent } from "@/shared/gtmEvents";
import { axiosGet, axiosPost } from "@/shared/axiosCall";
import StatusScreen, { type StatusTone } from "@/components/site/StatusScreen";
import { SiteButton, SiteButtonLink, SiteSpinner } from "@/components/site";

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
  const [phase, setPhase] = useState<
    "loading" | "success" | "pending" | "error"
  >("loading");
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
      const redirectStatus = String(
        data.data?.redirect_status ?? "",
      ).toUpperCase();
      const synced = data.data?.synced_from_redirect === true;
      const subscriptionSynced = data.data?.subscription_synced === true;
      const redirectPaid = redirectStatus === "PAID";

      if (ps === "completed" || synced || subscriptionSynced || redirectPaid) {
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

    const res = await axiosPost<{ orderId?: string }, { message?: string }>(
      "/user/subscription/recover-payment",
      locale,
      {
        orderId: orderId || undefined,
      },
    );

    if (res.status) {
      setPhase("success");
      setMessage(t("paymentResultSuccessPro"));
      return;
    }

    setPhase("error");
    setMessage(t("paymentResultFailedStatus"));
  };

  /* The glyph carries the verdict, so it is the one thing a returning payer
     reads before anything else. */
  const { code, tone } = (
    {
      loading: { code: "···", tone: "brand" },
      success: { code: "✓", tone: "positive" },
      pending: { code: "⏳", tone: "warm" },
      error: { code: "!", tone: "danger" },
    } as const satisfies Record<
      typeof phase,
      { code: string; tone: StatusTone }
    >
  )[phase];

  return (
    <StatusScreen
      code={code}
      tone={tone}
      label={t("paymentResultTitle")}
      title={phase === "loading" ? t("paymentResultChecking") : message}
      body={phase === "success" ? t("yourPlanUpdateHint") : undefined}
    >
      {phase === "loading" ? (
        <SiteSpinner className="size-6 text-site-brand" />
      ) : (
        <>
          {phase === "error" ? (
            <SiteButton
              type="button"
              onClick={() => void handleRecover()}
              variant="secondary"
              size="lg"
            >
              {t("paymentRecoverCta")}
            </SiteButton>
          ) : null}
          <SiteButtonLink href="/dashboard" size="lg">
            {t("paymentBackToPersonal")}
          </SiteButtonLink>
        </>
      )}
    </StatusScreen>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="public-world flex min-h-dvh items-center justify-center bg-site-bg">
          <SiteSpinner className="size-6 text-site-brand" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
