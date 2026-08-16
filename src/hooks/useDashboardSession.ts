"use client";

import { useSyncExternalStore } from "react";
import { readAuthUiCookie } from "@/shared/authUiCookie";

export type DashboardSession = {
  role: string;
  /** Staff RBAC: permissions of the staff member's role. */
  permissions?: string[];
  /** Staff RBAC: assigned role id. */
  staffRoleId?: number;
  /** Staff RBAC: display name of the assigned role. */
  roleName?: string;
  /** Staff: menu UUID from login cookie — used when Redux menu is not loaded. */
  menuUuid?: string;
} | null;

function subscribeAuthUi(onStoreChange: () => void): () => void {
  const onChange = () => onStoreChange();
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

function getAuthUiSnapshot(): DashboardSession {
  return readAuthUiCookie();
}

function getServerAuthUiSnapshot(): DashboardSession {
  return null;
}

function subscribeClientReady(onStoreChange: () => void): () => void {
  void onStoreChange;
  return () => undefined;
}

/**
 * Reads the token-free `ens_ui` cookie (role + RBAC display hints).
 *
 * The cookie is only readable after mount, so `resolved` tells callers whether
 * `session` is a real answer or just the pre-read default. Anything that would
 * treat a missing session as "owner" must wait for `resolved`, otherwise a
 * staff member briefly renders owner-only UI and fires owner-only requests.
 */
export function useDashboardSessionState(): {
  session: DashboardSession;
  resolved: boolean;
} {
  const session = useSyncExternalStore(
    subscribeAuthUi,
    getAuthUiSnapshot,
    getServerAuthUiSnapshot,
  );
  const resolved = useSyncExternalStore(
    subscribeClientReady,
    () => true,
    () => false,
  );

  return { session, resolved };
}

export function useDashboardSession(): DashboardSession {
  return useDashboardSessionState().session;
}
