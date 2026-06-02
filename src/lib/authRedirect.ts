export const SUBSCRIPTION_UPGRADE_PATH = "/dashboard/subscription";

export function isSafeInternalRedirect(
  path: string | null | undefined,
): path is string {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}

export function buildLoginUrlWithRedirect(path: string): string {
  return `/auth/login?redirect=${encodeURIComponent(path)}`;
}

export function getSubscriptionUpgradeHref(isLoggedIn: boolean): string {
  if (isLoggedIn) return SUBSCRIPTION_UPGRADE_PATH;
  return buildLoginUrlWithRedirect(SUBSCRIPTION_UPGRADE_PATH);
}

export function resolvePostLoginPath(
  locale: string,
  role: string | undefined,
  redirectParam: string | null,
): string {
  if (role === "admin") {
    return `/${locale}/admin`;
  }

  if (isSafeInternalRedirect(redirectParam)) {
    return `/${locale}${redirectParam}`;
  }

  return `/${locale}/dashboard`;
}
