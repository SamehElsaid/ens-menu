import parsePhoneNumberFromString from "libphonenumber-js";

export function formatEgpPrice(value: number): string {
  return value.toLocaleString("en-US");
}

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
