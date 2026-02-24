import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptData } from "./shared/encryption";

interface DecryptedToken {
  role: string;
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
  }

  return createMiddleware(routing)(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
