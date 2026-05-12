"use client";

import { useFcmToken } from "@/hooks/useFcmToken";

/** Requests notification permission and syncs FCM token after login. */
export function FcmTokenSync() {
  useFcmToken();
  return null;
}
