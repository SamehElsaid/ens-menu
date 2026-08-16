"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { axiosGet } from "@/shared/axiosCall";
import type { MenuStaffRole } from "@/types/Menu";

interface UseAccountStaffRoles {
  roles: MenuStaffRole[];
  loading: boolean;
  refresh: () => void;
}

/**
 * Staff roles of the whole account (RBAC). A role grants the same permissions
 * on every menu the staff member holds a grant for.
 */
export function useAccountStaffRoles(enabled = true): UseAccountStaffRoles {
  const locale = useLocale();
  const [roles, setRoles] = useState<MenuStaffRole[]>([]);
  const [resolvedRequest, setResolvedRequest] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const requestKey = `${locale}:${tick}`;
  const loading = enabled && resolvedRequest !== requestKey;

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    axiosGet<{ roles: MenuStaffRole[] }>("/dashboard/staff-roles", locale).then(
      (result) => {
        if (!active) return;
        setRoles(
          result.status && Array.isArray(result.data?.roles)
            ? result.data.roles
            : [],
        );
        setResolvedRequest(requestKey);
      },
    );
    return () => {
      active = false;
    };
  }, [locale, enabled, requestKey]);

  return { roles, loading, refresh };
}
