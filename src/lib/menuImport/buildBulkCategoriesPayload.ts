import type {
  BulkImportCategory,
  BulkImportItem,
  BulkImportPayload,
  BulkImportSize,
  BulkImportVariant,
  ImportDraft,
  ImportItem,
  ImportVariant,
  SaveImportErrorEntry,
  SaveMenuImportResponse,
} from "@/types/menuImport";
import {
  collectAllBlockingErrors,
  countExpandedItems,
} from "./draftSaveUtils";
import { persistentOptionIdForLegacy } from "@/lib/optionIds";

function shouldIncludeVariant(variant: ImportVariant): boolean {
  const meta = variant.duplicateMeta;
  if (!meta) return true;
  // Exact duplicates are always skipped
  if (meta.status === "exact_duplicate") return false;
  // Price conflicts are only saved when the user explicitly chose update
  if (meta.status === "price_conflict") {
    return meta.resolution === "update_price";
  }
  if (meta.resolution === "skip") return false;
  return true;
}

function shouldIncludeItem(item: ImportItem): boolean {
  if ((item.sizes?.length ?? 0) > 0) {
    return item.sizes!.some(
      (size) =>
        size.price !== null &&
        Number.isFinite(size.price) &&
        shouldIncludeVariant(size),
    );
  }

  if (item.price === null || !Number.isFinite(item.price)) return false;

  const meta = item.duplicateMeta;
  if (!meta) return true;
  if (meta.status === "exact_duplicate") return false;
  if (meta.status === "price_conflict") {
    return meta.resolution === "update_price";
  }
  if (meta.resolution === "skip") return false;
  return true;
}

function validIncludedOptions(options: ImportVariant[]): ImportVariant[] {
  return options.filter(
    (option) =>
      option.price !== null &&
      Number.isFinite(option.price) &&
      shouldIncludeVariant(option),
  );
}

function toBulkSize(
  variant: ImportVariant,
  namespace: string,
): BulkImportSize {
  const nameAr = (variant.labelAr ?? variant.label).trim();
  const nameEn = (variant.labelEn ?? variant.label).trim();
  return {
    id: persistentOptionIdForLegacy(variant.id, namespace),
    nameAr: nameAr || nameEn,
    nameEn: nameEn || nameAr,
    price: variant.price as number,
  };
}

function toBulkVariant(
  variant: ImportVariant,
  namespace: string,
): BulkImportVariant {
  const labelAr = (variant.labelAr ?? variant.label).trim();
  const labelEn = (variant.labelEn ?? variant.label).trim();
  return {
    id: persistentOptionIdForLegacy(variant.id, namespace),
    label: labelAr || labelEn,
    labelAr: labelAr || labelEn,
    labelEn: labelEn || labelAr,
    price: variant.price as number,
    flags: variant.flags,
  };
}

function toBulkItem(item: ImportItem, sortOrder: number): BulkImportItem | null {
  if (!shouldIncludeItem(item)) return null;

  const descriptionAr = item.descriptionAr?.trim();
  const descriptionEn = item.descriptionEn?.trim();

  const bulkItem: BulkImportItem = {
    id: item.id,
    nameAr: item.nameAr.trim() || item.nameEn.trim(),
    nameEn: item.nameEn.trim() || item.nameAr.trim(),
    ...(descriptionAr ? { descriptionAr } : {}),
    ...(descriptionEn ? { descriptionEn } : {}),
    isAvailable: item.isAvailable,
    available: item.isAvailable,
    sortOrder,
    flags: item.flags,
    ...(item.imageUrl
      ? { imageUrl: item.imageUrl, image: item.imageUrl }
      : {}),
  };

  const sizes = validIncludedOptions(item.sizes ?? []).map((size, index) =>
    toBulkSize(size, `size:${item.id}:${index}`),
  );
  const variants = validIncludedOptions(item.variants).map((variant, index) =>
    toBulkVariant(variant, `variant:${item.id}:${index}`),
  );

  if ((item.sizes?.length ?? 0) > 0) {
    if (sizes.length === 0) return null;
    return {
      ...bulkItem,
      price: item.price ?? 0,
      sizes,
      ...(variants.length > 0 ? { variants } : {}),
    };
  }

  return {
    ...bulkItem,
    price: item.price as number,
    ...(variants.length > 0 ? { variants } : {}),
  };
}

export function buildBulkCategoriesPayload(
  draft: ImportDraft,
): BulkImportCategory[] {
  const categories: BulkImportCategory[] = [];

  draft.categories.forEach((category, categoryIndex) => {
    const items: BulkImportItem[] = [];

    category.items.forEach((item, itemIndex) => {
      const bulkItem = toBulkItem(item, itemIndex);
      if (bulkItem) items.push(bulkItem);
    });

    categories.push({
      id: category.id,
      nameAr: category.nameAr.trim() || category.nameEn.trim(),
      nameEn: category.nameEn.trim() || category.nameAr.trim(),
      sortOrder: categoryIndex,
      isCollapsed: category.isCollapsed ?? false,
      flags: category.flags,
      ...(category.imageUrl
        ? { imageUrl: category.imageUrl, image: category.imageUrl }
        : {}),
      items,
    });
  });

  return categories;
}

export function buildBulkImportRequestBody(
  draft: ImportDraft,
): BulkImportPayload {
  return { categories: buildBulkCategoriesPayload(draft) };
}

export function countBulkSaveStats(draft: ImportDraft) {
  const payload = buildBulkCategoriesPayload(draft);
  const itemsInPayload = payload.reduce(
    (sum, category) => sum + category.items.length,
    0,
  );

  let itemsSkippedDuplicate = 0;
  let itemsUpdated = 0;
  let saveUnitsInPayload = 0;

  for (const category of draft.categories) {
    for (const item of category.items) {
      if (!shouldIncludeItem(item)) {
        itemsSkippedDuplicate++;
        continue;
      }
      saveUnitsInPayload++;
      if (item.duplicateMeta?.resolution === "update_price") {
        itemsUpdated++;
      }
    }
  }

  const itemsAdded = saveUnitsInPayload - itemsUpdated;
  const categoriesRequested = draft.categories.length;

  return {
    payload,
    requestBody: { categories: payload },
    categoriesRequested,
    categoriesInPayload: payload.length,
    itemsInPayload,
    itemsAdded,
    itemsUpdated,
    itemsSkippedDuplicate,
  };
}

export interface ConfirmSavePreview {
  categoriesInPayload: number;
  itemsInPayload: number;
  itemsAdded: number;
  itemsUpdated: number;
  itemsSkippedDuplicate: number;
  variantCount: number;
  missingPriceCount: number;
  avgPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  categoryBreakdown: { id: string; name: string; count: number }[];
}

export function computeConfirmSavePreview(
  draft: ImportDraft,
): ConfirmSavePreview {
  const bulk = countBulkSaveStats(draft);
  const prices: number[] = [];

  for (const category of bulk.payload) {
    for (const item of category.items) {
      if (item.sizes?.length) {
        for (const size of item.sizes) {
          if (Number.isFinite(size.price)) prices.push(size.price);
        }
      } else if (item.price != null && Number.isFinite(item.price)) {
        prices.push(item.price);
      }
    }
  }

  const categoryBreakdownRaw = bulk.payload
    .map((category) => ({
      id: category.id,
      name:
        (draft.locale === "ar" ? category.nameAr : category.nameEn) ||
        category.nameAr ||
        category.nameEn,
      count: category.items.length,
    }))
    .sort((a, b) => b.count - a.count);

  const categoryBreakdownMerged = new Map<
    string,
    { id: string; name: string; count: number }
  >();
  for (const category of categoryBreakdownRaw) {
    const mergeKey = category.name.trim().toLowerCase();
    const existing = categoryBreakdownMerged.get(mergeKey);
    if (existing) {
      existing.count += category.count;
    } else {
      categoryBreakdownMerged.set(mergeKey, { ...category });
    }
  }
  const categoryBreakdown = [...categoryBreakdownMerged.values()].sort(
    (a, b) => b.count - a.count,
  );

  return {
    categoriesInPayload: bulk.categoriesInPayload,
    itemsInPayload: bulk.itemsInPayload,
    itemsAdded: bulk.itemsAdded,
    itemsUpdated: bulk.itemsUpdated,
    itemsSkippedDuplicate: bulk.itemsSkippedDuplicate,
    variantCount: draft.stats.variantCount,
    missingPriceCount: draft.stats.missingPriceCount,
    avgPrice: prices.length
      ? prices.reduce((sum, price) => sum + price, 0) / prices.length
      : null,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    categoryBreakdown,
  };
}

function buildSummary(
  draft: ImportDraft,
  counts: {
    categoriesAdded: number;
    categoriesReused: number;
    categoriesFailed: number;
    itemsAdded: number;
    itemsUpdated: number;
    itemsSkippedDuplicate: number;
    itemsFailed: number;
  },
) {
  const categoriesRequested = draft.categories.length;
  const itemsRequested = countExpandedItems(draft);

  return {
    categoriesRequested,
    categoriesSaved: counts.categoriesAdded + counts.categoriesReused,
    categoriesFailed: counts.categoriesFailed,
    itemsRequested,
    itemsSaved: counts.itemsAdded + counts.itemsUpdated,
    itemsFailed: counts.itemsFailed,
    categoriesAdded: counts.categoriesAdded,
    categoriesReused: counts.categoriesReused,
    itemsAdded: counts.itemsAdded,
    itemsSkippedDuplicate: counts.itemsSkippedDuplicate,
    itemsUpdated: counts.itemsUpdated,
  };
}

function emptySummary(draft: ImportDraft) {
  return buildSummary(draft, {
    categoriesAdded: 0,
    categoriesReused: 0,
    categoriesFailed: 0,
    itemsAdded: 0,
    itemsUpdated: 0,
    itemsSkippedDuplicate: 0,
    itemsFailed: 0,
  });
}

export function buildMenuImportSaveResponse(
  draft: ImportDraft,
  options: {
    ok: boolean;
    partial?: boolean;
    stats?: ReturnType<typeof countBulkSaveStats>;
    errors?: SaveImportErrorEntry[];
    blockingErrors?: ReturnType<typeof collectAllBlockingErrors>;
    failed?: boolean;
  },
): SaveMenuImportResponse {
  const stats = options.stats ?? countBulkSaveStats(draft);

  if (options.blockingErrors?.length) {
    return {
      ok: false,
      partial: false,
      summary: emptySummary(draft),
      errors: [],
      blockingErrors: options.blockingErrors,
    };
  }

  if (options.ok) {
    return {
      ok: true,
      summary: buildSummary(draft, {
        categoriesAdded: stats.categoriesInPayload,
        categoriesReused: 0,
        categoriesFailed: 0,
        itemsAdded: stats.itemsAdded,
        itemsUpdated: stats.itemsUpdated,
        itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
        itemsFailed: 0,
      }),
      errors: options.errors ?? [],
    };
  }

  if (options.failed) {
    return {
      ok: false,
      partial: false,
      summary: buildSummary(draft, {
        categoriesAdded: 0,
        categoriesReused: 0,
        categoriesFailed: stats.categoriesInPayload,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
        itemsFailed: stats.itemsInPayload,
      }),
      errors: options.errors ?? [],
    };
  }

  return {
    ok: false,
    partial: options.partial ?? false,
    summary: emptySummary(draft),
    errors: options.errors ?? [],
  };
}
