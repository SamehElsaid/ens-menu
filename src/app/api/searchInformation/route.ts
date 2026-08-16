import { NextRequest, NextResponse } from "next/server";
import {
  backendCookieFetch,
  forwardSetCookieHeaders,
} from "@/lib/server/backendCookieRequest";

interface SearchInformationBody {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

const ENDPOINT = "/searchInformation";

async function wrappedResponse(
  upstream: Response,
  successStatus = upstream.status,
): Promise<NextResponse> {
  const data = await upstream.json().catch(() => null);
  const response = NextResponse.json(
    { status: upstream.ok, data },
    { status: upstream.ok ? successStatus : upstream.status },
  );
  forwardSetCookieHeaders(upstream, response);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    const forwarded = new URLSearchParams(request.nextUrl.searchParams);
    forwarded.delete("locale");
    const suffix = forwarded.size ? `?${forwarded.toString()}` : "";
    return wrappedResponse(
      await backendCookieFetch(request, `${ENDPOINT}${suffix}`),
    );
  } catch {
    return NextResponse.json(
      { status: false, data: { message: "Failed to fetch search information" } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const upstream = await backendCookieFetch(request, ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleAr, titleEn, descriptionAr, descriptionEn }),
    });
    return wrappedResponse(upstream, 201);
  } catch {
    return NextResponse.json(
      { status: false, data: { message: "Failed to create search information" } },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { status: false, data: { message: "id query parameter is required" } },
        { status: 400 },
      );
    }

    const upstream = await backendCookieFetch(
      request,
      `${ENDPOINT}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return wrappedResponse(upstream);
  } catch {
    return NextResponse.json(
      { status: false, data: { message: "Failed to delete search information" } },
      { status: 500 },
    );
  }
}
