export function extractApiErrorMessage(
  data: unknown,
  locale: string,
  fallback = "",
): string {
  if (!data || typeof data !== "object") return fallback;

  const error = data as Record<string, unknown>;
  const localizedKeys =
    locale === "ar"
      ? ["errorAr", "messageAr", "error", "message"]
      : ["errorEn", "messageEn", "error", "message"];

  for (const key of localizedKeys) {
    const value = error[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return fallback;
}

export function unexpectedRequestError(locale: string): string {
  return locale === "ar"
    ? "تعذر إكمال الطلب. يرجى المحاولة مرة أخرى."
    : "The request could not be completed. Please try again.";
}

export function resolveApiErrorMessage(
  data: unknown,
  locale: string,
  fallback?: string,
): string {
  return extractApiErrorMessage(
    data,
    locale,
    fallback || unexpectedRequestError(locale),
  );
}
