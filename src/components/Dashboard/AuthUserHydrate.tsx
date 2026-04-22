"use client";

import { useHydrateAuthUser } from "@/hooks/useHydrateAuthUser";

/** Restores Redux user after refresh when `sub` cookie exists (see useHydrateAuthUser). */
export function AuthUserHydrate() {
  useHydrateAuthUser();
  return null;
}
