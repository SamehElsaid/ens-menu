import type { Category, Item } from "@/types/Menu";

export interface MenuSnapshotCategory {
  id: number;
  nameAr: string;
  nameEn: string;
}

export interface MenuSnapshotItem {
  id: number;
  categoryId: number;
  nameAr: string;
  nameEn: string;
  price: number;
}

export interface MenuSnapshot {
  categories: MenuSnapshotCategory[];
  items: MenuSnapshotItem[];
}

type AuthorizedFetch = (
  url: string,
  init?: RequestInit,
) => Promise<Response>;

function parseListPayload<T>(
  payload: unknown,
  listKeys: string[],
): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of listKeys) {
      const list = record[key];
      if (Array.isArray(list)) return list as T[];
    }
  }
  return [];
}

function getTotalPages(payload: unknown): number {
  if (payload && typeof payload === "object") {
    const pagination = (payload as { pagination?: { totalPages?: number } })
      .pagination;
    if (pagination?.totalPages && pagination.totalPages > 0) {
      return pagination.totalPages;
    }
  }
  return 1;
}

function mapCategory(raw: Category): MenuSnapshotCategory {
  return {
    id: raw.id,
    nameAr: String(raw.nameAr ?? raw.name ?? "").trim(),
    nameEn: String(raw.nameEn ?? raw.name ?? "").trim(),
  };
}

function mapItem(raw: Item): MenuSnapshotItem | null {
  const categoryId =
    raw.categoryId ??
    (typeof raw.category === "object" && raw.category?.id
      ? raw.category.id
      : undefined);
  if (!categoryId || !Number.isFinite(categoryId)) return null;

  return {
    id: raw.id,
    categoryId: Number(categoryId),
    nameAr: String(raw.nameAr ?? raw.name_ar ?? raw.name ?? "").trim(),
    nameEn: String(raw.nameEn ?? raw.name_en ?? raw.name ?? "").trim(),
    price: Number(raw.price) || 0,
  };
}

async function fetchAllPages<T>(
  basePath: string,
  listKeys: string[],
  authorizedFetch: AuthorizedFetch,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const separator = basePath.includes("?") ? "&" : "?";
    const res = await authorizedFetch(
      `${basePath}${separator}page=${page}&limit=500`,
      { method: "GET" },
    );
    if (!res.ok) break;

    const payload = (await res.json()) as unknown;
    const list = parseListPayload<T>(payload, listKeys);
    all.push(...list);
    totalPages = getTotalPages(payload);
    if (list.length === 0) break;
    page++;
  }

  return all;
}

export async function fetchMenuSnapshot(
  menuId: string,
  baseUrl: string,
  authorizedFetch: AuthorizedFetch,
): Promise<MenuSnapshot> {
  const rawCategories = await fetchAllPages<Category>(
    `${baseUrl}/menus/${menuId}/categories`,
    ["categories"],
    authorizedFetch,
  );

  const categories = rawCategories.map(mapCategory);

  if (categories.length === 0) {
    return { categories: [], items: [] };
  }

  const rawItems = await fetchAllPages<Item>(
    `${baseUrl}/menus/${menuId}/items`,
    ["items"],
    authorizedFetch,
  );

  return {
    categories,
    items: rawItems
      .map(mapItem)
      .filter((item): item is MenuSnapshotItem => item !== null),
  };
}
