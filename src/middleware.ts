import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptData } from "./shared/encryption";

interface DecryptedToken {
  role: string;
  staffJobRole?: string;
  [key: string]: unknown;
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const token = request.cookies.get("sub");
  const pathname = url.pathname.replace(/^\/(ar|en)/, "");

  const tokenDecrypted = token
    ? (decryptData(token?.value ?? "") as DecryptedToken)
    : null;

  // Stop Login , Register , Forgot Password , Reset Password , Verify Email , Verify Phone
  if (pathname.startsWith("/auth")) {
    if (tokenDecrypted) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (tokenDecrypted?.role !== "admin") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!tokenDecrypted) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    // Staff JWT cookie: only cashiers may use the owner dashboard UI
    if (tokenDecrypted.role === "staff") {
      if (tokenDecrypted.staffJobRole !== "cashier") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }
      // Cashier: /dashboard (menu list) is owner-only — must use /dashboard/:menuId
      const isDashboardRoot =
        pathname === "/dashboard" || pathname === "/dashboard/";
      if (isDashboardRoot) {
        const fullPath = request.nextUrl.pathname;
        const localeMatch = fullPath.match(/^\/(ar|en)(?=\/|$)/);
        const prefix = localeMatch ? `/${localeMatch[1]}` : "";
        const target = request.nextUrl.clone();
        target.pathname = `${prefix}/unauthorized`;
        target.searchParams.set("reason", "cashier_dashboard");
        return NextResponse.redirect(target);
      }
      // Cashier: settings & staff management are owner-only
      const ownerOnlyNested = /^\/dashboard\/[^/]+\/(staff|settings)(\/|$)/;
      if (ownerOnlyNested.test(pathname)) {
        const fullPath = request.nextUrl.pathname;
        const localeMatch = fullPath.match(/^\/(ar|en)(?=\/|$)/);
        const prefix = localeMatch ? `/${localeMatch[1]}` : "";
        const target = request.nextUrl.clone();
        target.pathname = `${prefix}/unauthorized`;
        target.searchParams.set("reason", "cashier_owner_pages");
        return NextResponse.redirect(target);
      }
    }
  }

  return createMiddleware(routing)(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
