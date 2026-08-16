import { NextRequest, NextResponse } from "next/server";
import {
  backendCookieFetch,
  forwardSetCookieHeaders,
} from "@/lib/server/backendCookieRequest";

async function forwardResponse(upstream: Response): Promise<NextResponse> {
  const data = await upstream.json().catch(() => null);
  const response = NextResponse.json(data, { status: upstream.status });
  forwardSetCookieHeaders(upstream, response);
  return response;
}

export async function GET(request: NextRequest) {
  try {
    return forwardResponse(await backendCookieFetch(request, "/metaData"));
  } catch (error) {
    console.error("[GET /api/metaData]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstream = await backendCookieFetch(request, "/metaData", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return forwardResponse(upstream);
  } catch (error) {
    console.error("[POST /api/metaData]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
