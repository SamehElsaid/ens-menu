import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";
const MENU_URL = process.env.NEXT_PUBLIC_MENU_URL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function GET(request: NextRequest) {
  try {
    const base = (APP_URL || request.nextUrl.origin).replace(/\/$/, "");
    const homeAr = `${base}/ar`;
    const homeEn = `${base}/`;

    const res = await fetch(`${BASE_URL}/public/menus`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><error>Failed to fetch menus</error>`,
        {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
        }
      );
    }

    const slugs = (await res.json()) as string[];
    const menuUrls =
      Array.isArray(slugs) && MENU_URL
        ? slugs.map(
            (slug) =>
              `https://${String(slug).trim()}${MENU_URL}`.replace(
                /^(https?:\/\/)+/,
                "https://"
              )
          )
        : [];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urls>
  <url><loc>${escapeXml(homeAr)}</loc><path>/ar</path><type>home</type><locale>ar</locale></url>
  <url><loc>${escapeXml(homeEn)}</loc><path>/</path><type>home</type><locale>en</locale></url>
${menuUrls
      .map(
        (loc) =>
          `  <url><loc>${escapeXml(loc)}</loc><path>/</path><type>menu</type><locale>en</locale></url>
  <url><loc>${escapeXml(loc.replace(/\/$/, "") + "/ar")}</loc><path>/ar</path><type>menu</type><locale>ar</locale></url>`
      )
      .join("\n")}
</urls>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    console.error("sitemap.xml error:", e);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error>Error generating XML</error>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
