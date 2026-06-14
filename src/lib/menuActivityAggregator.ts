import { axiosGet } from "@/shared/axiosCall";
import type {
  ActivityLogLabels,
  FetchMenuActivityLogParams,
  MenuAuditLogEntry,
  MenuAuditLogsPayload,
} from "@/types/menuAuditLog";
import type {
  Advertisement,
  Category,
  Item,
  Menu,
  MenuStaff,
  MenuTable,
} from "@/types/Menu";

const LIST_LIMIT = 500;

type ActivitySourceData = {
  categories: Category[];
  items: Item[];
  staff: MenuStaff[];
  tables: MenuTable[];
  ads: Advertisement[];
  menu: Menu | null;
};

function unwrapList<T>(
  data: T[] | Record<string, unknown> | null | undefined,
  key: string,
): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const nested = (data as Record<string, unknown>)[key];
  return Array.isArray(nested) ? (nested as T[]) : [];
}

function localizedName(
  locale: string,
  nameAr?: string,
  nameEn?: string,
  fallback?: string,
): string {
  const ar = nameAr?.trim();
  const en = nameEn?.trim();
  const fb = fallback?.trim();
  if (locale === "ar") return ar || en || fb || "—";
  return en || ar || fb || "—";
}

function itemName(item: Item, locale: string): string {
  return localizedName(
    locale,
    item.nameAr ?? item.name_ar,
    item.nameEn ?? item.name_en,
    item.name,
  );
}

function adTitle(ad: Advertisement, locale: string): string {
  return localizedName(
    locale,
    ad.titleAr ?? (ad as { title_ar?: string }).title_ar,
    ad.title,
    ad.contentAr ?? ad.content,
  );
}

function parseDate(value?: string | null): number | null {
  if (!value?.trim()) return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}

function isMeaningfulUpdate(createdAt?: string, updatedAt?: string): boolean {
  const created = parseDate(createdAt);
  const updated = parseDate(updatedAt);
  if (created == null || updated == null) return false;
  return updated - created > 60_000;
}

function makeEntry(
  partial: Omit<MenuAuditLogEntry, "createdAt"> & {
    date?: string | null;
  },
): MenuAuditLogEntry {
  const hasDate = Boolean(partial.date?.trim());
  const { date, ...rest } = partial;
  return {
    ...rest,
    createdAt: hasDate ? date! : "",
    isUndated: !hasDate,
  };
}

export function buildActivityEntriesFromSources(
  data: ActivitySourceData,
  locale: string,
  labels: ActivityLogLabels,
): MenuAuditLogEntry[] {
  const entries: MenuAuditLogEntry[] = [];

  for (const cat of data.categories) {
    const name = localizedName(locale, cat.nameAr, cat.nameEn);
    entries.push(
      makeEntry({
        id: `category-created-${cat.id}`,
        actionType: "CATEGORY_CREATED",
        title: labels.categoryCreated(name),
        entityType: "category",
        entityName: name,
        date: cat.createdAt ?? cat.updatedAt ?? null,
      }),
    );
    if (isMeaningfulUpdate(cat.createdAt, cat.updatedAt)) {
      entries.push(
        makeEntry({
          id: `category-updated-${cat.id}`,
          actionType: "CATEGORY_UPDATED",
          title: labels.categoryUpdated(name),
          entityType: "category",
          entityName: name,
          date: cat.updatedAt ?? null,
        }),
      );
    }
  }

  for (const item of data.items) {
    const name = itemName(item, locale);
    entries.push(
      makeEntry({
        id: `item-created-${item.id}`,
        actionType: "ITEM_CREATED",
        title: labels.itemCreated(name),
        entityType: "item",
        entityName: name,
        date: item.createdAt ?? item.updatedAt ?? null,
      }),
    );
    if (isMeaningfulUpdate(item.createdAt, item.updatedAt)) {
      entries.push(
        makeEntry({
          id: `item-updated-${item.id}`,
          actionType: "ITEM_UPDATED",
          title: labels.itemUpdated(name),
          entityType: "item",
          entityName: name,
          date: item.updatedAt ?? null,
        }),
      );
    }
  }

  for (const member of data.staff) {
    const name = member.name?.trim() || "—";
    entries.push(
      makeEntry({
        id: `staff-created-${member.id}`,
        actionType: "STAFF_CREATED",
        title: labels.staffCreated(name),
        entityType: "staff",
        entityName: name,
        date: member.createdAt ?? null,
      }),
    );
  }

  for (const table of data.tables) {
    const number = String(table.tableNumber ?? table.id).trim() || "—";
    entries.push(
      makeEntry({
        id: `table-created-${table.id}`,
        actionType: "TABLE_CREATED",
        title: labels.tableCreated(number),
        entityType: "table",
        entityName: number,
        date: table.createdAt ?? null,
      }),
    );
  }

  for (const ad of data.ads) {
    const title = adTitle(ad, locale);
    const adId = ad.id ?? title;
    entries.push(
      makeEntry({
        id: `ad-created-${adId}`,
        actionType: "AD_CREATED",
        title: labels.adCreated(title),
        entityType: "ad",
        entityName: title,
        date: ad.createdAt ?? ad.updatedAt ?? null,
      }),
    );
    if (isMeaningfulUpdate(ad.createdAt, ad.updatedAt)) {
      entries.push(
        makeEntry({
          id: `ad-updated-${adId}`,
          actionType: "AD_UPDATED",
          title: labels.adUpdated(title),
          entityType: "ad",
          entityName: title,
          date: ad.updatedAt ?? null,
        }),
      );
    }
  }

  if (data.menu && isMeaningfulUpdate(data.menu.createdAt, data.menu.updatedAt)) {
    entries.push(
      makeEntry({
        id: `settings-updated-${data.menu.id}`,
        actionType: "SETTINGS_UPDATED",
        title: labels.settingsUpdated,
        entityType: "settings",
        entityName: null,
        date: data.menu.updatedAt ?? null,
      }),
    );
  }

  return entries;
}

function sortActivityEntries(entries: MenuAuditLogEntry[]): MenuAuditLogEntry[] {
  return [...entries].sort((a, b) => {
    if (a.isUndated && !b.isUndated) return 1;
    if (!a.isUndated && b.isUndated) return -1;
    if (a.isUndated && b.isUndated) return a.title.localeCompare(b.title);
    return parseDate(b.createdAt)! - parseDate(a.createdAt)!;
  });
}

function filterActivityEntries(
  entries: MenuAuditLogEntry[],
  q?: string,
): MenuAuditLogEntry[] {
  const query = q?.trim().toLowerCase();
  if (!query) return entries;
  return entries.filter((entry) => {
    const haystack = [
      entry.title,
      entry.description,
      entry.entityName,
      entry.actionType,
      entry.entityType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

function paginateActivityEntries(
  entries: MenuAuditLogEntry[],
  page: number,
  limit: number,
): MenuAuditLogsPayload {
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;

  return {
    total,
    page: safePage,
    limit,
    totalPages,
    entries: entries.slice(start, start + limit),
  };
}

export type FetchActivitySourceOptions = {
  /** When false, skips Pro-only endpoints (staff, tables, ads). */
  includeProSources?: boolean;
};

export async function fetchActivitySourceData(
  menuId: string,
  locale: string,
  options: FetchActivitySourceOptions = {},
): Promise<ActivitySourceData> {
  const includeProSources = options.includeProSources !== false;

  const [categoriesRes, itemsRes, menuRes] = await Promise.all([
    axiosGet<{ categories?: Category[] } | Category[]>(
      `/menus/${menuId}/categories`,
      locale,
      undefined,
      { page: 1, limit: LIST_LIMIT },
    ),
    axiosGet<{ items?: Item[] } | Item[]>(
      `/menus/${menuId}/items`,
      locale,
      undefined,
      { page: 1, limit: LIST_LIMIT },
    ),
    axiosGet<Menu>(`/menus/${menuId}`, locale),
  ]);

  let staff: MenuStaff[] = [];
  let tables: MenuTable[] = [];
  let ads: Advertisement[] = [];

  if (includeProSources) {
    const [staffRes, tablesRes, adsRes] = await Promise.all([
      axiosGet<MenuStaff[] | { staff?: MenuStaff[] }>(
        `/menus/${menuId}/staff`,
        locale,
        undefined,
        undefined,
        undefined,
        true,
      ),
      axiosGet<MenuTable[] | { tables?: MenuTable[] }>(
        `/menus/${menuId}/tables`,
        locale,
        undefined,
        undefined,
        undefined,
        true,
      ),
      axiosGet<{
        data?: { ads?: Advertisement[] };
        ads?: Advertisement[];
      }>(
        `/menus/${menuId}/ads`,
        locale,
        undefined,
        { page: 1, limit: LIST_LIMIT },
        undefined,
        true,
      ),
    ]);

    staff = staffRes.status ? unwrapList(staffRes.data, "staff") : [];
    tables = tablesRes.status ? unwrapList(tablesRes.data, "tables") : [];

    if (adsRes.status && adsRes.data) {
      const raw = adsRes.data;
      if (raw.data?.ads?.length) {
        ads = raw.data.ads;
      } else {
        ads = unwrapList(raw as { ads?: Advertisement[] }, "ads");
      }
    }
  }

  const categories = categoriesRes.status
    ? unwrapList(categoriesRes.data, "categories")
    : [];
  const items = itemsRes.status ? unwrapList(itemsRes.data, "items") : [];
  const menu = menuRes.status && menuRes.data ? menuRes.data : null;

  return { categories, items, staff, tables, ads, menu };
}

export async function fetchAggregatedMenuActivityLog(
  menuId: string,
  locale: string,
  labels: ActivityLogLabels,
  params: FetchMenuActivityLogParams = {},
  sourceOptions?: FetchActivitySourceOptions,
): Promise<MenuAuditLogsPayload> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  const sources = await fetchActivitySourceData(menuId, locale, sourceOptions);
  const built = buildActivityEntriesFromSources(sources, locale, labels);
  const sorted = sortActivityEntries(built);
  const filtered = filterActivityEntries(sorted, params.q);

  return paginateActivityEntries(filtered, page, limit);
}
