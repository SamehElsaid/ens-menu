import axios from "axios";
import Cookies from "js-cookie";
import { localePathPrefix, routing } from "@/i18n/routing";
import {
  decryptDataApi,
  encryptDataApi,
} from "./encryption";
import { resetFcmSync, resolveFcmTokenForLogout } from "./syncFcmToken";
import { clearAuthUiCookie } from "./authUiCookie";
import {
  clearStoredCsrfToken,
  getStoredCsrfToken,
  storeCsrfToken,
} from "./csrfToken";

async function getApiKey(): Promise<number> {
  try {
    const response = await fetch(`/api/utc-time`);
    const dataTime = await response.json();
    const utcTimestamp = dataTime.fx_dyn;
    return decryptDataApi(
      utcTimestamp,
      process.env.NEXT_PUBLIC_SECRET_KEY as string,
    ) as number;
  } catch {
    return Date.now() / 1000;
  }
}

function getLocaleFromPath(): string {
  if (typeof window === "undefined") return routing.defaultLocale;
  const segment = window.location.pathname.split("/")[1];
  if ((routing.locales as readonly string[]).includes(segment)) return segment;
  return routing.defaultLocale;
}

/** Clear session locally and notify the server; redirects to home. */
export async function performAuthLogout(): Promise<void> {
  const locale = getLocaleFromPath();
  try {
    const fcmToken = await resolveFcmTokenForLogout();
    const utcTime = await getApiKey();
    const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;
    const apiKeyEncrypt = encryptDataApi(
      apiKey,
      process.env.NEXT_PUBLIC_SECRET_KEY as string,
    );
    let csrfToken = getStoredCsrfToken();
    if (!csrfToken) {
      const csrfResponse = await axios.get<{ csrfToken?: string }>(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/csrf`,
        {
          withCredentials: true,
          headers: { "X-API-KEY": apiKeyEncrypt },
        },
      );
      csrfToken = csrfResponse.data.csrfToken ?? null;
      storeCsrfToken(csrfToken);
    }

    await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`,
      fcmToken ? { fcmToken } : {},
      {
        withCredentials: true,
        headers: {
          "Accept-Language": locale,
          "X-API-KEY": apiKeyEncrypt,
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      },
    );
  } catch {
    // logout locally even if the API call fails
  }

  resetFcmSync();
  clearStoredCsrfToken();
  clearAuthUiCookie();
  // Remove legacy browser-readable sessions left by pre-migration builds.
  Cookies.remove("sub", { path: "/" });

  const homePath = localePathPrefix(locale) || "/";
  window.location.href = homePath;
}
