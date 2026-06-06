import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encryptDataApi } from "@/shared/encryption";
import { refreshServerAccessToken } from "@/lib/server/refreshAccessToken";
import { fetchMenuSnapshot } from "@/lib/menuImport/menuSnapshot";
import { getBearerToken } from "@/lib/menuImport/executeMenuImportSave";

function buildServerApiKey(): string {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY as string;
  const utcTime = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTime}`;
  return encryptDataApi(apiKey, secretKey);
}

function buildHeaders(token: string, locale: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-API-KEY": buildServerApiKey(),
    "Accept-Language": locale,
    "Content-Type": "application/json",
  };
}

export async function GET(request: NextRequest) {
  try {
    const menuId = String(
      request.nextUrl.searchParams.get("menuId") ?? "",
    ).trim();
    const locale = String(
      request.nextUrl.searchParams.get("locale") ?? "ar",
    ).trim();

    if (!menuId) {
      return NextResponse.json({ error: "menuId is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sub = cookieStore.get("sub")?.value;
    const token = getBearerToken(sub);

    if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
    let currentToken = token;
    let refreshedSub: string | undefined;

    const authorizedFetch = async (url: string, init?: RequestInit) => {
      const doFetch = () =>
        fetch(url, {
          ...init,
          headers: buildHeaders(currentToken, locale),
        });
      let response = await doFetch();
      if (response.status === 405 && sub) {
        const refreshed = await refreshServerAccessToken(sub);
        if (refreshed) {
          currentToken = refreshed.accessToken;
          refreshedSub = refreshed.encryptedSub;
          response = await doFetch();
        }
      }
      return response;
    };

    const snapshot = await fetchMenuSnapshot(menuId, baseUrl, authorizedFetch);

    const response = NextResponse.json(snapshot, { status: 200 });
    if (refreshedSub) {
      response.cookies.set("sub", refreshedSub, { path: "/" });
    }
    return response;
  } catch (error) {
    console.error("[menu-import-existing] error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
