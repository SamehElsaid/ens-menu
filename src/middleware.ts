import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptData } from "./shared/encryption";

interface DecryptedToken {
  role: string;
  staffJobRole?: string;
  phoneVerified?: boolean;
  phoneNumber?: string | null;
  [key: string]: unknown;
}

const PHONE_AUTH_PATHS = ["/auth/add-phone", "/auth/verify-phone"];

function isPhoneAuthPath(pathname: string): boolean {
  return PHONE_AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

function phoneVerificationRedirect(
  request: NextRequest,
  pathname: string,
  tokenDecrypted: DecryptedToken,
): NextResponse {
  const fullPath = request.nextUrl.pathname;
  const localeMatch = fullPath.match(/^\/(ar|en)(?=\/|$)/);
  const prefix = localeMatch ? `/${localeMatch[1]}` : "";
  const target = request.nextUrl.clone();
  const phone =
    typeof tokenDecrypted.phoneNumber === "string"
      ? tokenDecrypted.phoneNumber.trim()
      : "";

  if (phone) {
    target.pathname = `${prefix}/auth/verify-phone`;
    target.searchParams.set("phone", phone);
  } else {
    target.pathname = `${prefix}/auth/add-phone`;
  }
  return NextResponse.redirect(target);
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const token = request.cookies.get("sub");
  const pathname = url.pathname.replace(/^\/(ar|en)/, "");

  const tokenDecrypted = token
    ? (decryptData(token?.value ?? "") as DecryptedToken)
    : null;


  const hasToken =
    tokenDecrypted && Object.keys(tokenDecrypted).length > 0;

  // Block auth pages for logged-in users, except phone verification flow
  if (pathname.startsWith("/auth")) {
    if (hasToken && !isPhoneAuthPath(pathname)) {
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
    if (!hasToken) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
    if (tokenDecrypted?.phoneVerified === false) {
      return phoneVerificationRedirect(request, pathname, tokenDecrypted);
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
