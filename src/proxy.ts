import createMiddleware from "next-intl/middleware";
import { localePathPrefix, routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptData } from "./shared/encryption";
import { isSafeInternalRedirect } from "./lib/authRedirect";

export interface DecryptedToken {
  role: string;
  staffJobRole?: string;
  [key: string]: unknown;
}

/** Locale from URL: `en` when prefixed, otherwise default `ar` (no `/ar` prefix). */
function resolveRequestLocale(pathname: string): string {
  const match = pathname.match(/^\/(en)(?=\/|$)/);
  return match?.[1] ?? routing.defaultLocale;
}

export default function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  const token = request.cookies.get("sub");
  const pathname = url.pathname.replace(/^\/(ar|en)/, "");
  const locale = resolveRequestLocale(request.nextUrl.pathname);
  const prefix = localePathPrefix(locale);

  const tokenDecrypted = token
    ? (decryptData(token?.value ?? "") as DecryptedToken)
    : null;


  const hasToken =
    tokenDecrypted && Object.keys(tokenDecrypted).length > 0;


  // Stop Login , Register , Forgot Password , Reset Password , Verify Email , Verify Phone
  if (pathname.startsWith("/auth")) {
    if (hasToken) {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      if (
        isSafeInternalRedirect(redirectParam) &&
        tokenDecrypted?.role !== "admin"
      ) {
        url.pathname = `${prefix}${redirectParam}`;
      } else {
        url.pathname =
          tokenDecrypted?.role === "admin"
            ? `${prefix}/admin`
            : `${prefix}/dashboard`;
      }
      url.search = "";
      return NextResponse.redirect(url);
    }
    return createMiddleware(routing)(request);
  }

  if (pathname.startsWith("/admin")) {
    if (tokenDecrypted?.role !== "admin") {
      url.pathname = `${prefix}/unauthorized`;
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!hasToken) {
      url.pathname = `${prefix}/unauthorized`;
      return NextResponse.redirect(url);
    }
    // Staff JWT cookie: only cashiers may use the owner dashboard UI
    if (tokenDecrypted.role === "staff") {
      if (tokenDecrypted.staffJobRole !== "cashier") {
        url.pathname = `${prefix}/unauthorized`;
        return NextResponse.redirect(url);
      }
      // Cashier: /dashboard (menu list) is owner-only — must use /dashboard/:menuId
      const isDashboardRoot =
        pathname === "/dashboard" || pathname === "/dashboard/";
      if (isDashboardRoot) {
        const target = request.nextUrl.clone();
        target.pathname = `${prefix}/unauthorized`;
        target.searchParams.set("reason", "cashier_dashboard");
        return NextResponse.redirect(target);
      }
      // Cashier: settings & staff management are owner-only
      const ownerOnlyNested = /^\/dashboard\/[^/]+\/(staff|settings)(\/|$)/;
      if (ownerOnlyNested.test(pathname)) {
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
