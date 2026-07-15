"use client";

import { useCallback, useReducer } from "react";
import { normalizeAiResponse } from "@/lib/menuImport/normalizeAiResponse";
import {
  withUpdatedDraftStats,
  createEmptyCategory,
  createEmptyItem,
  collectBlockingPriceErrors,
  collectBlockingNameErrors,
  collectAllBlockingErrors,
} from "@/lib/menuImport/draftSaveUtils";
import {
  analyzeMenuImage,
  mapMenuImportApiError,
  saveMenuImportDraft,
  mapSaveImportError,
  fetchExistingMenuSnapshot,
} from "@/services/menuImportApi";
import { annotateDraftWithSnapshot, collectUnresolvedPriceConflicts } from "@/lib/menuImport/duplicateMatch";
import { buildMenuImportSaveResponse } from "@/lib/menuImport/buildBulkCategoriesPayload";
import { generateImportId } from "@/lib/menuImport/generateImportId";
import type { MenuSnapshot } from "@/lib/menuImport/menuSnapshot";
import type {
  ImportCategory,
  ImportDraft,
  ImportError,
  ImportItem,
  ImportStep,
  ImportVariant,
  SaveMenuImportResponse,
} from "@/types/menuImport";

export interface MenuImportFlowState {
  step: ImportStep;
  file: File | null;
  previewUrl: string | null;
  draft: ImportDraft | null;
  parseErrors: string[];
  error: ImportError | null;
  isProcessing: boolean;
  confirmOpen: boolean;
  isSaving: boolean;
  saveResult: SaveMenuImportResponse | null;
  duplicatesLoading: boolean;
  menuSnapshot: MenuSnapshot | null;
}

type Action =
  | { type: "SET_FILE"; file: File; previewUrl: string }
  | { type: "CLEAR_FILE" }
  | { type: "START_PROCESSING" }
  | {
      type: "PROCESSING_SUCCESS";
      draft: ImportDraft;
      parseErrors: string[];
    }
  | { type: "PROCESSING_FAIL"; error: ImportError }
  | { type: "SET_DRAFT"; draft: ImportDraft }
  | {
      type: "PATCH_DRAFT";
      updater: (draft: ImportDraft) => ImportDraft;
    }
  | { type: "OPEN_CONFIRM" }
  | { type: "CLOSE_CONFIRM" }
  | { type: "START_DUPLICATE_CHECK" }
  | { type: "DUPLICATE_CHECK_DONE"; snapshot: MenuSnapshot }
  | { type: "DUPLICATE_CHECK_FAIL" }
  | { type: "START_SAVE" }
  | { type: "SAVE_SUCCESS"; result: SaveMenuImportResponse }
  | { type: "SAVE_FAIL"; result?: SaveMenuImportResponse; error?: ImportError }
  | { type: "RESET" }
  | { type: "GO_TO_UPLOAD" };

const initialState: MenuImportFlowState = {
  step: "upload",
  file: null,
  previewUrl: null,
  draft: null,
  parseErrors: [],
  error: null,
  isProcessing: false,
  confirmOpen: false,
  isSaving: false,
  saveResult: null,
  duplicatesLoading: false,
  menuSnapshot: null,
};

function applyDraftUpdate(
  draft: ImportDraft,
  updater: (draft: ImportDraft) => ImportDraft,
  snapshot: MenuSnapshot | null,
): ImportDraft {
  const next = updater(draft);
  const annotated = snapshot
    ? annotateDraftWithSnapshot(next, snapshot)
    : next;
  return withUpdatedDraftStats(annotated);
}

function reducer(
  state: MenuImportFlowState,
  action: Action,
): MenuImportFlowState {
  switch (action.type) {
    case "SET_FILE":
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      return {
        ...state,
        step: "upload",
        file: action.file,
        previewUrl: action.previewUrl,
        draft: null,
        parseErrors: [],
        error: null,
        isProcessing: false,
        confirmOpen: false,
        isSaving: false,
        saveResult: null,
        duplicatesLoading: false,
        menuSnapshot: null,
      };
    case "CLEAR_FILE":
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      return { ...initialState };
    case "START_PROCESSING":
      return {
        ...state,
        step: "processing",
        isProcessing: true,
        error: null,
        draft: null,
        parseErrors: [],
        confirmOpen: false,
        saveResult: null,
        menuSnapshot: null,
      };
    case "PROCESSING_SUCCESS":
      return {
        ...state,
        step: "review",
        isProcessing: false,
        draft: action.draft,
        parseErrors: action.parseErrors,
        error: null,
        duplicatesLoading: true,
        menuSnapshot: null,
      };
    case "START_DUPLICATE_CHECK":
      return { ...state, duplicatesLoading: true };
    case "DUPLICATE_CHECK_DONE":
      return {
        ...state,
        // Annotate the live draft so edits made during the snapshot fetch are kept
        draft: state.draft
          ? withUpdatedDraftStats(
              annotateDraftWithSnapshot(state.draft, action.snapshot),
            )
          : null,
        menuSnapshot: action.snapshot,
        duplicatesLoading: false,
      };
    case "DUPLICATE_CHECK_FAIL":
      return { ...state, duplicatesLoading: false, menuSnapshot: null };
    case "PROCESSING_FAIL":
      return {
        ...state,
        step: "error",
        isProcessing: false,
        error: action.error,
      };
    case "SET_DRAFT":
      return {
        ...state,
        draft: state.menuSnapshot
          ? withUpdatedDraftStats(
              annotateDraftWithSnapshot(action.draft, state.menuSnapshot),
            )
          : action.draft,
        saveResult: null,
      };
    case "PATCH_DRAFT":
      if (!state.draft) return state;
      return {
        ...state,
        draft: applyDraftUpdate(
          state.draft,
          action.updater,
          state.menuSnapshot,
        ),
        saveResult: null,
      };
    case "OPEN_CONFIRM":
      return { ...state, confirmOpen: true };
    case "CLOSE_CONFIRM":
      return { ...state, confirmOpen: false };
    case "START_SAVE":
      return { ...state, isSaving: true, confirmOpen: false, error: null };
    case "SAVE_SUCCESS":
      return {
        ...state,
        isSaving: false,
        saveResult: action.result,
      };
    case "SAVE_FAIL":
      return {
        ...state,
        isSaving: false,
        saveResult: action.result ?? null,
        error: action.error ?? null,
      };
    case "GO_TO_UPLOAD":
      return {
        ...state,
        step: "upload",
        error: null,
        isProcessing: false,
        confirmOpen: false,
        saveResult: null,
      };
    case "RESET":
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      return { ...initialState };
    default:
      return state;
  }
}

interface UseMenuImportFlowOptions {
  menuId: string;
  currency: string;
  locale: "ar" | "en";
}

export function useMenuImportFlow({
  menuId,
  currency,
  locale,
}: UseMenuImportFlowOptions) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setFile = useCallback((file: File) => {
    dispatch({
      type: "SET_FILE",
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }, []);

  const clearFile = useCallback(() => {
    dispatch({ type: "CLEAR_FILE" });
  }, []);

  const goToUpload = useCallback(() => {
    dispatch({ type: "GO_TO_UPLOAD" });
  }, []);

  const updateDraft = useCallback((draft: ImportDraft) => {
    dispatch({ type: "SET_DRAFT", draft: withUpdatedDraftStats(draft) });
  }, []);

  const patchDraft = useCallback(
    (updater: (draft: ImportDraft) => ImportDraft) => {
      dispatch({ type: "PATCH_DRAFT", updater });
    },
    [],
  );

  const updateCategory = useCallback(
    (categoryId: string, patch: Partial<ImportCategory>) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId ? { ...c, ...patch } : c,
        ),
      }));
    },
    [patchDraft],
  );

  const updateItem = useCallback(
    (
      categoryId: string,
      itemId: string,
      patch: Partial<ImportItem>,
    ) => {
      const affectsDuplicateMatch =
        patch.price !== undefined ||
        patch.nameAr !== undefined ||
        patch.nameEn !== undefined;

      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((item) => {
                  if (item.id !== itemId) return item;
                  const next: ImportItem = { ...item, ...patch };
                  if (
                    affectsDuplicateMatch &&
                    next.duplicateMeta?.resolution
                  ) {
                    const { resolution: _cleared, ...meta } = next.duplicateMeta;
                    next.duplicateMeta = meta;
                  }
                  return next;
                }),
              }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const updateVariant = useCallback(
    (
      categoryId: string,
      itemId: string,
      variantId: string,
      patch: Partial<ImportVariant>,
    ) => {
      const affectsDuplicateMatch =
        patch.price !== undefined ||
        patch.label !== undefined ||
        patch.labelAr !== undefined ||
        patch.labelEn !== undefined;

      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        variants: item.variants.map((v) => {
                          if (v.id !== variantId) return v;
                          const next: ImportVariant = { ...v, ...patch };
                          if (
                            affectsDuplicateMatch &&
                            next.duplicateMeta?.resolution
                          ) {
                            const {
                              resolution: _cleared,
                              ...meta
                            } = next.duplicateMeta;
                            next.duplicateMeta = meta;
                          }
                          return next;
                        }),
                      }
                    : item,
                ),
              }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const deleteItem = useCallback(
    (categoryId: string, itemId: string) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? { ...c, items: c.items.filter((i) => i.id !== itemId) }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const deleteCategory = useCallback(
    (categoryId: string) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.filter((c) => c.id !== categoryId),
      }));
    },
    [patchDraft],
  );

  const addItem = useCallback(
    (categoryId: string) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? { ...c, items: [...c.items, createEmptyItem()] }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const addCategory = useCallback(() => {
    patchDraft((draft) => ({
      ...draft,
      categories: [...draft.categories, createEmptyCategory()],
    }));
  }, [patchDraft]);

  const addVariant = useCallback(
    (categoryId: string, itemId: string) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        price: null,
                        variants: [
                          ...item.variants,
                          {
                            id: generateImportId(),
                            label: "",
                            labelAr: "",
                            labelEn: "",
                            price: null,
                            flags: ["missing_price"],
                          },
                        ],
                      }
                    : item,
                ),
              }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const removeVariant = useCallback(
    (categoryId: string, itemId: string, variantId: string) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        variants: item.variants.filter(
                          (v) => v.id !== variantId,
                        ),
                      }
                    : item,
                ),
              }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const resolveDuplicate = useCallback(
    (
      categoryId: string,
      itemId: string,
      resolution: "skip" | "update_price",
      variantId?: string,
    ) => {
      patchDraft((draft) => ({
        ...draft,
        categories: draft.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                items: c.items.map((item) => {
                  if (item.id !== itemId) return item;
                  if (variantId) {
                    const variants = item.variants.map((v) =>
                      v.id === variantId
                        ? {
                            ...v,
                            duplicateMeta: {
                              ...v.duplicateMeta,
                              status: "price_conflict" as const,
                              resolution,
                            },
                            flags: v.flags.filter(
                              (f) => f !== "price_conflict",
                            ),
                          }
                        : v,
                    );
                    const stillConflict = variants.some((v) =>
                      v.flags.includes("price_conflict"),
                    );
                    return {
                      ...item,
                      variants,
                      flags: stillConflict
                        ? item.flags
                        : item.flags.filter((f) => f !== "price_conflict"),
                    };
                  }
                  return {
                    ...item,
                    duplicateMeta: {
                      ...item.duplicateMeta,
                      status: "price_conflict" as const,
                      resolution,
                    },
                    flags: item.flags.filter((f) => f !== "price_conflict"),
                  };
                }),
              }
            : c,
        ),
      }));
    },
    [patchDraft],
  );

  const openConfirm = useCallback(() => {
    dispatch({ type: "OPEN_CONFIRM" });
  }, []);

  const closeConfirm = useCallback(() => {
    dispatch({ type: "CLOSE_CONFIRM" });
  }, []);

  const blockingPriceErrors = state.draft
    ? collectBlockingPriceErrors(state.draft)
    : [];
  const blockingNameErrors = state.draft
    ? collectBlockingNameErrors(state.draft)
    : [];
  const blockingErrors = state.draft
    ? collectAllBlockingErrors(state.draft)
    : [];
  const unresolvedPriceConflicts = state.draft
    ? collectUnresolvedPriceConflicts(state.draft)
    : [];
  const canProceedToConfirm =
    blockingErrors.length === 0 &&
    unresolvedPriceConflicts.length === 0 &&
    !state.duplicatesLoading;

  const startAnalysis = useCallback(async () => {
    if (!state.file) return;
    dispatch({ type: "START_PROCESSING" });
    try {
      const aiResponse = await analyzeMenuImage(state.file, menuId, locale);
      console.log("[MenuImport] AI response:", aiResponse);
      const { raw } = aiResponse;
      const { draft, parseErrors } = normalizeAiResponse(raw, {
        menuId,
        currency,
        locale,
        sourceImage: { name: state.file.name, size: state.file.size },
      });
      console.log("[MenuImport] Normalized draft:", draft);
      console.log("[MenuImport] Parse errors:", parseErrors);
      if (draft.stats.categoryCount === 0 && draft.stats.itemCount === 0) {
        dispatch({
          type: "PROCESSING_FAIL",
          error: { code: "empty_result", message: "empty_result" },
        });
        return;
      }
      dispatch({
        type: "PROCESSING_SUCCESS",
        draft: withUpdatedDraftStats(draft),
        parseErrors,
      });

      try {
        const snapshot = await fetchExistingMenuSnapshot(menuId, locale);
        console.log("[MenuImport] Existing menu snapshot:", snapshot);
        // Snapshot is applied onto whatever the user has edited in the reducer
        dispatch({ type: "DUPLICATE_CHECK_DONE", snapshot });
      } catch {
        dispatch({ type: "DUPLICATE_CHECK_FAIL" });
      }
    } catch (error) {
      dispatch({
        type: "PROCESSING_FAIL",
        error: mapMenuImportApiError(error),
      });
    }
  }, [state.file, menuId, locale, currency]);

  const retryAnalysis = useCallback(async () => {
    if (!state.file) {
      goToUpload();
      return;
    }
    await startAnalysis();
  }, [state.file, startAnalysis, goToUpload]);

  const confirmSave = useCallback(async () => {
    if (!state.draft) return;
    dispatch({ type: "START_SAVE" });
    try {
      const result = await saveMenuImportDraft(menuId, locale, state.draft);
      dispatch({ type: "SAVE_SUCCESS", result });
    } catch (error) {
      const mapped = mapSaveImportError(error);
      if (mapped.response) {
        dispatch({ type: "SAVE_SUCCESS", result: mapped.response });
        return;
      }

      dispatch({
        type: "SAVE_FAIL",
        result: buildMenuImportSaveResponse(state.draft, {
          ok: false,
          failed: true,
          errors: [
            {
              type: "category",
              reason:
                mapped.code === "save_timeout" || mapped.code === "network"
                  ? "network_error"
                  : "bulk_save_failed",
              message: mapped.code,
            },
          ],
        }),
        error: {
          code: "save_failed",
          message: mapped.code,
        },
      });
    }
  }, [state.draft, menuId, locale]);

  return {
    state,
    setFile,
    clearFile,
    goToUpload,
    startAnalysis,
    retryAnalysis,
    updateCategory,
    updateItem,
    updateVariant,
    deleteItem,
    deleteCategory,
    addItem,
    addCategory,
    addVariant,
    removeVariant,
    resolveDuplicate,
    openConfirm,
    closeConfirm,
    confirmSave,
    blockingErrors,
    blockingPriceErrors,
    blockingNameErrors,
    unresolvedPriceConflicts,
    canProceedToConfirm,
  };
}
