import * as Sentry from "@sentry/nextjs";
import { sentryPrivacyOptions } from "@/lib/sentryPrivacy";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === "production",
    ...sentryPrivacyOptions,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
