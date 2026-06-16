import axios from "axios";
import { axiosPost } from "@/shared/axiosCall";
import type {
  BulkImportPayload,
  ImportDraft,
  MenuImportApiResponse,
  SaveMenuImportResponse,
} from "@/types/menuImport";
import { MENU_IMPORT_API_TIMEOUT_MS } from "@/lib/menuImport/constants";
import { formatImageSizeLog } from "@/lib/menuImport/formatImageSize";
import type { MenuSnapshot } from "@/lib/menuImport/menuSnapshot";
import { collectAllBlockingErrors } from "@/lib/menuImport/draftSaveUtils";
import {
  buildMenuImportSaveResponse,
  countBulkSaveStats,
} from "@/lib/menuImport/buildBulkCategoriesPayload";

const MENU_IMPORT_API_URL = "/api/menu-import";
const MENU_IMPORT_EXISTING_URL = "/api/menu-import/existing";

export async function analyzeMenuImage(
  file: File,
  menuId: string,
  locale: string,
): Promise<MenuImportApiResponse> {
  console.log("[MenuImport] Image before upload:", {
    menuId,
    locale,
    fileName: file.name,
    mimeType: file.type,
    ...formatImageSizeLog(file.size),
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("menuId", menuId);
  formData.append("locale", locale);

  const response = await axios.post<MenuImportApiResponse>(
    MENU_IMPORT_API_URL,
    formData,
    {
      timeout: MENU_IMPORT_API_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    },
  );

  return response.data;
}

export async function fetchExistingMenuSnapshot(
  menuId: string,
  locale: string,
): Promise<MenuSnapshot> {
  const response = await axios.get<MenuSnapshot>(MENU_IMPORT_EXISTING_URL, {
    params: { menuId, locale },
    timeout: MENU_IMPORT_API_TIMEOUT_MS,
    headers: { Accept: "application/json" },
  });
  return response.data;
}

export async function saveMenuImportDraft(
  menuId: string,
  locale: string,
  draft: ImportDraft,
): Promise<SaveMenuImportResponse> {
  const blockingErrors = collectAllBlockingErrors(draft);
  if (blockingErrors.length > 0) {
    return buildMenuImportSaveResponse(draft, { ok: false, blockingErrors });
  }

  const stats = countBulkSaveStats(draft);

  if (stats.payload.length === 0) {
    return buildMenuImportSaveResponse(draft, { ok: true, stats });
  }

  console.log("[MenuImport] Bulk save payload:", stats.requestBody);

  const result = await axiosPost<BulkImportPayload, unknown>(
    `/menus/${menuId}/categories/bulk`,
    locale,
    stats.requestBody,
  );

  console.log("[MenuImport] Bulk save response:", result);

  if (result.status) {
    return buildMenuImportSaveResponse(draft, { ok: true, stats });
  }

  const errorData = result.data as
    | { code?: string; error?: string; errorEn?: string }
    | undefined;
  const isBulkImportLimit = errorData?.code === "BULK_IMPORT_LIMIT";

  const message =
    typeof result.data === "object" && result.data !== null
      ? JSON.stringify(result.data).slice(0, 500)
      : String(result.data ?? "").slice(0, 500);

  return buildMenuImportSaveResponse(draft, {
    ok: false,
    failed: true,
    stats,
    errors: [
      {
        type: "category",
        reason: isBulkImportLimit ? "bulk_import_limit" : "bulk_save_failed",
        message: isBulkImportLimit
          ? (errorData?.error ?? errorData?.errorEn ?? message)
          : message,
      },
    ],
  });
}

export function mapMenuImportApiError(error: unknown): {
  code:
    | "network"
    | "timeout"
    | "invalid_response"
    | "empty_result"
    | "validation"
    | "save_failed";
  message: string;
  detail?: string;
} {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { code: "timeout", message: "timeout" };
    }

    const data = error.response?.data as
      | { error?: string; detail?: string; blockingErrors?: unknown[] }
      | undefined;

    if (data?.error === "invalid_response") {
      return {
        code: "invalid_response",
        message: "invalid_response",
        detail: data.detail,
      };
    }

    if (data?.error === "webhook_failed") {
      const detail = data.detail ?? "";
      const isN8nNotRegistered = detail.includes("not registered");
      return {
        code: isN8nNotRegistered ? "validation" : "network",
        message: isN8nNotRegistered ? "n8n_webhook_inactive" : "network",
        detail,
      };
    }

    if (error.response?.status === 400 && data && "blockingErrors" in data) {
      return { code: "validation", message: "missing_prices" };
    }

    if (error.response?.status === 422) {
      return {
        code: "invalid_response",
        message: "invalid_response",
        detail: data?.detail,
      };
    }

    return {
      code: "network",
      message: "network",
      detail: data?.detail ?? error.message,
    };
  }

  return { code: "network", message: "network" };
}

export function mapSaveImportError(error: unknown): {
  response?: SaveMenuImportResponse;
  code: "network" | "timeout" | "validation" | "save_failed" | "save_timeout";
} {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { code: "save_timeout" };
    }
    const data = error.response?.data as SaveMenuImportResponse | undefined;
    if (data?.blockingErrors?.length) {
      return { code: "validation", response: data };
    }
    if (data?.summary) {
      return { code: "save_failed", response: data };
    }
    return { code: "network" };
  }
  return { code: "network" };
}
