import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAuthHintsFromEncryptedSub,
  isAuthenticatedSession,
} from "./shared/jwtPayload";

const AUTH_LOGIN_PATHS = ["/auth/login", "/auth/staff-login"];

function isAuthLoginPath(pathname: string) {
  return AUTH_LOGIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const subCookie = request.cookies.get("sub")?.value;
  const pathname = url.pathname.replace(/^\/(ar|en)/, "");

  const authHints = subCookie ? getAuthHintsFromEncryptedSub(subCookie) : null;
  const isLoggedIn = isAuthenticatedSession(subCookie);

  // Logged-in users: skip login pages only (register/reset stay reachable)
  if (isAuthLoginPath(pathname) && isLoggedIn) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    if (authHints?.effectiveRole !== "admin") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    const role = authHints?.effectiveRole;
    const staffJobRole = authHints?.staffJobRole;

    if (role === "staff") {
      if (staffJobRole !== "cashier") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

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
