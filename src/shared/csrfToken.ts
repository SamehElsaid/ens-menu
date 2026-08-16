export const CSRF_SESSION_STORAGE_KEY = "ens_csrf";

export function getStoredCsrfToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return sessionStorage.getItem(CSRF_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeCsrfToken(token: unknown): void {
  if (typeof token !== "string" || !token || typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(CSRF_SESSION_STORAGE_KEY, token);
  } catch {
    // Storage may be unavailable in private browsing or hardened webviews.
  }
}

export function storeCsrfTokenFromPayload(payload: unknown): void {
  if (!payload || typeof payload !== "object") return;
  storeCsrfToken((payload as { csrfToken?: unknown }).csrfToken);
}

export function clearStoredCsrfToken(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(CSRF_SESSION_STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
}
