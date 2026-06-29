import { encryptDataApi } from "@/shared/encryption";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptData } from "@/shared/encryption";

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

export async function GET() {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metaData`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-API-KEY": buildApiKey(),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[GET /api/metaData]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const body = await request.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/metaData`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-API-KEY": buildApiKey(),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[POST /api/metaData]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
