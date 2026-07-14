import { axiosGet } from "@/shared/axiosCall";

type PaginatedPayload<T> = {
  categories?: T[];
  items?: T[];
  pagination?: { totalPages?: number };
};

const PAGE_LIMIT = 100;

/**
 * Loads every page for a dashboard list endpoint (categories/items).
 * API caps `limit` at 100.
 */
export async function fetchAllMenuPages<T>(
  basePath: string,
  listKey: "categories" | "items",
  locale: string,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const separator = basePath.includes("?") ? "&" : "?";
    const result = await axiosGet<PaginatedPayload<T>>(
      `${basePath}${separator}page=${page}&limit=${PAGE_LIMIT}`,
      locale,
    );

    if (!result.status || !result.data) break;

    const list = result.data[listKey] ?? [];
    all.push(...list);
    totalPages = Math.max(1, result.data.pagination?.totalPages ?? 1);
    if (list.length === 0) break;
    page += 1;
  }

  return all;
}
