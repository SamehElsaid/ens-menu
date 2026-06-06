export const MENU_IMPORT_MAX_FILE_SIZE_MB = 10;

/** Compress when the image exceeds this size */
export const MENU_IMPORT_COMPRESS_THRESHOLD_MB = 2;
export const MENU_IMPORT_COMPRESS_THRESHOLD_BYTES =
  MENU_IMPORT_COMPRESS_THRESHOLD_MB * 1024 * 1024;

/** Target size after compression before upload/analysis */
export const MENU_IMPORT_COMPRESSED_TARGET_MB = 1.5;
export const MENU_IMPORT_COMPRESSED_TARGET_BYTES =
  MENU_IMPORT_COMPRESSED_TARGET_MB * 1024 * 1024;

export const MENU_IMPORT_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export const MENU_IMPORT_ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.webp";

export const MENU_IMPORT_API_TIMEOUT_MS = 90_000;

/** Save can take longer (fetch existing + many items) */
export const MENU_IMPORT_SAVE_TIMEOUT_MS = 180_000;

/** Max parallel item create/update requests during import save */
export const MENU_IMPORT_SAVE_CONCURRENCY = 6;

export const UNCategorized_CATEGORY_NAME_AR = "غير مصنّف";
export const UNCategorized_CATEGORY_NAME_EN = "Uncategorized";
