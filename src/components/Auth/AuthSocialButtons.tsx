"use client";

import { useTranslations } from "next-intl";
import GoogleSignInButton from "@/components/Auth/GoogleSignInButton";
import AppleSignInButton from "@/components/Auth/AppleSignInButton";

const hasGoogleClientId = !!(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
);
const hasAppleClientId = !!process.env.NEXT_PUBLIC_APPLE_CLIENT_ID?.trim();

type AuthSocialButtonsProps = {
  dividerLabel: string;
  redirectParam?: string | null;
  className?: string;
};

export default function AuthSocialButtons({
  dividerLabel,
  redirectParam = null,
  className = "",
}: AuthSocialButtonsProps) {
  const t = useTranslations("");

  if (!hasGoogleClientId && !hasAppleClientId) {
    return null;
  }

  return (
    <div className={className}>
      <div className="mb-4 flex w-full items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-site-line" />
        <span className="shrink-0 text-site-xs text-site-muted">
          {t(dividerLabel)}
        </span>
        <span aria-hidden className="h-px flex-1 bg-site-line" />
      </div>

      <div className="flex flex-col gap-3">
        <GoogleSignInButton redirectParam={redirectParam} />
        <AppleSignInButton redirectParam={redirectParam} />
      </div>
    </div>
  );
}
