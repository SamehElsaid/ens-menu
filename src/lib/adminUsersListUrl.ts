export type AdminUsersListFilter =
  | "all"
  | "active"
  | "suspended"
  | "trial"
  | "free"
  | "pro"
  | "no-menu"
  | "inactive"
  | "on-homepage";

const VALID_FILTERS: AdminUsersListFilter[] = [
  "all",
  "active",
  "suspended",
  "trial",
  "free",
  "pro",
  "no-menu",
  "inactive",
  "on-homepage",
];

export function parseAdminUsersListFilter(
  value: string | null,
): AdminUsersListFilter {
  if (value && VALID_FILTERS.includes(value as AdminUsersListFilter)) {
    return value as AdminUsersListFilter;
  }
  return "all";
}

export function parseAdminUsersListPage(value: string | null): number {
  const parsed = parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function buildAdminUsersListPath(
  filter: AdminUsersListFilter,
  page: number,
  search: string,
): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (page > 1) params.set("page", String(page));
  const trimmedSearch = search.trim();
  if (trimmedSearch) params.set("search", trimmedSearch);
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

export function buildAdminUserDetailPath(
  userId: number | string,
  listPath: string,
): string {
  const params = new URLSearchParams({ list: listPath });
  return `/admin/users/${userId}?${params.toString()}`;
}

export function safeAdminUsersListReturnPath(raw: string | null): string {
  if (!raw) return "/admin/users";
  try {
    const decoded = decodeURIComponent(raw);
    if (
      decoded.startsWith("/admin/users") &&
      !decoded.includes("://") &&
      !decoded.startsWith("//")
    ) {
      return decoded;
    }
  } catch {
    // ignore malformed return path
  }
  return "/admin/users";
}
