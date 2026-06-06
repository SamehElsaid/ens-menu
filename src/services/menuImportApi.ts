import axios from "axios";
import type {
  ImportDraft,
  MenuImportApiResponse,
  SaveMenuImportResponse,
} from "@/types/menuImport";
import {
  MENU_IMPORT_API_TIMEOUT_MS,
  MENU_IMPORT_SAVE_TIMEOUT_MS,
} from "@/lib/menuImport/constants";
import type { MenuSnapshot } from "@/lib/menuImport/menuSnapshot";

const MENU_IMPORT_API_URL = "/api/menu-import";
const MENU_IMPORT_SAVE_URL = "/api/menu-import/save";
const MENU_IMPORT_EXISTING_URL = "/api/menu-import/existing";

export async function analyzeMenuImage(
  file: File,
  menuId: string,
  locale: string,
): Promise<MenuImportApiResponse> {
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
  const response = await axios.post<SaveMenuImportResponse>(
    MENU_IMPORT_SAVE_URL,
    { menuId, locale, draft },
    {
      timeout: MENU_IMPORT_SAVE_TIMEOUT_MS,
      headers: { Accept: "application/json" },
    },
  );
  return response.data;
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
