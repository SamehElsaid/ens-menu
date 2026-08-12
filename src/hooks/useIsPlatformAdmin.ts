"use client";

import { useAppSelector } from "@/store/hooks";

/**
 * Does the signed-in user hold the platform admin role?
 *
 * Distinct from `useAdminPermissions`, which answers *which* admin areas a known
 * admin may open. That hook's `hasFullAccess` is true for anyone without a
 * restriction record — including every merchant — so it cannot be used to decide
 * whether to advertise the back office at all.
 */
export function useIsPlatformAdmin(): boolean {
  const role = useAppSelector(
    (state) =>
      (
        state.auth as unknown as {
          data?: { user?: { role?: string } } | null;
        }
      ).data?.user?.role,
  );

  return role === "admin";
}
