/**
 * Plan feature strings often come from the API/DB in one language (e.g. Arabic).
 * Map known lines to personalProfile keys so they follow the active locale.
 */
const FEATURE_MAP: Record<string, string> = {
  // Arabic (common DB values)
  "3 منيو": "threeMenus",
  "200 منتج لكل قائمة": "products200",
  "تحكم في الإعلانات": "controlAds",
  "شامل التعديلات": "fullModifications",
  "منيو واحد": "oneMenu",
  "50 منتج": "products50",
  "بدون تعديلات": "noModifications",
  "إعلانات": "ads",
  "اعلانات": "ads",
  // English (if stored in DB)
  "3 menus": "threeMenus",
  "200 products per menu": "products200",
  "control over advertisements": "controlAds",
  "full modifications": "fullModifications",
  "one menu": "oneMenu",
  "50 products": "products50",
  "no modifications": "noModifications",
  advertisements: "ads",
};

function normalizeFeatureLine(raw: string): string {
  return raw
    .replace(/^✓\s*/u, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * @param t - useTranslations("personalProfile")
 */
export function translatePlanFeatureLine(
  raw: string,
  t: (key: string) => string,
): string {
  const key = FEATURE_MAP[normalizeFeatureLine(raw)];
  if (key) return t(key);
  return raw;
}
