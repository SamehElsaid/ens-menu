import { NextResponse } from "next/server";

export function xmlResponse(xml: string, maxAge = 3600): NextResponse {
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=86400`,
    },
  });
}
