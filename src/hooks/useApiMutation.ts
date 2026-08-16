"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import {
  resolveApiErrorMessage,
  unexpectedRequestError,
} from "@/api/apiError";
import type { ApiResponse } from "@/shared/axiosCall";

type MutationToast<TData, TVariables> =
  | string
  | ((context: {
      locale: string;
      data: TData | undefined;
      variables: TVariables;
      error: string;
    }) => string);

export interface ApiMutationPolicy<TData, TVariables> {
  successToast?: MutationToast<TData, TVariables> | false;
  errorToast?: MutationToast<TData, TVariables> | false;
  onSuccess?: (data: TData | undefined, variables: TVariables) => void;
  onError?: (
    error: string,
    data: TData | undefined,
    variables: TVariables,
  ) => void;
}

export interface UseApiMutationOptions<TData, TVariables>
  extends ApiMutationPolicy<TData, TVariables> {
  request: (variables: TVariables) => Promise<ApiResponse<TData>>;
}

function resolveToast<TData, TVariables>(
  policy: MutationToast<TData, TVariables>,
  context: {
    locale: string;
    data: TData | undefined;
    variables: TVariables;
    error: string;
  },
): string {
  return typeof policy === "function" ? policy(context) : policy;
}

export function useApiMutation<TData, TVariables>({
  request,
  ...defaultPolicy
}: UseApiMutationOptions<TData, TVariables>) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const policyRef = useRef(defaultPolicy);
  policyRef.current = defaultPolicy;

  useEffect(
    () => () => {
      requestIdRef.current += 1;
    },
    [],
  );

  const mutate = useCallback(
    async (
      variables: TVariables,
      policyOverride: ApiMutationPolicy<TData, TVariables> = {},
    ) => {
      const requestId = ++requestIdRef.current;
      const policy = { ...policyRef.current, ...policyOverride };
      setLoading(true);
      setError(null);

      try {
        const result = await request(variables);
        if (requestId !== requestIdRef.current) return result;

        const context = {
          locale,
          data: result.data,
          variables,
          error: "",
        };
        if (result.status) {
          policy.onSuccess?.(result.data, variables);
          if (policy.successToast) {
            const message = resolveToast(policy.successToast, context);
            if (message) toast.success(message);
          }
          return result;
        }

        const message = resolveApiErrorMessage(result.data, locale);
        setError(message);
        policy.onError?.(message, result.data, variables);
        if (policy.errorToast) {
          const toastMessage = resolveToast(policy.errorToast, {
            ...context,
            error: message,
          });
          if (toastMessage) toast.error(toastMessage);
        }
        return result;
      } catch {
        if (requestId !== requestIdRef.current) return undefined;
        const message = unexpectedRequestError(locale);
        setError(message);
        policy.onError?.(message, undefined, variables);
        if (policy.errorToast) {
          const toastMessage = resolveToast(policy.errorToast, {
            locale,
            data: undefined,
            variables,
            error: message,
          });
          if (toastMessage) toast.error(toastMessage);
        }
        return undefined;
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [locale, request],
  );

  return { mutate, loading, error };
}
