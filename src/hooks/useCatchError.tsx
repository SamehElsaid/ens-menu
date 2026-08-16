import axios, { AxiosError, AxiosResponse } from "axios";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { isUserNotFoundApiBody } from "@/shared/jwtPayload";

interface ErrorResponse {
  status?: boolean;
  error?: string;
  errorType?: string;
  message?: string | Record<string, string | string[]>;
}

let interceptorId: number | null = null;

function handleErrorResponse(data: unknown, status: number) {
  const errorData = data as ErrorResponse;

  if (errorData?.status) {
    return;
  }

  if (status === 405 || status === 401) {
    return;
  }

  if (errorData?.error && typeof errorData.error === "string") {
    toast.error(errorData.error);
    return;
  }

  if (typeof errorData?.message === "string") {
    toast.error(errorData.message);
    return;
  }

  if (errorData?.message && typeof errorData.message === "object") {
    for (const key in errorData.message) {
      const messages = errorData.message[key];
      if (Array.isArray(messages)) {
        messages.forEach((message) => toast.error(message));
      } else if (typeof messages === "string") {
        toast.error(messages);
      }
    }
  }
}

function ensureErrorInterceptor() {
  if (interceptorId != null) return;
  interceptorId = axios.interceptors.response.use(
    function (response: AxiosResponse<unknown>) {
      return response;
    },
    function (error: AxiosError) {
      if ((error.config as { silent?: boolean } | undefined)?.silent) {
        return Promise.reject(error);
      }
      const status = error.response?.status ?? 500;
      const requestUrl = error.config?.url ?? "";
      if (
        status === 404 &&
        requestUrl.includes("/auth/me") &&
        isUserNotFoundApiBody(error.response?.data)
      ) {
        return Promise.reject(error);
      }
      handleErrorResponse(error.response?.data, status);
      return Promise.reject(error);
    },
  );
}

export default function useCatchError() {
  useEffect(() => {
    ensureErrorInterceptor();
  }, []);

  return null;
}
