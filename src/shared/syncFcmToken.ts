import { axiosPost, axiosPut } from "@/shared/axiosCall";
import { isCurrentPublicHome } from "@/shared/isPublicHomePath";

interface FcmMatchResponse {
  matches?: boolean;
}

const FCM_CACHE_KEY = "ens_fcm_last_token";

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
  if (isCurrentPublicHome()) return null;
  const { getExistingFcmToken } = await import(
    "../../firebase/firebase-confing"
  );
  return getExistingFcmToken();
}

export async function finalizeFcmLogout(
  locale: string,
  sentToken: string | null,
): Promise<void> {
  const hadSyncedThisSession = _synced;
  clearCachedFcmToken();
  _synced = false;
  _pendingSync = null;
  if (!sentToken && hadSyncedThisSession) {
    await axiosPut("/user/profile", locale, { fcmToken: "" });
  }
}

/**
 * Syncs FCM token when permission is already granted.
 * Never runs on the public homepage and never requests permission.
 */
export function syncFcmToken(locale: string): Promise<void> {
  if (typeof window !== "undefined" && isCurrentPublicHome()) {
    return Promise.resolve();
  }
  if (_synced) return Promise.resolve();
  if (_pendingSync) return _pendingSync;

  _pendingSync = (async () => {
    try {
      const { getExistingFcmToken } = await import(
        "../../firebase/firebase-confing"
      );
      const fcmToken = await getExistingFcmToken();
      if (!fcmToken) return;

      cacheFcmToken(fcmToken);

      const matchRes = await axiosPost<{ fcmToken: string }, FcmMatchResponse>(
        "/auth/me/fcm-token-match",
        locale,
        { fcmToken },
      );
      if (!matchRes.status) return;

      if (matchRes.data?.matches === false) {
        const updateRes = await axiosPut("/user/profile", locale, {
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

export function resetFcmSync(): void {
  _synced = false;
  _pendingSync = null;
  clearCachedFcmToken();
}
