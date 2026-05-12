import { generateToken } from "../../firebase/firebase-confing";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";

interface FcmMatchResponse {
  matches?: boolean;
}

// Module-level promise — shared across all component instances.
// Guarantees at most one in-flight call per page load regardless of
// how many components call syncFcmToken at the same time.
let _pendingSync: Promise<void> | null = null;
let _synced = false;

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

      const matchRes = await axiosPost<{ fcmToken: string }, FcmMatchResponse>(
        "/auth/me/fcm-token-match",
        locale,
        { fcmToken },
      );
      console.log("[FCM] /auth/me/fcm-token-match response:", matchRes);

      if (matchRes.data?.matches === false) {
        const updateRes = await axiosPatch("/user/profile", locale, { fcmToken });
        console.log("[FCM] /user/profile update response:", updateRes);
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
}
