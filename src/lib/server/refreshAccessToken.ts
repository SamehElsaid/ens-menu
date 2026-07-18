import {
  decryptData,
  encryptData,
  encryptDataApi,
} from "@/shared/encryption";
import type { LoginResponse } from "@/types/LoginResponse";

export function buildEncryptedApiKey(): string {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY as string;
  const utcTime = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTime}`;
  return encryptDataApi(apiKey, secretKey);
}

export async function refreshServerAccessToken(
  subCookie: string,
): Promise<{ accessToken: string; encryptedSub: string } | null> {
  const tokenDecrypted = decryptData(subCookie) as {
    token: string;
    role: string;
    refreshToken: string;
  };

  if (!tokenDecrypted.refreshToken || tokenDecrypted.role === "staff") {
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  const response = await fetch(`${baseUrl}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": buildEncryptedApiKey(),
    },
    body: JSON.stringify({ refreshToken: tokenDecrypted.refreshToken }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as LoginResponse;
  if (!data.accessToken) return null;

  const newCookies: Record<string, unknown> = {
    token: data.accessToken,
    refreshToken: data.refreshToken,
    role: tokenDecrypted.role ?? "",
  };

  return {
    accessToken: data.accessToken,
    encryptedSub: encryptData(newCookies),
  };
}
