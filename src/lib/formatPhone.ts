/** Normalize phone for display/tel: — always puts + at the start (fixes RTL trailing +). */
export function normalizePhoneNumber(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";

  let phone = raw.trim().replace(/\s+/g, "");

  if (phone.endsWith("+") && !phone.startsWith("+")) {
    phone = `+${phone.slice(0, -1)}`;
  }

  if (phone.startsWith("+")) {
    const digits = phone.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "+";
  }

  const digits = phone.replace(/\D/g, "");
  if (!digits) return raw.trim();

  return `+${digits}`;
}

export const PHONE_DISPLAY_CLASS =
  "inline-block dir-ltr unicode-bidi-isolate tabular-nums text-start";
