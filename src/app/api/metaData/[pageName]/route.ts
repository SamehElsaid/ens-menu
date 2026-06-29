import { encryptDataApi, decryptData } from "@/shared/encryption";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function buildApiKey() {
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY!;
  const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
  const apiKey = `${secretKey}///${utcTimestamp}`;
  return encryptDataApi(apiKey, secretKey);
}

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sub = cookieStore.get("sub")?.value;
  if (!sub) return null;
  const decoded = decryptData(sub) as { token?: string };
  return decoded?.token ?? null;
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
    const token = await getAuthToken();
    const body = await request.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/metaData/${pageName}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-API-KEY": buildApiKey(),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
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
    const token = await getAuthToken();
    const body = await request.json();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/metaData/${pageName}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-API-KEY": buildApiKey(),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[PUT /api/metaData/${pageName}]`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ pageName: string }> },
) {
  const { pageName } = await params;
  try {
    const token = await getAuthToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/metaData/${pageName}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-KEY": buildApiKey(),
        },
      },
    );

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`[DELETE /api/metaData/${pageName}]`, err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

