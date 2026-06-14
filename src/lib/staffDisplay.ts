export function getStaffInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function normalizeStaffRole(role: string | undefined): string {
  return String(role ?? "")
    .trim()
    .toLowerCase();
}

export function isCashierRole(role: string | undefined): boolean {
  const r = normalizeStaffRole(role);
  return r === "cashier" || r === "casher";
}

export function isWaiterRole(role: string | undefined): boolean {
  return normalizeStaffRole(role) === "waiter";
}
