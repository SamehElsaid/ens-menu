const STORAGE_PREFIX = "ens_payment_attempt:";

export type PaymentAttemptScope = "subscription" | "extra-menus";

export function paymentKindToAttemptScope(
  value: unknown,
): PaymentAttemptScope | null {
  if (typeof value !== "string") return null;
  const kind = value.trim().toLowerCase();
  if (/extra(?:-|_|\s)*menus?/.test(kind)) return "extra-menus";
  if (/subscription|pro(?:-|_|$)|renewal|upgrade/.test(kind)) {
    return "subscription";
  }
  return null;
}

export function shouldClearPaymentAttempt(
  phase:
    | "success"
    | "pending"
    | "activation-pending"
    | "activation-failed"
    | "error",
  paymentStatus?: unknown,
): boolean {
  if (phase === "success") return true;
  if (phase !== "error" || typeof paymentStatus !== "string") return false;
  return ["failed", "cancelled", "canceled", "declined"].includes(
    paymentStatus.trim().toLowerCase(),
  );
}

type StoredAttempt = {
  fingerprint: string;
  key: string;
};

type AttemptStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStorage(): AttemptStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function storageKey(scope: PaymentAttemptScope): string {
  return `${STORAGE_PREFIX}${scope}`;
}

export function getPaymentAttemptKey(
  scope: PaymentAttemptScope,
  fingerprint: string,
  options?: {
    storage?: AttemptStorage | null;
    createKey?: () => string;
  },
): string {
  const storage = options?.storage ?? defaultStorage();
  const createKey = options?.createKey ?? (() => crypto.randomUUID());
  if (!storage) return createKey();

  try {
    const existing = JSON.parse(
      storage.getItem(storageKey(scope)) ?? "null",
    ) as StoredAttempt | null;
    if (
      existing?.fingerprint === fingerprint &&
      typeof existing.key === "string" &&
      existing.key
    ) {
      return existing.key;
    }
  } catch {
    // Replace malformed browser state with a fresh attempt.
  }

  const key = createKey();
  try {
    storage.setItem(
      storageKey(scope),
      JSON.stringify({ fingerprint, key } satisfies StoredAttempt),
    );
  } catch {
    // The request can still proceed when browser storage is unavailable.
  }
  return key;
}

export function clearPaymentAttempt(
  scope: PaymentAttemptScope,
  storage: AttemptStorage | null = defaultStorage(),
): void {
  try {
    storage?.removeItem(storageKey(scope));
  } catch {
    // Storage cleanup is best-effort.
  }
}
