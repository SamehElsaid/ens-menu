import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { decryptData, decryptDataApi, encryptData, encryptDataApi } from "./encryption";
import { LoginResponse } from "@/types/LoginResponse";

interface ApiResponse<T> {
  data?: T;
  status: boolean;
}

interface DecryptedToken {
  token?: string;
  [key: string]: unknown;
}

// قفل مشترك: لو الـ refresh شغال، أي طلب تاني يستنى على نفس الـ promise
let refreshPromise: Promise<string | null> | null = null;

const getApiKey = async () => {
  try {
    const response = await fetch(`/api/utc-time`);
    const dataTime = await response.json();
    const utcTimestamp = dataTime.fx_dyn;
    const fx_dyn = decryptDataApi(
      utcTimestamp,
      process.env.NEXT_PUBLIC_SECRET_KEY as string
    );
    return fx_dyn;
  } catch {
    return Date.now() / 1000;
  }
};

// تنفيذ الـ refresh مرة واحدة؛ الباقي يستنى على نفس الـ promise
const doRefreshAccessToken = async (): Promise<string | null> => {
  try {
    const authToken = Cookies.get("sub");
    if (!authToken) return null;

    const utcTime = await getApiKey();
    const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;
    const apiKeyEncrypt = encryptDataApi(
      apiKey,
      process.env.NEXT_PUBLIC_SECRET_KEY as string
    );

    const tokenDecrypted = decryptData(authToken) as {
      token: string;
      refreshToken: string;
    };

    const response = await axios.post<{ token?: string } | string>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh/`,
      { refreshToken: tokenDecrypted.refreshToken },
      {
        headers: {
          "X-API-KEY": apiKeyEncrypt,
        },
      }
    );


    console.log(response.data);

    const { accessToken, refreshToken } = response.data as LoginResponse;


    const newCookies = {
      token: accessToken,
      refreshToken: refreshToken,
    };
    Cookies.set("sub", encryptData(newCookies), { path: "/" });
    return accessToken;
  } catch (err) {
    console.error("Refresh token failed:", err);
    if ((err as AxiosError).response?.status === 405) {
      Cookies.remove("sub", { path: "/" });
      window.location.href = "/";
    }
    return null;
  } finally {
    refreshPromise = null;
  }
};

// لو الـ refresh شغال يرجع نفس الـ promise عشان الباقي يستنى
const getRefreshTokenPromise = (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefreshAccessToken();
  return refreshPromise;
};

//!  GET request API
// Function to make a GET request
export const axiosGet = async <T>(
  url: string,
  locale: string,
  token?: string,
  params?: Record<string, unknown>,
  close?: boolean
): Promise<ApiResponse<T>> => {
  const authToken = Cookies.get("sub") ?? "";
  const tokenDecrypted = decryptData(authToken) as DecryptedToken;

  const utcTime = await getApiKey();
  const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;
  const apiKeyEncrypt = encryptDataApi(
    apiKey,
    process.env.NEXT_PUBLIC_SECRET_KEY as string
  );

  try {
    const header: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token || tokenDecrypted?.token}`,
        "Accept-Language": locale,
        "X-API-KEY": apiKeyEncrypt,
      },
      params,
    };
    if (close) {
      delete header.headers?.Authorization;
    }
    const fetchData = await axios.get<T>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${url}`,
      header
    );

    return { data: fetchData.data, status: true };
  } catch (err) {
    if ((err as AxiosError).response?.status === 405) {
      // كل الطلبات اللي تجي 405 تستنى على نفس الـ refresh
      const newToken = await getRefreshTokenPromise();
      if (newToken) {
        return axiosGet(url, locale, token, params, close);
      }
    }
    return {
      data: (err as AxiosError)?.response?.data as T,
      status: false,
    };
  }
};

//!  POST request API
// Interface for the headers of the POST request
interface HeadersPost {
  Authorization?: string;
  "Content-Type"?: string;
}
// Function to make a POST request
export const axiosPost = async <T, U>(
  url: string,
  locale: string,
  data: T,
  file?: boolean,
  close?: boolean
) => {
  const authToken = Cookies.get("sub") ?? "";
  const tokenDecrypted = decryptData(authToken) as DecryptedToken;
  const HeaderImg = { "Content-Type": "multipart/form-data" };

  const headerToken: HeadersPost = file ? { ...HeaderImg } : {};
  headerToken.Authorization = `Bearer ${tokenDecrypted?.token}`;

  const utcTime = await getApiKey();
  const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;

  const apiKeyEncrypt = encryptDataApi(
    apiKey,
    process.env.NEXT_PUBLIC_SECRET_KEY as string
  );

  console.log(apiKeyEncrypt);

  if (close) {
    delete headerToken.Authorization;
  }

  try {
    const fetchData = await axios.post<T>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${url}`,
      data,
      {
        withCredentials: true,
        headers: {
          ...headerToken,
          "Accept-Language": locale,
          "X-API-KEY": apiKeyEncrypt,
        },
      }
    );

    return { data: fetchData.data as unknown as U, status: true };
  } catch (err) {
    return {
      data: (err as AxiosError)?.response?.data as U,
      status: false,
    };
  }
};

export const axiosPatch = async <T, U>(
  url: string,
  locale: string,
  data: T,
  file?: boolean,
  close?: boolean
): Promise<ApiResponse<U>> => {
  const authToken = Cookies.get("sub") ?? "";
  const tokenDecrypted = decryptData(authToken) as DecryptedToken;
  const HeaderImg = { "Content-Type": "multipart/form-data" };

  const headerToken: HeadersPost = file ? { ...HeaderImg } : {};
  headerToken.Authorization = `Bearer ${tokenDecrypted?.token}`;

  const utcTime = await getApiKey();
  const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;

  const apiKeyEncrypt = encryptDataApi(
    apiKey,
    process.env.NEXT_PUBLIC_SECRET_KEY as string
  );

  console.log(apiKeyEncrypt);

  if (close) {
    delete headerToken.Authorization;
  }

  try {
    const fetchData = await axios.put<T>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${url}`,
      data,
      {
        withCredentials: true,
        headers: {
          ...headerToken,
          "Accept-Language": locale,
          "X-API-KEY": apiKeyEncrypt,
        },
      }
    );

    return { data: fetchData.data as unknown as U, status: true };
  } catch (err) {
    if ((err as AxiosError).response?.status === 405) {
      const newToken = await getRefreshTokenPromise();
      if (newToken) {
        return axiosPatch(url, locale, data, file, close);
      }
    }
    return {
      data: (err as AxiosError)?.response?.data as U,
      status: false,
    };
  }
};

//!  DELETE request API
// Function to make a DELETE request
export const axiosDelete = async <T>(
  url: string,
  locale: string
): Promise<ApiResponse<T>> => {
  const authToken = Cookies.get("sub") ?? "";
  const tokenDecrypted = decryptData(authToken) as DecryptedToken;

  const utcTime = await getApiKey();
  const apiKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;

  const apiKeyEncrypt = encryptDataApi(
    apiKey,
    process.env.NEXT_PUBLIC_SECRET_KEY as string
  );

  try {
    const fetchData = await axios.delete<T>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${url}`,
      {
        headers: {
          Authorization: `Bearer ${tokenDecrypted?.token}`,
          "Accept-Language": locale,
          "X-API-KEY": apiKeyEncrypt,
        },
      }
    );

    return { data: fetchData.data, status: true };
  } catch (err) {
    return {
      data: (err as AxiosError)?.response?.data as T,
      status: false,
    };
  }
};

//!  PATCH request API


// ! Get from getServerSideProps
export const getFromGetServerSideProps = async <T>(
  url: string,
  newHeaders: AxiosRequestConfig = {},
  locale: string
): Promise<ApiResponse<T>> => {
  const headers = { ...newHeaders.headers, "Accept-Language": locale };

  try {
    const fetchData = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/${url}`,
      {
        headers,
      }
    );

    return { data: fetchData.data, status: true };
  } catch (err) {
    return {
      data: (err as AxiosError)?.response?.data as T,
      status: false,
    };
  }
};
