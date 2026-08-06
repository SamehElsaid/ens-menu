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
      <div className="auth-social-divider auth-social-divider--subtle mb-3.5 flex w-full items-center gap-2.5">
        <span
          aria-hidden
          className="h-px flex-1 bg-slate-200/70 dark:bg-slate-700/60"
        />
        <span className="shrink-0 text-[10px] font-normal text-slate-400/90 dark:text-slate-500/90">
          {t(dividerLabel)}
        </span>
        <span
          aria-hidden
          className="h-px flex-1 bg-slate-200/70 dark:bg-slate-700/60"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <GoogleSignInButton
          redirectParam={redirectParam}
          variant="full"
        />
        <AppleSignInButton
          redirectParam={redirectParam}
          variant="full"
          showDivider={false}
        />
      </div>
    </div>
  );
}
