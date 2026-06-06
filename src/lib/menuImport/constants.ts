export const MENU_IMPORT_MAX_FILE_SIZE_MB = 10;

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
