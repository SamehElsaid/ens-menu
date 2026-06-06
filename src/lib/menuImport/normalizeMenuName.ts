/** Arabic diacritics (tashkeel) */
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670]/g;

/** Alef variants → ا */
const ALEF_VARIANTS = /[أإآ]/g;

/** Ta marbuta → ha (consistent one-way normalization) */
const TA_MARBUTA = /ة/g;

const EXTRA_SPACES = /\s+/g;

export function normalizeMenuName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(ARABIC_DIACRITICS, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(TA_MARBUTA, "ه")
    .replace(EXTRA_SPACES, " ")
    .trim();
}

export function menuNamesMatch(
  aAr: string,
  aEn: string,
  bAr: string,
  bEn: string,
): boolean {
  const pairs: [string, string][] = [
    [normalizeMenuName(aAr), normalizeMenuName(bAr)],
    [normalizeMenuName(aEn), normalizeMenuName(bEn)],
    [normalizeMenuName(aAr), normalizeMenuName(bEn)],
    [normalizeMenuName(aEn), normalizeMenuName(bAr)],
  ];

  for (const [left, right] of pairs) {
    if (left.length > 0 && right.length > 0 && left === right) {
      return true;
    }
  }
  return false;
}

export function pricesMatch(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01;
}
