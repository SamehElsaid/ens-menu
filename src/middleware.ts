import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  const token = request.cookies.get("sub");


  // Stop Login , Register , Forgot Password , Reset Password , Verify Email , Verify Phone
  if (url.pathname.startsWith("/auth")) {
    if (token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if (url.pathname.startsWith("/dashboard")) {
    if (!token) {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }


  return createMiddleware(routing)(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
