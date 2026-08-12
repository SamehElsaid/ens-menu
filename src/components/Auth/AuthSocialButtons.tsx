"use client";

import { useId } from "react";
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
  const labelId = useId();

  if (!hasGoogleClientId && !hasAppleClientId) {
    return null;
  }

  return (
    /* A named group, not a decorated divider.
     *
     * The centred `line — text — line` rule was the marketing template this
     * direction refuses (DESIGN.md §1): it centred a label inside a symmetrical
     * rule and left the label doing nothing but interrupting. It is now a ticket
     * heading on the inline start with the rule running out to the end of the
     * measure, and that heading is the group's accessible name — so "Or login
     * with" is what a screen reader announces when it reaches these two buttons,
     * instead of a stray line of text between two hairlines. */
    <section aria-labelledby={labelId} className={className}>
      <div className="mb-3.5 flex items-center gap-3">
        <h2 id={labelId} className="s-ticket text-site-muted">
          {t(dividerLabel)}
        </h2>
        <span aria-hidden className="h-px flex-1 bg-site-line" />
      </div>

      <div className="flex flex-col gap-2.5">
        <GoogleSignInButton redirectParam={redirectParam} />
        <AppleSignInButton redirectParam={redirectParam} />
      </div>
    </section>
  );
}
