"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import type {
  StaffPermissionCatalog,
  StaffPermissionCatalogEntry,
  StaffPermissionGroup,
} from "@/types/StaffPermission";

/** Module-level cache — the catalog is static, so fetch it at most once. */
let cachedCatalog: StaffPermissionCatalog | null = null;
let inflight: Promise<StaffPermissionCatalog | null> | null = null;

async function loadCatalog(locale: string): Promise<StaffPermissionCatalog | null> {
  if (cachedCatalog) return cachedCatalog;
  if (inflight) return inflight;

  inflight = (async () => {
    const result = await axiosGet<StaffPermissionCatalog>(
      "/staff-permissions/catalog",
      locale,
    );
    if (result.status && result.data && Array.isArray(result.data.permissions)) {
      cachedCatalog = {
        groups: result.data.groups ?? [],
        permissions: result.data.permissions,
      };
      return cachedCatalog;
    }
    return null;
  })();

  const value = await inflight;
  inflight = null;
  return value;
}

export interface UseStaffPermissionsCatalog {
  catalog: StaffPermissionCatalog | null;
  loading: boolean;
  /** Permissions grouped by their `group`, in catalog order. */
  byGroup: Record<string, StaffPermissionCatalogEntry[]>;
  groups: StaffPermissionGroup[];
}

export function useStaffPermissionsCatalog(): UseStaffPermissionsCatalog {
  const locale = useLocale();
  const [catalog, setCatalog] = useState<StaffPermissionCatalog | null>(
    cachedCatalog,
  );
  const [loading, setLoading] = useState(!cachedCatalog);

  useEffect(() => {
    let active = true;
    if (cachedCatalog) return;
    loadCatalog(locale).then((value) => {
      if (!active) return;
      setCatalog(value);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const byGroup: Record<string, StaffPermissionCatalogEntry[]> = {};
  const groups: StaffPermissionGroup[] = [];
  if (catalog) {
    for (const perm of catalog.permissions) {
      if (!byGroup[perm.group]) {
        byGroup[perm.group] = [];
        groups.push(perm.group);
      }
      byGroup[perm.group].push(perm);
    }
  }

  return { catalog, loading, byGroup, groups };
}

/** Expands selected keys to include their transitive dependencies (catalog order). */
export function expandWithDependencies(
  selected: string[],
  catalog: StaffPermissionCatalog | null,
): string[] {
  if (!catalog) return selected;
  const byKey = new Map(catalog.permissions.map((p) => [p.key, p]));
  const resolved = new Set<string>();
  const visit = (key: string) => {
    if (resolved.has(key)) return;
    const meta = byKey.get(key);
    if (!meta) return;
    resolved.add(key);
    for (const dep of meta.dependsOn) visit(dep);
  };
  for (const key of selected) visit(key);
  return catalog.permissions.filter((p) => resolved.has(p.key)).map((p) => p.key);
}

/** Keys that are required by at least one currently-selected permission. */
export function lockedDependencyKeys(
  selected: string[],
  catalog: StaffPermissionCatalog | null,
): Set<string> {
  const locked = new Set<string>();
  if (!catalog) return locked;
  const byKey = new Map(catalog.permissions.map((p) => [p.key, p]));
  const selectedSet = new Set(selected);
  const markDeps = (key: string) => {
    const meta = byKey.get(key);
    if (!meta) return;
    for (const dep of meta.dependsOn) {
      locked.add(dep);
      markDeps(dep);
    }
  };
  for (const key of selectedSet) markDeps(key);
  return locked;
}
