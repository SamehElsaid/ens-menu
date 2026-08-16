import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";
import {
  DecryptError,
  decryptDataApi,
  encryptDataApi,
} from "./encryption";
import { performAuthLogout } from "./authLogout";
import {
  getStoredCsrfToken,
  storeCsrfToken,
  storeCsrfTokenFromPayload,
} from "./csrfToken";

export const DEFAULT_BROWSER_REQUEST_TIMEOUT_MS = 15_000;

export interface ApiResponse<T> {
  data?: T;
  status: boolean;
  statusCode?: number;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
}

type BrowserMethod = "get" | "post" | "put" | "patch" | "delete";

interface ExecuteOptions {
  method: BrowserMethod;
  url: string;
  locale: string;
  data?: unknown;
  params?: Record<string, unknown>;
  file?: boolean;
  close?: boolean;
  silent?: boolean;
  requestHeaders?: Record<string, string>;
}

interface ApiErrorBody {
  code?: unknown;
}

let refreshPromise: Promise<boolean> | null = null;
let csrfPromise: Promise<string | null> | null = null;

const getApiKey = async (): Promise<string> => {
  let utcTime: unknown;
  try {
    const response = await fetch("/api/utc-time");
    if (!response.ok) {
      throw new Error("utc-time unavailable");
    }
    const dataTime = (await response.json()) as { fx_dyn?: unknown };
    if (typeof dataTime.fx_dyn !== "string" || !dataTime.fx_dyn) {
      throw new Error("utc-time payload missing");
    }
    utcTime = decryptDataApi(
      dataTime.fx_dyn,
      process.env.NEXT_PUBLIC_SECRET_KEY as string,
    );
  } catch (error) {
    if (error instanceof DecryptError) {
      throw error;
    }
    throw new DecryptError("UTC timestamp unavailable");
  }

  const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;
  return encryptDataApi(
    apiKey,
    process.env.NEXT_PUBLIC_SECRET_KEY as string,
  );
};

function isMutation(method: BrowserMethod): boolean {
  return method !== "get";
}

export function asAxiosError(error: unknown): AxiosError | null {
  return axios.isAxiosError(error) ? error : null;
}

function isAccessTokenExpired(error: unknown): boolean {
  const axiosError = asAxiosError(error);
  if (axiosError?.response?.status !== 401) return false;
  const body = axiosError.response.data as ApiErrorBody | undefined;
  return body?.code === "ACCESS_TOKEN_EXPIRED";
}

async function requestCsrfToken(apiKey: string): Promise<string | null> {
  const request = async (key: string) =>
    axios.get<{ csrfToken?: string }>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/csrf`,
      {
        withCredentials: true,
        timeout: DEFAULT_BROWSER_REQUEST_TIMEOUT_MS,
        headers: { "X-API-KEY": key },
      },
    );

  try {
    let response: AxiosResponse<{ csrfToken?: string }>;
    try {
      response = await request(apiKey);
    } catch (error) {
      if (asAxiosError(error)?.response?.status !== 405) throw error;
      response = await request(await getApiKey());
    }
    const token = response.data?.csrfToken;
    storeCsrfToken(token);
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

function getCsrfTokenPromise(apiKey: string): Promise<string | null> {
  const stored = getStoredCsrfToken();
  if (stored) return Promise.resolve(stored);
  if (csrfPromise) return csrfPromise;
  csrfPromise = requestCsrfToken(apiKey).finally(() => {
    csrfPromise = null;
  });
  return csrfPromise;
}

async function refreshAccessToken(): Promise<boolean> {
  let apiKey = await getApiKey();
  const csrfToken = await getCsrfTokenPromise(apiKey);
  const request = (key: string) =>
    axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        timeout: DEFAULT_BROWSER_REQUEST_TIMEOUT_MS,
        headers: {
          "X-API-KEY": key,
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      },
    );

  try {
    let response: AxiosResponse;
    try {
      response = await request(apiKey);
    } catch (error) {
      if (asAxiosError(error)?.response?.status !== 405) throw error;
      apiKey = await getApiKey();
      response = await request(apiKey);
    }
    storeCsrfTokenFromPayload(response.data);
    return true;
  } catch (error) {
    if (asAxiosError(error)?.response?.status === 401) {
      await performAuthLogout();
    }
    return false;
  }
}

function getRefreshPromise(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function dispatchRequest<T>(
  options: ExecuteOptions,
  headers: Record<string, string>,
): Promise<AxiosResponse<T>> {
  const config: AxiosRequestConfig = {
    withCredentials: true,
    timeout: DEFAULT_BROWSER_REQUEST_TIMEOUT_MS,
    headers,
    params: options.params,
  };
  (config as AxiosRequestConfig & { silent?: boolean }).silent = options.silent;

  const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${options.url}`;
  if (options.method === "get" || options.method === "delete") {
    return axios.request<T>({
      ...config,
      method: options.method as Method,
      url: fullUrl,
    });
  }
  return axios.request<T>({
    ...config,
    method: options.method as Method,
    url: fullUrl,
    data: options.data,
  });
}

async function execute<T>(options: ExecuteOptions): Promise<ApiResponse<T>> {
  let apiKey: string;
  try {
    apiKey = await getApiKey();
  } catch {
    return { status: false, statusCode: 503 };
  }
  let apiKeyRetried = false;
  let authRetried = false;

  while (true) {
    const csrfToken =
      isMutation(options.method) && !options.close
        ? await getCsrfTokenPromise(apiKey)
        : null;
    const headers: Record<string, string> = {
      ...(options.file ? { "Content-Type": "multipart/form-data" } : {}),
      ...options.requestHeaders,
      "Accept-Language": options.locale,
      "X-API-KEY": apiKey,
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    };

    try {
      const response = await dispatchRequest<T>(options, headers);
      storeCsrfTokenFromPayload(response.data);
      return { data: response.data, status: true };
    } catch (error) {
      const axiosError = asAxiosError(error);

      if (axiosError?.response?.status === 405 && !apiKeyRetried) {
        apiKeyRetried = true;
        apiKey = await getApiKey();
        continue;
      }

      if (
        !options.close &&
        !authRetried &&
        isAccessTokenExpired(axiosError)
      ) {
        authRetried = true;
        if (await getRefreshPromise()) continue;
      }

      return {
        data: axiosError?.response?.data as T,
        status: false,
        statusCode: axiosError?.response?.status,
      };
    }
  }
}

export const axiosGet = async <T>(
  url: string,
  locale: string,
  _token?: string,
  params?: Record<string, unknown>,
  close?: boolean,
  silent?: boolean,
): Promise<ApiResponse<T>> =>
  execute<T>({ method: "get", url, locale, params, close, silent });

export const axiosPost = async <T, U>(
  url: string,
  locale: string,
  data: T,
  file?: boolean,
  close?: boolean,
  requestOptions?: ApiRequestOptions,
): Promise<ApiResponse<U>> =>
  execute<U>({
    method: "post",
    url,
    locale,
    data,
    file,
    close,
    requestHeaders: requestOptions?.headers,
  });

export const axiosPut = <T, U>(
  url: string,
  locale: string,
  data: T,
  file?: boolean,
  close?: boolean,
): Promise<ApiResponse<U>> =>
  execute<U>({ method: "put", url, locale, data, file, close });

export const axiosPatch = <T, U>(
  url: string,
  locale: string,
  data: T,
  file?: boolean,
  close?: boolean,
): Promise<ApiResponse<U>> =>
  execute<U>({ method: "patch", url, locale, data, file, close });

export const axiosDelete = async <T>(
  url: string,
  locale: string,
): Promise<ApiResponse<T>> => execute<T>({ method: "delete", url, locale });

export const getFromGetServerSideProps = async <T>(
  url: string,
  newHeaders: AxiosRequestConfig = {},
  locale: string,
): Promise<ApiResponse<T>> => {
  const headers = { ...newHeaders.headers, "Accept-Language": locale };

  try {
    const fetchData = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/${url}`,
      {
        withCredentials: true,
        timeout: DEFAULT_BROWSER_REQUEST_TIMEOUT_MS,
        headers,
      },
    );
    return { data: fetchData.data, status: true };
  } catch (error) {
    const axiosError = asAxiosError(error);
    return {
      data: axiosError?.response?.data as T,
      status: false,
      statusCode: axiosError?.response?.status,
    };
  }
};
