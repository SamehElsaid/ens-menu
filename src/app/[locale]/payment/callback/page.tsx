"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { pushPurchaseEvent } from "@/shared/gtmEvents";
import { axiosGet, axiosPost, type ApiResponse } from "@/shared/axiosCall";
import StatusScreen, { type StatusTone } from "@/components/site/StatusScreen";
import { SiteButton, SiteButtonLink, SiteSpinner } from "@/components/site";
import {
  getVerifiedPaymentPhase,
  recoverAndVerifyPayment,
  type PaymentVerificationResponse,
} from "@/lib/subscriptionPayment";
import {
  clearPaymentAttempt,
  paymentKindToAttemptScope,
  shouldClearPaymentAttempt,
  type PaymentAttemptScope,
} from "@/lib/paymentIdempotency";

const verificationRequests = new Map<
  string,
  Promise<ApiResponse<PaymentVerificationResponse>>
>();

type PendingPurchase = {
  value?: number;
  currency?: string;
  scope?: PaymentAttemptScope;
};

function readPendingPurchase(): PendingPurchase | null {
  try {
    return JSON.parse(
      sessionStorage.getItem("gtm_pending_purchase") ?? "null",
    ) as PendingPurchase | null;
  } catch {
    return null;
  }
}

function paymentAttemptScope(
  data: PaymentVerificationResponse,
  pending: PendingPurchase | null,
): PaymentAttemptScope | null {
  return (
    paymentKindToAttemptScope(
      data.data?.payment_kind ?? data.data?.paymentKind,
    ) ??
    pending?.scope ??
    null
  );
}

function verificationKey(locale: string, params: Record<string, string>) {
  return `${locale}:${JSON.stringify(
    Object.entries(params).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  )}`;
}

function requestPaymentVerification(
  locale: string,
  params: Record<string, string>,
  force = false,
) {
  const key = verificationKey(locale, params);
  if (force) verificationRequests.delete(key);
  const existing = verificationRequests.get(key);
  if (existing) return existing;

  const request = axiosGet<PaymentVerificationResponse>(
    "/payment/redirect",
    locale,
    undefined,
    params,
  );
  if (verificationRequests.size >= 50) {
    const oldest = verificationRequests.keys().next().value;
    if (oldest) verificationRequests.delete(oldest);
  }
  verificationRequests.set(key, request);
  void request.then(undefined, () => {
    if (verificationRequests.get(key) === request) {
      verificationRequests.delete(key);
    }
  });
  return request;
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("personalProfile");
  const [phase, setPhase] = useState<
    | "loading"
    | "success"
    | "pending"
    | "activation-pending"
    | "activation-failed"
    | "verification-error"
    | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const recoveryInFlight = useRef(false);
  const resolving = phase === "loading";

  /* Counting only while verifying, so the interval stops the moment the verdict
     lands rather than ticking behind a resolved screen. */
  useEffect(() => {
    if (!resolving) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [resolving]);

  /* Focus the verdict when it arrives, so a keyboard user is not left on a
     spinner that has already been replaced. */
  useEffect(() => {
    if (phase === "loading") return;
    headingRef.current?.focus();
  }, [phase]);

  const redirectParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  const finishSuccess = useCallback(
    (data: PaymentVerificationResponse) => {
      const orderId = data.data?.order_id ?? data.data?.orderId;
      let value = Number(data.data?.value);
      let currency = data.data?.currency?.trim() || "EGP";
      const pending = readPendingPurchase();

      if (!Number.isFinite(value) || value <= 0) {
        if (pending?.value && pending.value > 0) {
          value = pending.value;
          currency = pending.currency?.trim() || "EGP";
        }
      }
      const scope = paymentAttemptScope(data, pending);
      if (scope) clearPaymentAttempt(scope);
      sessionStorage.removeItem("gtm_pending_purchase");

      if (Number.isFinite(value) && value > 0) {
        const dedupeKey = orderId
          ? `gtm_purchase_${orderId}`
          : `gtm_purchase_${verificationKey(locale, redirectParams)}`;
        if (!sessionStorage.getItem(dedupeKey)) {
          sessionStorage.setItem(dedupeKey, "1");
          pushPurchaseEvent({ value, currency });
        }
      }

      setPhase("success");
      setMessage(t("paymentResultSuccessPro"));
    },
    [locale, redirectParams, t],
  );

  const applyVerification = useCallback(
    (res: ApiResponse<PaymentVerificationResponse>) => {
      const data = res.data ?? {};
      if (!res.status) {
        setPhase("verification-error");
        setMessage(
          data.error ||
            data.errorEn ||
            data.message ||
            t("paymentVerificationUnavailable"),
        );
        return;
      }

      const verifiedPhase = getVerifiedPaymentPhase(data, {
        knownSubscriptionCallback: true,
      });
      if (verifiedPhase === "success") {
        finishSuccess(data);
        return;
      }
      if (verifiedPhase === "pending") {
        setPhase("pending");
        setMessage(t("paymentResultPending"));
        return;
      }
      if (verifiedPhase === "activation-pending") {
        setPhase("activation-pending");
        setMessage(
          data.data?.activation_message ||
            data.data?.activationMessage ||
            t("paymentActivationPending"),
        );
        return;
      }
      if (verifiedPhase === "activation-failed") {
        setPhase("activation-failed");
        setMessage(
          data.data?.activation_message ||
            data.data?.activationMessage ||
            t("paymentActivationFailed"),
        );
        return;
      }
      const paymentStatus = String(
        data.data?.payment_status ?? data.data?.paymentStatus ?? "",
      ).toLowerCase();
      if (shouldClearPaymentAttempt("error", paymentStatus)) {
        const scope = paymentAttemptScope(data, readPendingPurchase());
        if (scope) clearPaymentAttempt(scope);
        sessionStorage.removeItem("gtm_pending_purchase");
      }
      setPhase("error");
      setMessage(t("paymentResultFailed"));
    },
    [finishSuccess, t],
  );

  const applyVerificationFailure = useCallback(() => {
    setPhase("verification-error");
    setMessage(t("paymentVerificationUnavailable"));
  }, [t]);

  useEffect(() => {
    if (Object.keys(redirectParams).length === 0) {
      setPhase("error");
      setMessage(t("paymentResultNoCheckout"));
      return;
    }

    let cancelled = false;
    void requestPaymentVerification(locale, redirectParams).then(
      (res) => {
        if (!cancelled) applyVerification(res);
      },
      () => {
        if (!cancelled) applyVerificationFailure();
      },
    );

    return () => {
      cancelled = true;
    };
  }, [
    applyVerification,
    applyVerificationFailure,
    redirectParams,
    locale,
    t,
  ]);

  const handleRecover = async () => {
    if (recoveryInFlight.current) return;
    recoveryInFlight.current = true;
    setElapsed(0);
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

    try {
      const res = await recoverAndVerifyPayment(
        () =>
          axiosPost<{ orderId?: string }, { message?: string }>(
            "/user/subscription/recover-payment",
            locale,
            {
              orderId: orderId || undefined,
            },
          ),
        () => requestPaymentVerification(locale, redirectParams, true),
      );
      applyVerification(res);
    } catch {
      applyVerificationFailure();
    } finally {
      recoveryInFlight.current = false;
    }
  };

  const handleRecheck = async () => {
    if (recoveryInFlight.current) return;
    recoveryInFlight.current = true;
    setElapsed(0);
    setPhase("loading");
    try {
      applyVerification(
        await requestPaymentVerification(locale, redirectParams, true),
      );
    } catch {
      applyVerificationFailure();
    } finally {
      recoveryInFlight.current = false;
    }
  };

  /* The glyph carries the verdict, so it is the one thing a returning payer
     reads before anything else. */
  const { code, tone } = (
    {
      loading: { code: "···", tone: "brand" },
      success: { code: "✓", tone: "positive" },
      pending: { code: "⏳", tone: "warm" },
      "activation-pending": { code: "⏳", tone: "warm" },
      "activation-failed": { code: "!", tone: "danger" },
      "verification-error": { code: "!", tone: "danger" },
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
      phase={phase}
      live
      headingRef={headingRef}
      label={t("paymentResultTitle")}
      title={phase === "loading" ? t("paymentResultChecking") : message}
      body={phase === "success" ? t("yourPlanUpdateHint") : undefined}
      /* No fake progress bar. An honest elapsed count is the only thing that can
         truthfully say "still working" while a payment is being verified, and it
         only appears once the wait is long enough to worry about. */
      footNote={
        phase === "loading" && elapsed >= 5 ? (
          <span dir="ltr" className="tabular-nums">
            {elapsed}s
          </span>
        ) : undefined
      }
    >
      {phase === "loading" ? (
        <SiteSpinner className="size-6 text-site-brand" />
      ) : (
        <>
          {phase === "pending" ||
          phase === "activation-pending" ||
          phase === "verification-error" ? (
            <SiteButton
              type="button"
              onClick={() => void handleRecheck()}
              variant="secondary"
              size="lg"
            >
              {t("paymentRecheckCta")}
            </SiteButton>
          ) : null}
          {phase === "error" || phase === "activation-failed" ? (
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
