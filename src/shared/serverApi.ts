import { decryptDataApi, encryptDataApi } from "@/shared/encryption";
import { headers } from "next/headers";

interface ApiResponse<T> {
  data?: T;
  status: boolean;
  httpStatus?: number;
  fetchError?: string;
}

function readSecretKey(): string {
  const raw = process.env.NEXT_PUBLIC_SECRET_KEY?.trim();
  if (!raw) return "";
  return raw.replace(/^["']|["']$/g, "");
}

async function resolveUtcTimestamp(): Promise<number> {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    if (!host) throw new Error("missing host");
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    const res = await fetch(`${proto}://${host}/api/utc-time`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("utc-time failed");
    const body = (await res.json()) as { fx_dyn?: string };
    const secretKey = readSecretKey();
    if (!body.fx_dyn || !secretKey) throw new Error("utc-time payload");
    const decoded = decryptDataApi(body.fx_dyn, secretKey);
    const n = Number(decoded);
    if (Number.isFinite(n)) return n;
  } catch {
    /* use local clock */
  }
  return parseFloat((Date.now() / 1000).toFixed(3));
}

async function buildServerApiKeyHeader(): Promise<string> {
  const secretKey = readSecretKey();
  if (!secretKey) {
    throw new Error("NEXT_PUBLIC_SECRET_KEY is not configured");
  }
  const utcTimestamp = await resolveUtcTimestamp();
  const apiKey = `${secretKey}///${utcTimestamp}`;
  return encryptDataApi(apiKey, secretKey);
}

/**
 * Server-only GET (RSC / layouts). Uses native fetch to avoid axios → follow-redirects url.parse() deprecation.
 */
export async function serverGet<T>(
  url: string,
  locale: string,
): Promise<ApiResponse<T>> {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  const requestUrl = `${baseUrl}${path}`;

  try {
    const apiKeyEncrypt = await buildServerApiKeyHeader();
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Accept-Language": locale,
        "X-API-KEY": apiKeyEncrypt,
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return {
        status: false,
        httpStatus: response.status,
        fetchError: "non-json-response",
      };
    }

    const data = (await response.json()) as T;
    return { data, status: response.ok, httpStatus: response.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch-failed";
    return { status: false, httpStatus: 0, fetchError: message };
  }
}
