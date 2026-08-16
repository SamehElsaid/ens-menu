"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { advertisementEndpoints } from "@/api/endpoints/advertisements";
import { useApiMutation } from "@/hooks/useApiMutation";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  axiosDelete,
  axiosGet,
  axiosPut,
  type ApiResponse,
} from "@/shared/axiosCall";
import type {
  AdminAdvertisement,
  AdminAdvertisementsResponse,
} from "@/types/Menu";

const EMPTY_RESPONSE: AdminAdvertisementsResponse = {
  ads: [],
  statistics: {
    total: 0,
    totalActive: 0,
    totalClicks: 0,
    totalImpressions: 0,
  },
};

type AdvertisementMutation =
  | { kind: "delete"; id: number }
  | { kind: "setActive"; id: number; isActive: boolean };

export function useAdminAdvertisements() {
  const locale = useLocale();
  const t = useTranslations("adminAds");
  const [loadingAdId, setLoadingAdId] = useState<number | null>(null);

  const requestAds = useCallback(
    () =>
      axiosGet<AdminAdvertisementsResponse>(
        advertisementEndpoints.admin.list(),
        locale,
      ),
    [locale],
  );

  const query = useApiQuery({
    request: requestAds,
    initialData: EMPTY_RESPONSE,
    errorToast: t("error"),
  });

  const requestMutation = useCallback(
    (
      variables: AdvertisementMutation,
    ): Promise<ApiResponse<AdminAdvertisement | { message?: string }>> => {
      const endpoint = advertisementEndpoints.admin.detail(variables.id);
      if (variables.kind === "delete") {
        return axiosDelete<{ message?: string }>(endpoint, locale);
      }
      return axiosPut<{ isActive: boolean }, AdminAdvertisement>(
        endpoint,
        locale,
        { isActive: variables.isActive },
      );
    },
    [locale],
  );

  const mutation = useApiMutation({ request: requestMutation });

  const runMutation = useCallback(
    async (
      variables: AdvertisementMutation,
      messages: { success: string; error: string },
      onSuccess?: () => void,
    ) => {
      setLoadingAdId(variables.id);
      try {
        const result = await mutation.mutate(variables, {
          successToast: messages.success,
          errorToast: messages.error,
          onSuccess: () => {
            onSuccess?.();
            void query.refetch();
          },
        });
        return Boolean(result?.status);
      } finally {
        setLoadingAdId((current) =>
          current === variables.id ? null : current,
        );
      }
    },
    [mutation, query],
  );

  const deleteAdvertisement = useCallback(
    (id: number, onSuccess?: () => void) =>
      runMutation(
        { kind: "delete", id },
        { success: t("deleteSuccess"), error: t("deleteError") },
        onSuccess,
      ),
    [runMutation, t],
  );

  const setAdvertisementActive = useCallback(
    (id: number, isActive: boolean, onSuccess?: () => void) =>
      runMutation(
        { kind: "setActive", id, isActive },
        {
          success: t(isActive ? "activateSuccess" : "deactivateSuccess"),
          error: t(isActive ? "activateError" : "deactivateError"),
        },
        onSuccess,
      ),
    [runMutation, t],
  );

  const response = query.data ?? EMPTY_RESPONSE;
  const statistics = useMemo(
    () => ({
      total: response.statistics?.total ?? 0,
      totalActive: response.statistics?.totalActive ?? 0,
      totalClicks: response.statistics?.totalClicks ?? 0,
      totalImpressions: response.statistics?.totalImpressions ?? 0,
    }),
    [response.statistics],
  );

  return {
    advertisements: response.ads ?? [],
    statistics,
    loading: query.loading,
    error: query.error,
    refreshAdvertisements: query.refetch,
    loadingAdId,
    deleteAdvertisement,
    setAdvertisementActive,
  };
}
