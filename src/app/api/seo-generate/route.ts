import { NextRequest, NextResponse } from "next/server";

const SEO_WEBHOOK_URL = "https://ensbot.net/webhook/seo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(SEO_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Webhook request failed" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("[POST /api/seo-generate]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
