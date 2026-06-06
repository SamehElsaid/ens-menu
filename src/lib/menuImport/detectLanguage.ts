import type { ImportFlag } from "@/types/menuImport";

/** Returns true when Arabic script dominates the string. */
export function isMostlyArabic(text: string): boolean {
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  if (arabic === 0 && latin === 0) return false;
  return arabic >= latin;
}

export function resolveBilingualNames(
  explicitAr: string,
  explicitEn: string,
  fallbackName?: string | null,
): { nameAr: string; nameEn: string; flags: ImportFlag[] } {
  let nameAr = explicitAr.trim();
  let nameEn = explicitEn.trim();
  const flags: ImportFlag[] = [];

  const fallback = fallbackName?.trim() ?? "";
  if (!nameAr && !nameEn && fallback) {
    if (isMostlyArabic(fallback)) {
      nameAr = fallback;
    } else {
      nameEn = fallback;
    }
  }

  if (nameAr && nameEn && nameAr === nameEn) {
    if (isMostlyArabic(nameAr)) {
      nameEn = "";
      flags.push("missing_name_en");
    } else {
      nameAr = "";
      flags.push("missing_name_ar");
    }
  } else {
    if (nameAr && !nameEn) flags.push("missing_name_en");
    if (nameEn && !nameAr) flags.push("missing_name_ar");
  }

  if (!nameAr && !nameEn) {
    flags.push("needs_review");
  }

  return { nameAr, nameEn, flags };
}
