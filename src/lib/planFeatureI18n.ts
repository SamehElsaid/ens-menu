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
 * Bullet lines from DB that describe only menu count — replaced by Plans.maxMenus in the UI.
 */
export function isMenuCountOnlyFeatureLine(raw: string): boolean {
  const normalized = normalizeFeatureLine(raw);
  const mappedKey = FEATURE_MAP[normalized];
  if (mappedKey === "threeMenus" || mappedKey === "oneMenu") {
    return true;
  }
  if (/^\d+\s*منيو$/.test(normalized)) {
    return true;
  }
  if (/^\d+\s*menus?$/.test(normalized)) {
    return true;
  }
  return false;
}

/**
 * Drops stale DB menu-count lines and prepends one line from `maxMenus` (truth from Plans).
 *
 * @param tPersonal useTranslations("personalProfile") — must include menusLimitFeature
 */
export function translatePlanFeaturesWithMenuLimit(
  features: string[] | undefined,
  maxMenus: number | undefined | null,
  // next-intl Translator — keep loose to match library typings
  tPersonal: (key: string, values?: Record<string, any>) => string,
): string[] {
  const filtered = (features ?? []).filter(
    (line) => !isMenuCountOnlyFeatureLine(line),
  );
  const mapped = filtered.map((line) =>
    translatePlanFeatureLine(line, (key) => tPersonal(key)),
  );
  const n = maxMenus == null ? NaN : Number(maxMenus);
  if (!Number.isFinite(n) || n <= 0) {
    return mapped;
  }
  const head = tPersonal("menusLimitFeature", { count: n });
  return [head, ...mapped];
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
