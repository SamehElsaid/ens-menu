import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import { cookies } from "next/headers";
import { decryptData, encryptDataApi } from "@/shared/encryption";

interface SearchInformationBody {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

interface DecryptedToken {
  token?: string;
  [key: string]: unknown;
}

const ENDPOINT = "/searchInformation";

function buildHeaders(token: string, locale: string) {
  const utcTime = Date.now() / 1000;
  const rawKey = `${process.env.NEXT_PUBLIC_SECRET_KEY}///${utcTime}`;
  const apiKeyEncrypt = encryptDataApi(
    rawKey,
    process.env.NEXT_PUBLIC_SECRET_KEY as string,
  );

  return {
    Authorization: `Bearer ${token}`,
    "Accept-Language": locale,
    "X-API-KEY": apiKeyEncrypt,
  };
}

async function resolveAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const sub = cookieStore.get("sub")?.value ?? "";
  const decrypted = decryptData(sub) as DecryptedToken;

  const locale =
    request.nextUrl.searchParams.get("locale") ??
    request.headers.get("Accept-Language")?.split(",")[0].trim() ??
    "en";

  return { token: decrypted?.token ?? "", locale };
}

export async function GET(request: NextRequest) {
  try {
    const { token, locale } = await resolveAuth(request);

    const searchParams = request.nextUrl.searchParams;
    const forwardedParams = Object.fromEntries(searchParams.entries());
    delete forwardedParams.locale;

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}${ENDPOINT}`,
      {
        headers: buildHeaders(token, locale),
        params: forwardedParams,
      },
    );

    return NextResponse.json({ status: true, data: response.data });
  } catch (err) {
    const axiosErr = err as AxiosError;
    const httpStatus = axiosErr.response?.status ?? 500;
    const data = axiosErr.response?.data ?? {
      message: "Failed to fetch search information",
    };
    return NextResponse.json({ status: false, data }, { status: httpStatus });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, locale } = await resolveAuth(request);
    const body: Partial<SearchInformationBody> = await request.json();

    const { titleAr, titleEn, descriptionAr, descriptionEn } = body;

    if (!titleAr || !titleEn || !descriptionAr || !descriptionEn) {
      return NextResponse.json(
        {
          status: false,
          data: {
            message:
              "titleAr, titleEn, descriptionAr, and descriptionEn are all required",
          },
        },
        { status: 400 },
      );
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${ENDPOINT}`,
      { titleAr, titleEn, descriptionAr, descriptionEn },
      { headers: buildHeaders(token, locale) },
    );

    return NextResponse.json(
      { status: true, data: response.data },
      { status: 201 },
    );
  } catch (err) {
    const axiosErr = err as AxiosError;
    const httpStatus = axiosErr.response?.status ?? 500;
    const data = axiosErr.response?.data ?? {
      message: "Failed to create search information",
    };
    return NextResponse.json({ status: false, data }, { status: httpStatus });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { token, locale } = await resolveAuth(request);
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { status: false, data: { message: "id query parameter is required" } },
        { status: 400 },
      );
    }

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}${ENDPOINT}/${id}`,
      { headers: buildHeaders(token, locale) },
    );

    return NextResponse.json({ status: true, data: response.data });
  } catch (err) {
    const axiosErr = err as AxiosError;
    const httpStatus = axiosErr.response?.status ?? 500;
    const data = axiosErr.response?.data ?? {
      message: "Failed to delete search information",
    };
    return NextResponse.json({ status: false, data }, { status: httpStatus });
  }
}
