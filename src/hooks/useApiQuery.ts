"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "react-toastify";
import {
  resolveApiErrorMessage,
  unexpectedRequestError,
} from "@/api/apiError";
import type { ApiResponse } from "@/shared/axiosCall";

type ToastMessage<T> =
  | string
  | ((context: { locale: string; data: T | undefined; error: string }) => string);

export interface UseApiQueryOptions<T> {
  request: () => Promise<ApiResponse<T>>;
  enabled?: boolean;
  initialData?: T;
  errorToast?: ToastMessage<T> | false;
  onSuccess?: (data: T) => void;
  onError?: (error: string, data: T | undefined) => void;
}

function resolveToast<T>(
  policy: ToastMessage<T>,
  context: { locale: string; data: T | undefined; error: string },
): string {
  return typeof policy === "function" ? policy(context) : policy;
}

export function useApiQuery<T>({
  request,
  enabled = true,
  initialData,
  errorToast = false,
  onSuccess,
  onError,
}: UseApiQueryOptions<T>) {
  const locale = useLocale();
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const callbacksRef = useRef({ onSuccess, onError });
  callbacksRef.current = { onSuccess, onError };

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await request();
      if (requestId !== requestIdRef.current) return result;

      if (result.status && result.data !== undefined) {
        setData(result.data);
        callbacksRef.current.onSuccess?.(result.data);
        return result;
      }

      const message = resolveApiErrorMessage(result.data, locale);
      setError(message);
      callbacksRef.current.onError?.(message, result.data);
      if (errorToast) {
        const toastMessage = resolveToast(errorToast, {
          locale,
          data: result.data,
          error: message,
        });
        if (toastMessage) toast.error(toastMessage);
      }
      return result;
    } catch {
      if (requestId !== requestIdRef.current) return undefined;
      const message = unexpectedRequestError(locale);
      setError(message);
      callbacksRef.current.onError?.(message, undefined);
      if (errorToast) {
        const toastMessage = resolveToast(errorToast, {
          locale,
          data: undefined,
          error: message,
        });
        if (toastMessage) toast.error(toastMessage);
      }
      return undefined;
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [errorToast, locale, request]);

  useEffect(() => {
    if (enabled) void refetch();
    else setLoading(false);
    return () => {
      requestIdRef.current += 1;
    };
  }, [enabled, refetch]);

  return { data, setData, loading, error, refetch };
}
