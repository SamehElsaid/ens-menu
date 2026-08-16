"use client";

import { useCallback } from "react";
import {
  useApiMutation,
  type ApiMutationPolicy,
} from "@/hooks/useApiMutation";
import type { ApiResponse } from "@/shared/axiosCall";

type ApiActionRequest = () => Promise<ApiResponse<unknown>>;

const invokeApiAction = (request: ApiActionRequest) => request();

/**
 * For components with several unrelated one-shot mutations. The request stays
 * at the call site while loading, stale-response safety and toast policy remain
 * centralized.
 */
export function useApiAction() {
  const mutation = useApiMutation<unknown, ApiActionRequest>({
    request: invokeApiAction,
  });
  const { mutate, loading, error } = mutation;

  const runApiAction = useCallback(
    (
      request: ApiActionRequest,
      policy: ApiMutationPolicy<unknown, ApiActionRequest>,
    ) => mutate(request, policy),
    [mutate],
  );

  return {
    runApiAction,
    loading,
    error,
  };
}
