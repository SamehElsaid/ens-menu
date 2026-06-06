import { encryptDataApi } from "@/shared/encryption";
import { decryptData } from "@/shared/encryption";
import type {
  ImportDraft,
  SaveMenuImportResponse,
} from "@/types/menuImport";
import { collectAllBlockingErrors } from "./draftSaveUtils";
import { refreshServerAccessToken } from "@/lib/server/refreshAccessToken";
import {
  buildMenuImportSaveResponse,
  countBulkSaveStats,
} from "./buildBulkCategoriesPayload";

function buildServerApiKey(): string {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY as string;
  const utcTime = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTime}`;
  return encryptDataApi(apiKey, secretKey);
}

export function getBearerToken(subCookie: string | undefined): string | null {
  if (!subCookie) return null;
  const decoded = decryptData(subCookie) as { token?: string };
  return decoded?.token ?? null;
}

function buildHeaders(token: string, locale: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-API-KEY": buildServerApiKey(),
    "Accept-Language": locale,
    "Content-Type": "application/json",
  };
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { parseError: true, preview: text.slice(0, 300) };
  }
}

export async function executeMenuImportSave(
  draft: ImportDraft,
  menuId: string,
  locale: string,
  authToken: string | null,
  subCookie?: string | null,
): Promise<SaveMenuImportResponse & { refreshedSub?: string }> {
  const blockingErrors = collectAllBlockingErrors(draft);
  if (blockingErrors.length > 0) {
    return buildMenuImportSaveResponse(draft, { ok: false, blockingErrors });
  }

  if (!authToken) {
    return buildMenuImportSaveResponse(draft, {
      ok: false,
      errors: [
        {
          type: "category",
          reason: "unauthorized",
          message: "Missing auth token",
        },
      ],
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  const stats = countBulkSaveStats(draft);

  if (stats.payload.length === 0) {
    return buildMenuImportSaveResponse(draft, { ok: true, stats });
  }

  let currentToken = authToken;
  let refreshedSub: string | undefined;

  const authorizedFetch = async (
    url: string,
    init?: RequestInit,
  ): Promise<Response> => {
    const doFetch = () =>
      fetch(url, {
        ...init,
        headers: buildHeaders(currentToken!, locale),
      });

    let response = await doFetch();
    if (response.status === 405 && subCookie) {
      const refreshed = await refreshServerAccessToken(subCookie);
      if (refreshed) {
        currentToken = refreshed.accessToken;
        refreshedSub = refreshed.encryptedSub;
        response = await doFetch();
      }
    }
    return response;
  };

  console.log("[MenuImport] Bulk save payload:", stats.payload);

  try {
    const bulkRes = await authorizedFetch(
      `${baseUrl}/menus/${menuId}/categories/bulk`,
      {
        method: "POST",
        body: JSON.stringify(stats.payload),
      },
    );

    const bulkParsed = await parseJsonResponse(bulkRes);
    console.log("[MenuImport] Bulk save response:", {
      status: bulkRes.status,
      body: bulkParsed,
    });

    if (!bulkRes.ok) {
      const message =
        typeof bulkParsed === "object" && bulkParsed !== null
          ? JSON.stringify(bulkParsed).slice(0, 500)
          : String(bulkParsed ?? "").slice(0, 500);

      return {
        ...buildMenuImportSaveResponse(draft, {
          ok: false,
          failed: true,
          stats,
          errors: [
            {
              type: "category",
              reason:
                bulkRes.status === 405 ? "token_expired" : "bulk_save_failed",
              message,
            },
          ],
        }),
        ...(refreshedSub ? { refreshedSub } : {}),
      };
    }

    return {
      ...buildMenuImportSaveResponse(draft, { ok: true, stats }),
      ...(refreshedSub ? { refreshedSub } : {}),
    };
  } catch (err) {
    return {
      ...buildMenuImportSaveResponse(draft, {
        ok: false,
        errors: [
          {
            type: "category",
            reason: "network_error",
            message: err instanceof Error ? err.message : "Unknown error",
          },
        ],
      }),
      ...(refreshedSub ? { refreshedSub } : {}),
    };
  }
}
