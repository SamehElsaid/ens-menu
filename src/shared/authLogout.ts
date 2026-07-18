import axios from "axios";
import Cookies from "js-cookie";
import { localePathPrefix, routing } from "@/i18n/routing";
import {
  decryptData,
  decryptDataApi,
  encryptDataApi,
} from "./encryption";
import { resetFcmSync, resolveFcmTokenForLogout } from "./syncFcmToken";

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
  const sub = Cookies.get("sub");

  if (sub) {
    try {
      const decrypted = decryptData(sub) as { refreshToken?: string };
      const fcmToken = await resolveFcmTokenForLogout();
      const utcTime = await getApiKey();
      const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;
      const apiKeyEncrypt = encryptDataApi(
        apiKey,
        process.env.NEXT_PUBLIC_SECRET_KEY as string,
      );

      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`,
        {
          refreshToken: decrypted?.refreshToken ?? "",
          ...(fcmToken ? { fcmToken } : {}),
        },
        {
          withCredentials: true,
          headers: {
            "Accept-Language": locale,
            "X-API-KEY": apiKeyEncrypt,
          },
        },
      );
    } catch {
      // logout locally even if the API call fails
    }
  }

  resetFcmSync();
  Cookies.remove("sub", { path: "/" });

  const homePath = localePathPrefix(locale) || "/";
  window.location.href = homePath;
}
