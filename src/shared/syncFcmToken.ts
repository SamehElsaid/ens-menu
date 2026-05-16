import {
  generateToken,
  getExistingFcmToken,
} from "../../firebase/firebase-confing";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";

interface FcmMatchResponse {
  matches?: boolean;
}

const FCM_CACHE_KEY = "ens_fcm_last_token";

// Module-level promise — shared across all component instances.
// Guarantees at most one in-flight call per page load regardless of
// how many components call syncFcmToken at the same time.
let _pendingSync: Promise<void> | null = null;
let _synced = false;

function cacheFcmToken(token: string): void {
  try {
    sessionStorage.setItem(FCM_CACHE_KEY, token);
  } catch {
    /* private mode / quota */
  }
}

export function readCachedFcmToken(): string | null {
  try {
    return sessionStorage.getItem(FCM_CACHE_KEY);
  } catch {
    return null;
  }
}

function clearCachedFcmToken(): void {
  try {
    sessionStorage.removeItem(FCM_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

/** Token for logout body: session cache first, then Firebase (no permission prompt). */
export async function resolveFcmTokenForLogout(): Promise<string | null> {
  const cached = readCachedFcmToken();
  if (cached) return cached;
  return getExistingFcmToken();
}

/**
 * After POST /auth/logout: drop local sync state; if the server still has tokens
 * but this device could not resolve one, clear all stored tokens for this user.
 */
export async function finalizeFcmLogout(
  locale: string,
  sentToken: string | null,
): Promise<void> {
  const hadSyncedThisSession = _synced;
  clearCachedFcmToken();
  _synced = false;
  _pendingSync = null;
  if (!sentToken && hadSyncedThisSession) {
    await axiosPatch("/user/profile", locale, { fcmToken: "" });
  }
}

/**
 * Full FCM token sync flow (runs at most once per page load):
 * 1. Get the current FCM token (requests permission if not yet granted).
 * 2. POST /auth/me/fcm-token-match — check if the server has the same token.
 * 3. If matches === false → PATCH /user/profile to update the token on the server.
 */
export function syncFcmToken(locale: string): Promise<void> {
  if (_synced) return Promise.resolve();
  if (_pendingSync) return _pendingSync;

  _pendingSync = (async () => {
    try {
      const fcmToken = await generateToken();
      if (!fcmToken) return;

      cacheFcmToken(fcmToken);

      const matchRes = await axiosPost<{ fcmToken: string }, FcmMatchResponse>(
        "/auth/me/fcm-token-match",
        locale,
        { fcmToken },
      );
      if (!matchRes.status) return;

      if (matchRes.data?.matches === false) {
        const updateRes = await axiosPatch("/user/profile", locale, {
          fcmToken,
        });
        if (!updateRes.status) return;
      }

      _synced = true;
    } finally {
      _pendingSync = null;
    }
  })();

  return _pendingSync;
}

/** Reset — call after logout so the next login re-syncs. */
export function resetFcmSync(): void {
  _synced = false;
  _pendingSync = null;
  clearCachedFcmToken();
}
