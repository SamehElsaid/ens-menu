import { encryptDataApi } from "@/shared/encryption";
import { decryptData } from "@/shared/encryption";
import type {
  ImportDraft,
  SaveMenuImportResponse,
  SaveImportErrorEntry,
} from "@/types/menuImport";
import {
  collectAllBlockingErrors,
  countExpandedItems,
} from "./draftSaveUtils";
import { refreshServerAccessToken } from "@/lib/server/refreshAccessToken";
import {
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

function buildSummary(
  draft: ImportDraft,
  counts: {
    categoriesAdded: number;
    categoriesReused: number;
    categoriesFailed: number;
    itemsAdded: number;
    itemsUpdated: number;
    itemsSkippedDuplicate: number;
    itemsFailed: number;
  },
) {
  const categoriesRequested = draft.categories.filter((c) => c.items.length > 0)
    .length;
  const itemsRequested = countExpandedItems(draft);

  return {
    categoriesRequested,
    categoriesSaved: counts.categoriesAdded + counts.categoriesReused,
    categoriesFailed: counts.categoriesFailed,
    itemsRequested,
    itemsSaved: counts.itemsAdded + counts.itemsUpdated,
    itemsFailed: counts.itemsFailed,
    categoriesAdded: counts.categoriesAdded,
    categoriesReused: counts.categoriesReused,
    itemsAdded: counts.itemsAdded,
    itemsSkippedDuplicate: counts.itemsSkippedDuplicate,
    itemsUpdated: counts.itemsUpdated,
  };
}

function emptySummary(draft: ImportDraft) {
  return buildSummary(draft, {
    categoriesAdded: 0,
    categoriesReused: 0,
    categoriesFailed: 0,
    itemsAdded: 0,
    itemsUpdated: 0,
    itemsSkippedDuplicate: 0,
    itemsFailed: 0,
  });
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
    return {
      ok: false,
      partial: false,
      summary: emptySummary(draft),
      errors: [],
      blockingErrors,
    };
  }

  if (!authToken) {
    return {
      ok: false,
      partial: false,
      summary: emptySummary(draft),
      errors: [
        {
          type: "category",
          reason: "unauthorized",
          message: "Missing auth token",
        },
      ],
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  const stats = countBulkSaveStats(draft);
  const payload = stats.payload;

  if (payload.length === 0) {
    return {
      ok: true,
      summary: buildSummary(draft, {
        categoriesAdded: 0,
        categoriesReused: 0,
        categoriesFailed: 0,
        itemsAdded: 0,
        itemsUpdated: 0,
        itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
        itemsFailed: 0,
      }),
      errors: [],
    };
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

  console.log("[MenuImport] Bulk save payload:", payload);

  try {
    const bulkRes = await authorizedFetch(
      `${baseUrl}/menus/${menuId}/categories/bulk`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    const bulkParsed = await parseJsonResponse(bulkRes);
    console.log("[MenuImport] Bulk save response:", {
      status: bulkRes.status,
      body: bulkParsed,
    });

    if (!bulkRes.ok) {
      const errors: SaveImportErrorEntry[] = [
        {
          type: "category",
          reason: bulkRes.status === 405 ? "token_expired" : "bulk_save_failed",
          message:
            typeof bulkParsed === "object" && bulkParsed !== null
              ? JSON.stringify(bulkParsed).slice(0, 500)
              : String(bulkParsed ?? "").slice(0, 500),
        },
      ];

      return {
        ok: false,
        partial: false,
        summary: buildSummary(draft, {
          categoriesAdded: 0,
          categoriesReused: 0,
          categoriesFailed: stats.categoriesInPayload,
          itemsAdded: 0,
          itemsUpdated: 0,
          itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
          itemsFailed: stats.itemsInPayload,
        }),
        errors,
        ...(refreshedSub ? { refreshedSub } : {}),
      };
    }

    return {
      ok: true,
      summary: buildSummary(draft, {
        categoriesAdded: stats.categoriesInPayload,
        categoriesReused: 0,
        categoriesFailed: 0,
        itemsAdded: stats.itemsAdded,
        itemsUpdated: stats.itemsUpdated,
        itemsSkippedDuplicate: stats.itemsSkippedDuplicate,
        itemsFailed: 0,
      }),
      errors: [],
      ...(refreshedSub ? { refreshedSub } : {}),
    };
  } catch (err) {
    return {
      ok: false,
      partial: false,
      summary: emptySummary(draft),
      errors: [
        {
          type: "category",
          reason: "network_error",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      ],
      ...(refreshedSub ? { refreshedSub } : {}),
    };
  }
}
