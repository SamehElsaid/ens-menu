import { encryptDataApi } from "@/shared/encryption";
import { NextRequest, NextResponse } from "next/server";
import {
  backendCookieFetch,
  forwardSetCookieHeaders,
} from "@/lib/server/backendCookieRequest";

function buildApiKey() {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY!;
  const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTimestamp}`;
  return encryptDataApi(apiKey, secretKey);
}

async function forwardResponse(upstream: Response): Promise<NextResponse> {
  const data = await upstream.json().catch(() => null);
  const response = NextResponse.json(data, { status: upstream.status });
  forwardSetCookieHeaders(upstream, response);
  return response;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageName: string }> },
) {
  const { pageName } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/metaData/${pageName}`,
      {
        headers: {
          "X-API-KEY": buildApiKey(),
        },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      return NextResponse.json(null, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(`[GET /api/metaData/${pageName}]`, err);
    return NextResponse.json(null, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageName: string }> },
) {
  const { pageName } = await params;
  try {
    const body = await request.json();

    const res = await backendCookieFetch(
      request,
      `/metaData/${encodeURIComponent(pageName)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    return forwardResponse(res);
  } catch (err) {
    console.error(`[PATCH /api/metaData/${pageName}]`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageName: string }> },
) {
  const { pageName } = await params;
  try {
    const body = await request.json();

    const res = await backendCookieFetch(
      request,
      `/metaData/${encodeURIComponent(pageName)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    return forwardResponse(res);
  } catch (err) {
    console.error(`[PUT /api/metaData/${pageName}]`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageName: string }> },
) {
  const { pageName } = await params;
  try {
    const res = await backendCookieFetch(
      request,
      `/metaData/${encodeURIComponent(pageName)}`,
      {
        method: "DELETE",
      },
    );
    return forwardResponse(res);
  } catch (err) {
    console.error(`[DELETE /api/metaData/${pageName}]`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

