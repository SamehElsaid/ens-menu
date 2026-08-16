import { describe, expect, it, vi } from "vitest";
import {
  clearPaymentAttempt,
  getPaymentAttemptKey,
  paymentKindToAttemptScope,
  shouldClearPaymentAttempt,
} from "./paymentIdempotency";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("payment attempt idempotency", () => {
  it("reuses one key for retries of the same attempt", () => {
    const storage = memoryStorage();
    const createKey = vi.fn(() => "attempt-1");

    expect(
      getPaymentAttemptKey("subscription", "same", { storage, createKey }),
    ).toBe("attempt-1");
    expect(
      getPaymentAttemptKey("subscription", "same", { storage, createKey }),
    ).toBe("attempt-1");
    expect(createKey).toHaveBeenCalledOnce();
  });

  it("replaces the key when checkout parameters change", () => {
    const storage = memoryStorage();
    const createKey = vi
      .fn<() => string>()
      .mockReturnValueOnce("attempt-1")
      .mockReturnValueOnce("attempt-2");

    getPaymentAttemptKey("extra-menus", "quantity:1", {
      storage,
      createKey,
    });
    expect(
      getPaymentAttemptKey("extra-menus", "quantity:2", {
        storage,
        createKey,
      }),
    ).toBe("attempt-2");
  });

  it("clears only the matching terminal attempt scope", () => {
    const storage = memoryStorage();
    const createKey = vi
      .fn<() => string>()
      .mockReturnValueOnce("subscription-1")
      .mockReturnValueOnce("extra-1")
      .mockReturnValueOnce("subscription-2");

    getPaymentAttemptKey("subscription", "one", { storage, createKey });
    getPaymentAttemptKey("extra-menus", "one", { storage, createKey });
    clearPaymentAttempt("subscription", storage);
    expect(
      getPaymentAttemptKey("subscription", "one", { storage, createKey }),
    ).toBe("subscription-2");
    expect(
      getPaymentAttemptKey("extra-menus", "one", { storage, createKey }),
    ).toBe("extra-1");
  });

  it.each([
    ["pro_monthly", "subscription"],
    ["subscription-renewal", "subscription"],
    ["extra_menus", "extra-menus"],
    ["order", null],
  ] as const)("maps backend payment kind %s to scope %s", (kind, scope) => {
    expect(paymentKindToAttemptScope(kind)).toBe(scope);
  });

  it("keeps paid activation-pending and recoverable failures replay-safe", () => {
    expect(shouldClearPaymentAttempt("activation-pending")).toBe(false);
    expect(shouldClearPaymentAttempt("activation-failed")).toBe(false);
    expect(shouldClearPaymentAttempt("pending")).toBe(false);
    expect(shouldClearPaymentAttempt("success")).toBe(true);
    expect(shouldClearPaymentAttempt("error", "declined")).toBe(true);
  });

  it("does not block checkout when session storage rejects writes", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("storage unavailable");
      },
      removeItem: () => undefined,
    };
    expect(
      getPaymentAttemptKey("subscription", "one", {
        storage,
        createKey: () => "fallback-key",
      }),
    ).toBe("fallback-key");
  });
});
