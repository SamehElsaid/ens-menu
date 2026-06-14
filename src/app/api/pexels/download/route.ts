import { NextRequest, NextResponse } from "next/server";

function isAllowedPexelsImageUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "images.pexels.com" ||
        parsed.hostname.endsWith(".pexels.com"))
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url")?.trim();
  if (!imageUrl || !isAllowedPexelsImageUrl(imageUrl)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: "download_failed" },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "download_failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 },
    );
  }
}
