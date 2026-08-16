import {
  UNCategorized_CATEGORY_NAME_AR,
  UNCategorized_CATEGORY_NAME_EN,
} from "./constants";
import { resolveBilingualNames } from "./detectLanguage";
import { generateImportId } from "./generateImportId";
import { persistentOptionIdForLegacy } from "@/lib/optionIds";
import type {
  ImportCategory,
  ImportDraft,
  ImportDraftStats,
  ImportFlag,
  ImportItem,
  ImportVariant,
  NormalizeContext,
} from "@/types/menuImport";

/** Flexible AI payload — update when exact n8n schema is confirmed. */
type RawAiRecord = Record<string, unknown>;

export function normalizeAiResponse(
  raw: unknown,
  context: NormalizeContext,
): { draft: ImportDraft; parseErrors: string[] } {
  const parseErrors: string[] = [];
  const categories: ImportCategory[] = [];
  const uncategorizedItems: ImportItem[] = [];

  if (!raw || typeof raw !== "object") {
    parseErrors.push("invalid_root");
    return { draft: buildDraft(context, categories, uncategorizedItems), parseErrors };
  }

  const root = raw as RawAiRecord;
  const categoryNodes = extractCategoryNodes(root);

  if (categoryNodes.length === 0) {
    const rootItems = extractItemNodes(root.items ?? root.products ?? root.menu_items);
    if (rootItems.length > 0) {
      uncategorizedItems.push(...rootItems.map((node) => normalizeItem(node, parseErrors)));
    } else {
      parseErrors.push("no_categories_or_items");
    }
  } else {
    for (const node of categoryNodes) {
      const category = normalizeCategory(node, parseErrors);
      if (category) categories.push(category);
    }
  }

  if (uncategorizedItems.length > 0) {
    categories.push(buildUncategorizedCategory(uncategorizedItems));
  }

  return {
    draft: buildDraft(context, categories, []),
    parseErrors,
  };
}

function extractCategoryNodes(root: RawAiRecord): RawAiRecord[] {
  const candidates = [
    root.categories,
    root.sections,
    root.category,
    (root.menu as RawAiRecord | undefined)?.categories,
    (root.menu as RawAiRecord | undefined)?.sections,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is RawAiRecord => !!item && typeof item === "object",
      );
    }
  }
  return [];
}

function extractItemNodes(value: unknown): RawAiRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is RawAiRecord => !!item && typeof item === "object",
  );
}

function normalizeCategory(
  node: RawAiRecord,
  parseErrors: string[],
): ImportCategory | null {
  const explicitAr = pickString(node, ["nameAr", "name_ar", "nameArabic"]) ?? "";
  const explicitEn = pickString(node, ["nameEn", "name_en", "nameEnglish"]) ?? "";
  const fallback = pickString(node, ["name"]);

  const { nameAr, nameEn, flags: nameFlags } = resolveBilingualNames(
    explicitAr,
    explicitEn,
    fallback,
  );

  if (!nameAr && !nameEn) {
    parseErrors.push("category_missing_name");
  }

  const itemNodes = extractItemNodes(
    node.items ?? node.products ?? node.menu_items ?? node.dishes,
  );

  const items = itemNodes.map((itemNode) => normalizeItem(itemNode, parseErrors));

  const flags: ImportFlag[] = [...nameFlags];
  if (!nameAr && !nameEn) {
    flags.push("unknown_category");
  }

  return {
    id: generateImportId(),
    nameAr: nameAr || nameEn || UNCategorized_CATEGORY_NAME_AR,
    nameEn: nameEn || nameAr || UNCategorized_CATEGORY_NAME_EN,
    items,
    flags,
    isCollapsed: false,
  };
}

function normalizeItem(node: RawAiRecord, parseErrors: string[]): ImportItem {
  const explicitAr = pickString(node, ["nameAr", "name_ar", "nameArabic"]) ?? "";
  const explicitEn = pickString(node, ["nameEn", "name_en", "nameEnglish"]) ?? "";
  const fallback = pickString(node, ["name"]);

  const { nameAr, nameEn, flags: nameFlags } = resolveBilingualNames(
    explicitAr,
    explicitEn,
    fallback,
  );

  const descAr = pickString(node, ["descriptionAr", "description_ar"]);
  const descEn = pickString(node, ["descriptionEn", "description_en"]);
  const descFallback = pickString(node, ["description"]);

  let descriptionAr = descAr ?? undefined;
  let descriptionEn = descEn ?? undefined;
  if (descFallback && !descriptionAr && !descriptionEn) {
    if (isMostlyArabic(descFallback)) {
      descriptionAr = descFallback;
    } else {
      descriptionEn = descFallback;
    }
  }

  const hasTypedOptions =
    Array.isArray(node.sizes) || Array.isArray(node.variants);
  const sizeNodes = extractItemNodes(
    Array.isArray(node.sizes)
      ? node.sizes
      : !hasTypedOptions
        ? node.options
        : undefined,
  );
  const variantNodes = extractItemNodes(node.variants);
  const sizes: ImportVariant[] = sizeNodes.map((option, index) =>
    normalizeOption(option, "size", index),
  );
  const variants: ImportVariant[] = variantNodes.map((option, index) =>
    normalizeOption(option, "variant", index),
  );

  let price = pickNumber(node, ["price", "unitPrice", "unit_price"]);

  const flags: ImportFlag[] = [...nameFlags];

  if (!nameAr && !nameEn) {
    parseErrors.push("item_missing_name");
  }

  if (sizes.length > 0) {
    price = null;
  } else if (price === null) {
    flags.push("missing_price");
  }
  for (const option of [...sizes, ...variants]) {
    if (option.price === null && !option.flags.includes("missing_price")) {
      option.flags.push("missing_price");
    }
  }

  return {
    id: generateImportId(),
    nameAr,
    nameEn,
    descriptionAr,
    descriptionEn,
    price,
    sizes,
    variants,
    isAvailable: true,
    flags,
  };
}

function normalizeOption(
  node: RawAiRecord,
  kind: "size" | "variant",
  index: number,
): ImportVariant {
  const explicitAr =
    pickString(node, ["labelAr", "label_ar", "nameAr", "name_ar"]) ?? "";
  const explicitEn =
    pickString(node, ["labelEn", "label_en", "nameEn", "name_en"]) ?? "";
  const fallback =
    pickString(node, ["label", "name", "size"]) ?? "";

  const { nameAr: labelAr, nameEn: labelEn, flags: nameFlags } =
    resolveBilingualNames(explicitAr, explicitEn, fallback);

  const price = pickNumber(node, ["price", "unitPrice", "unit_price"]);
  const flags: ImportFlag[] = [...nameFlags];
  if (price === null) flags.push("missing_price");

  const label = labelAr || labelEn || fallback.trim();

  return {
    id: persistentOptionIdForLegacy(
      node.id ?? node.sizeId ?? node.variantId,
      `${kind}:${index}:${labelAr}:${labelEn}:${String(price ?? "")}`,
    ),
    label,
    labelAr: labelAr || undefined,
    labelEn: labelEn || undefined,
    price,
    flags,
  };
}

function isMostlyArabic(text: string): boolean {
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  if (arabic === 0 && latin === 0) return false;
  return arabic >= latin;
}

function buildUncategorizedCategory(items: ImportItem[]): ImportCategory {
  return {
    id: generateImportId(),
    nameAr: UNCategorized_CATEGORY_NAME_AR,
    nameEn: UNCategorized_CATEGORY_NAME_EN,
    items,
    flags: ["unknown_category"],
    isCollapsed: false,
  };
}

function buildDraft(
  context: NormalizeContext,
  categories: ImportCategory[],
  uncategorizedItems: ImportItem[],
): ImportDraft {
  const allCategories = [...categories];
  if (uncategorizedItems.length > 0) {
    allCategories.push(buildUncategorizedCategory(uncategorizedItems));
  }

  return {
    menuId: context.menuId,
    currency: context.currency,
    locale: context.locale,
    categories: allCategories,
    uncategorizedItems: [],
    stats: computeStats(allCategories),
    createdAt: new Date().toISOString(),
    sourceImage: context.sourceImage ?? null,
  };
}

function computeStats(categories: ImportCategory[]): ImportDraftStats {
  let itemCount = 0;
  let variantCount = 0;
  let warningCount = 0;
  let missingPriceCount = 0;
  let missingNameCount = 0;

  for (const category of categories) {
    warningCount += category.flags.length;
    missingNameCount += countNameFlags(category.flags);
    for (const item of category.items) {
      itemCount++;
      const options = [...(item.sizes ?? []), ...item.variants];
      variantCount += options.length;
      warningCount += item.flags.length;
      missingNameCount += countNameFlags(item.flags);

      if ((item.sizes?.length ?? 0) > 0) {
        for (const option of options) {
          warningCount += option.flags.length;
          missingNameCount += countNameFlags(option.flags);
          if (option.price === null || !Number.isFinite(option.price)) {
            missingPriceCount++;
          }
        }
      } else if (item.price === null || !Number.isFinite(item.price)) {
        missingPriceCount++;
        for (const variant of item.variants) {
          warningCount += variant.flags.length;
          missingNameCount += countNameFlags(variant.flags);
          if (variant.price === null || !Number.isFinite(variant.price)) {
            missingPriceCount++;
          }
        }
      } else {
        for (const variant of item.variants) {
          warningCount += variant.flags.length;
          missingNameCount += countNameFlags(variant.flags);
          if (variant.price === null || !Number.isFinite(variant.price)) {
            missingPriceCount++;
          }
        }
      }
    }
  }

  return {
    categoryCount: categories.length,
    itemCount,
    variantCount,
    warningCount,
    expandedItemCount: itemCount + variantCount,
    missingPriceCount,
    missingNameCount,
  };
}

function countNameFlags(flags: ImportFlag[]): number {
  return flags.filter(
    (f) => f === "missing_name_ar" || f === "missing_name_en",
  ).length;
}

function pickString(node: RawAiRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function pickNumber(node: RawAiRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = node[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^\d.]/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}
