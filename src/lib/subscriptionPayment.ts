import parsePhoneNumberFromString from "libphonenumber-js";
import type { ApiResponse } from "@/shared/axiosCall";

export { formatEgpPrice } from "@/lib/formatNumber";

/** Pro checkout uses EGP; normalize Egyptian mobiles to E.164 for gateways. */
export function formatPhoneForPaymentGateway(raw: string): string {
  const t = raw.trim().replace(/\s+/g, "");
  if (!t) return "";
  for (const cc of ["EG", "AE"] as const) {
    const p = parsePhoneNumberFromString(t, cc);
    if (p?.isValid()) return p.format("E.164");
  }
  const normalized = t.startsWith("+") ? t : `+${t.replace(/^00+/, "")}`;
  const fallback = parsePhoneNumberFromString(normalized);
  if (fallback?.isValid()) return fallback.format("E.164");
  return t;
}

export function pickFailedRequestMessage(data: unknown): string | null {
  if (data == null || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const fromError = typeof o.error === "string" ? o.error.trim() : "";
  if (fromError) return fromError;
  const fromMsg = typeof o.message === "string" ? o.message.trim() : "";
  if (fromMsg) return fromMsg;
  const details = o.details;
  if (Array.isArray(details)) {
    const first = details[0];
    if (
      first &&
      typeof first === "object" &&
      "message" in first &&
      typeof (first as { message: unknown }).message === "string"
    ) {
      return String((first as { message: string }).message).trim();
    }
  }
  return null;
}

export type PaymentVerificationResponse = {
  success?: boolean;
  data?: {
    payment_status?: string;
    paymentStatus?: string;
    redirect_status?: string;
    synced_from_redirect?: boolean;
    subscription_synced?: boolean;
    activation_status?: string | boolean;
    activationStatus?: string | boolean;
    activation_message?: string;
    activationMessage?: string;
    requires_activation?: boolean;
    requiresActivation?: boolean;
    payment_kind?: string;
    paymentKind?: string;
    order_id?: string;
    orderId?: string;
    value?: number;
    currency?: string;
  };
  error?: string;
  errorEn?: string;
  message?: string;
};

export type VerifiedPaymentPhase =
  | "success"
  | "pending"
  | "activation-pending"
  | "activation-failed"
  | "error";

export type PaymentVerificationContext = {
  knownSubscriptionCallback?: boolean;
};

function normalizedString(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isEntitlementKind(value: string): boolean {
  return /subscription|pro(?:-|_|$)|extra(?:-|_|\s)*menus?|renewal|upgrade/.test(
    value,
  );
}

function requiresEntitlementActivation(
  response: PaymentVerificationResponse,
  context?: PaymentVerificationContext,
): boolean {
  const data = response.data;
  const explicit = data?.requires_activation ?? data?.requiresActivation;
  if (typeof explicit === "boolean") return explicit;

  const paymentKind = normalizedString(
    data?.payment_kind ?? data?.paymentKind,
  );
  if (paymentKind) return isEntitlementKind(paymentKind);

  const activationStatus =
    data?.activation_status ?? data?.activationStatus;
  if (activationStatus !== null && activationStatus !== undefined) return true;

  return context?.knownSubscriptionCallback === true;
}

/**
 * Only the backend's canonical payment status can establish success. Redirect
 * query/status and sync flags are metadata and are intentionally ignored.
 */
export function getVerifiedPaymentPhase(
  response: PaymentVerificationResponse,
  context?: PaymentVerificationContext,
): VerifiedPaymentPhase {
  const status = normalizedString(
    response.data?.payment_status ?? response.data?.paymentStatus,
  );
  if (status === "completed") {
    const activationRequired = requiresEntitlementActivation(response, context);
    if (!activationRequired) return "success";

    const activationRaw =
      response.data?.activation_status ??
      response.data?.activationStatus;
    const activationStatus =
      activationRaw === true
        ? "completed"
        : activationRaw === false
          ? "failed"
          : normalizedString(activationRaw);
    if (["pending", "processing", "activating"].includes(activationStatus)) {
      return "activation-pending";
    }
    if (["failed", "error", "inactive"].includes(activationStatus)) {
      return "activation-failed";
    }
    if (
      !["completed", "active", "activated", "success"].includes(
        activationStatus,
      )
    ) {
      return "activation-pending";
    }
    return "success";
  }
  if (status === "pending") return "pending";
  return "error";
}

export async function recoverAndVerifyPayment(
  recover: () => Promise<ApiResponse<unknown>>,
  verify: () => Promise<ApiResponse<PaymentVerificationResponse>>,
): Promise<ApiResponse<PaymentVerificationResponse>> {
  const recovery = await recover();
  if (!recovery.status) {
    return {
      status: false,
      statusCode: recovery.statusCode,
      data: recovery.data as PaymentVerificationResponse | undefined,
    };
  }
  return verify();
}
