import { encryptDataApi } from "@/shared/encryption";
import type {
  ImportDraft,
  SaveMenuImportResponse,
} from "@/types/menuImport";
import { collectAllBlockingErrors } from "./draftSaveUtils";
import {
  buildMenuImportSaveResponse,
  countBulkSaveStats,
} from "./buildBulkCategoriesPayload";
import { unexpectedRequestError } from "@/api/apiError";

function buildServerApiKey(): string {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY as string;
  const utcTime = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTime}`;
  return encryptDataApi(apiKey, secretKey);
}

function buildHeaders(
  cookieHeader: string,
  locale: string,
  csrfToken?: string | null,
  origin?: string | null,
) {
  return {
    Cookie: cookieHeader,
    "X-API-KEY": buildServerApiKey(),
    "Accept-Language": locale,
    "Content-Type": "application/json",
    ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...(origin ? { Origin: origin } : {}),
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
  cookieHeader: string | null,
  csrfToken?: string | null,
  origin?: string | null,
): Promise<SaveMenuImportResponse & { refreshedSub?: string }> {
  const blockingErrors = collectAllBlockingErrors(draft);
  if (blockingErrors.length > 0) {
    return buildMenuImportSaveResponse(draft, { ok: false, blockingErrors });
  }

  if (!cookieHeader) {
    return buildMenuImportSaveResponse(draft, {
      ok: false,
      errors: [
        {
          type: "category",
          reason: "unauthorized",
          message: "Missing authentication cookies",
        },
      ],
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
  const stats = countBulkSaveStats(draft);

  if (stats.payload.length === 0) {
    return buildMenuImportSaveResponse(draft, { ok: true, stats });
  }

  const authorizedFetch = async (
    url: string,
    init?: RequestInit,
  ): Promise<Response> => {
    return fetch(url, {
      ...init,
      headers: buildHeaders(cookieHeader, locale, csrfToken, origin),
      signal: init?.signal ?? AbortSignal.timeout(20_000),
    });
  };

  console.log("[MenuImport] Bulk save payload:", stats.requestBody);

  try {
    const bulkRes = await authorizedFetch(
      `${baseUrl}/menus/${menuId}/categories/bulk`,
      {
        method: "POST",
        body: JSON.stringify(stats.requestBody),
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

      const errorData =
        typeof bulkParsed === "object" && bulkParsed !== null
          ? (bulkParsed as { code?: string; error?: string; errorEn?: string })
          : undefined;
      const isBulkImportLimit = errorData?.code === "BULK_IMPORT_LIMIT";
      const isAccessTokenExpired =
        bulkRes.status === 401 &&
        errorData?.code === "ACCESS_TOKEN_EXPIRED";

      return {
        ...buildMenuImportSaveResponse(draft, {
          ok: false,
          failed: true,
          stats,
          errors: [
            {
              type: "category",
              reason: isBulkImportLimit
                ? "bulk_import_limit"
                : isAccessTokenExpired
                  ? "token_expired"
                  : "bulk_save_failed",
              message: isBulkImportLimit
                ? (errorData?.error ?? errorData?.errorEn ?? message)
                : message,
            },
          ],
        }),
      };
    }

    return {
      ...buildMenuImportSaveResponse(draft, { ok: true, stats }),
    };
  } catch (err) {
    return {
      ...buildMenuImportSaveResponse(draft, {
        ok: false,
        errors: [
          {
            type: "category",
            reason: "network_error",
            message:
              err instanceof Error
                ? err.message
                : unexpectedRequestError(locale),
          },
        ],
      }),
    };
  }
}
