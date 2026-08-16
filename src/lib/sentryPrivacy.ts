type SanitizableSentryEvent = {
  user?: unknown;
  request?: unknown;
  contexts?: unknown;
  extra?: unknown;
  breadcrumbs?: unknown;
};

/**
 * Error payloads intentionally exclude request and identity context. Exception
 * type/message/stack and low-cardinality tags remain useful for diagnosing
 * production failures without attaching customer or account data.
 */
export function stripSensitiveSentryContext<T extends SanitizableSentryEvent>(
  event: T,
): T {
  const sanitized = { ...event };
  delete sanitized.user;
  delete sanitized.request;
  delete sanitized.contexts;
  delete sanitized.extra;
  delete sanitized.breadcrumbs;
  return sanitized;
}

export const sentryPrivacyOptions = {
  sendDefaultPii: false,
  maxBreadcrumbs: 0,
  beforeSend: stripSensitiveSentryContext,
} as const;
