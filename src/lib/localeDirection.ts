export type AppLocale = "ar" | "en";

export type TextDirection = "rtl" | "ltr";

/** Document text direction from locale (`ar` → RTL, everything else → LTR). */
export function getDir(locale: string): TextDirection {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isRtlLocale(locale: string): boolean {
  return getDir(locale) === "rtl";
}
