export type ImportId = string;

export type ImportStep =
  | "upload"
  | "processing"
  | "review"
  | "error";

export type ImportFlag =
  | "missing_price"
  | "missing_name_ar"
  | "missing_name_en"
  | "duplicate"
  | "price_conflict"
  | "unknown_category"
  | "needs_review"
  | "parse_error";

export type DuplicateResolution = "skip" | "update_price" | "reuse";

export interface ImportDuplicateMeta {
  status: "exact_duplicate" | "price_conflict" | "new";
  existingItemId?: number;
  existingCategoryId?: number;
  existingPrice?: number;
  resolution?: DuplicateResolution;
}

export interface ImportVariant {
  id: ImportId;
  label: string;
  labelAr?: string;
  labelEn?: string;
  price: number | null;
  flags: ImportFlag[];
  duplicateMeta?: ImportDuplicateMeta;
}

export interface ImportItem {
  id: ImportId;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number | null;
  variants: ImportVariant[];
  isAvailable: boolean;
  imageUrl?: string;
  flags: ImportFlag[];
  duplicateMeta?: ImportDuplicateMeta;
}

export interface ImportCategory {
  id: ImportId;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  items: ImportItem[];
  flags: ImportFlag[];
  isCollapsed?: boolean;
  matchedCategoryId?: number;
  duplicateMeta?: ImportDuplicateMeta;
}

export interface ImportDraftStats {
  categoryCount: number;
  itemCount: number;
  variantCount: number;
  warningCount: number;
  expandedItemCount: number;
  missingPriceCount: number;
  missingNameCount: number;
}

export interface ImportDraft {
  menuId: string;
  currency: string;
  locale: "ar" | "en";
  categories: ImportCategory[];
  uncategorizedItems: ImportItem[];
  stats: ImportDraftStats;
  createdAt: string;
  sourceImage: { name: string; size: number } | null;
}

export interface ImportError {
  code:
    | "network"
    | "timeout"
    | "invalid_response"
    | "empty_result"
    | "validation"
    | "save_failed";
  message: string;
  detail?: string;
}

export interface MenuImportApiResponse {
  raw: unknown;
}

export interface NormalizeContext {
  menuId: string;
  currency: string;
  locale: "ar" | "en";
  sourceImage?: { name: string; size: number } | null;
}

export interface SaveBlockingError {
  refId: string;
  type: "item" | "variant" | "category";
  nameAr: string;
  nameEn: string;
  reason: "missing_price" | "missing_name_ar" | "missing_name_en" | "missing_name";
}

export interface SaveMenuImportRequest {
  menuId: string;
  locale: string;
  draft: ImportDraft;
}

export interface SaveImportErrorEntry {
  refId?: string;
  type: "category" | "item";
  nameAr?: string;
  nameEn?: string;
  reason: string;
  message?: string;
}

export interface SaveMenuImportSummary {
  categoriesRequested: number;
  categoriesSaved: number;
  categoriesFailed: number;
  itemsRequested: number;
  itemsSaved: number;
  itemsFailed: number;
  categoriesAdded: number;
  categoriesReused: number;
  itemsAdded: number;
  itemsSkippedDuplicate: number;
  itemsUpdated: number;
}

export interface SaveMenuImportResponse {
  ok: boolean;
  partial?: boolean;
  summary: SaveMenuImportSummary;
  errors: SaveImportErrorEntry[];
  blockingErrors?: SaveBlockingError[];
}

export interface ExpandedSaveItem {
  refId: string;
  sourceItemRefId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
  duplicateMeta?: ImportDuplicateMeta;
}

export interface BulkImportItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
  image?: string;
}

export interface BulkImportCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  imageUrl?: string;
  image?: string;
  items: BulkImportItem[];
}
