import axios, { AxiosError, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { decryptData } from "./encryption";

interface ApiResponse<T> {
  data?: T;
  status: boolean;
}

interface DecryptedToken {
  token?: string;
  [key: string]: unknown;
}

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

  try {
    const header: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer  ${token || tokenDecrypted?.token}`,
        "Accept-Language": locale,
      },
      params,
    };
    if (close) {
      delete header.headers?.Authorization;
    }
    const fetchData = await axios.get<T>(
      `${url}`,
      header
    );


    return { data: fetchData.data, status: true };
  } catch (err) {
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
export const axiosPost = async <T>(
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

  if (close) {
    delete headerToken.Authorization;
  }

  try {
    const fetchData = await axios.post<T>(
      `${process.env.BASE_URL}/${url}`,
      data,
      {
        withCredentials: true,
        headers: {
          ...headerToken,
          "Accept-Language": locale,
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

// ! Get from getServerSideProps
export const getFromGetServerSideProps = async <T>(
  url: string,
  newHeaders: AxiosRequestConfig = {},
  locale: string
): Promise<ApiResponse<T>> => {
  const headers = { ...newHeaders.headers, "Accept-Language": locale };

  try {
    const fetchData = await axios.get(`${process.env.BASE_URL}/${url}`, {
      headers,
    });

    return { data: fetchData.data, status: true };
  } catch (err) {
    return {
      data: (err as AxiosError)?.response?.data as T,
      status: false,
    };
  }
};
