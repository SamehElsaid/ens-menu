import { describe, expect, it, vi } from "vitest";
import {
  getVerifiedPaymentPhase,
  recoverAndVerifyPayment,
  type PaymentVerificationResponse,
} from "./subscriptionPayment";

describe("payment verification", () => {
  it("rejects forged redirect and sync success flags", () => {
    expect(
      getVerifiedPaymentPhase({
        data: {
          payment_status: "failed",
          redirect_status: "PAID",
          synced_from_redirect: true,
          subscription_synced: true,
        },
      }),
    ).toBe("error");
  });

  it.each([
    ["pending", "pending"],
    ["failed", "error"],
    ["completed", "success"],
    [" COMPLETED ", "success"],
  ] as const)("maps backend payment_status=%s to %s", (status, expected) => {
    expect(
      getVerifiedPaymentPhase({ data: { payment_status: status } }),
    ).toBe(expected);
  });

  it.each([
    ["pending", "activation-pending"],
    ["processing", "activation-pending"],
    ["failed", "activation-failed"],
    ["error", "activation-failed"],
  ] as const)(
    "distinguishes completed payment with activation_status=%s",
    (activationStatus, expected) => {
      expect(
        getVerifiedPaymentPhase({
          data: {
            payment_status: "completed",
            requires_activation: true,
            activation_status: activationStatus,
          },
        }),
      ).toBe(expected);
    },
  );

  it("requires completed activation for explicit entitlement payments", () => {
    expect(
      getVerifiedPaymentPhase({
        data: {
          payment_status: "completed",
          requires_activation: true,
        },
      }),
    ).toBe("activation-pending");
    expect(
      getVerifiedPaymentPhase({
        data: {
          paymentStatus: "completed",
          requiresActivation: true,
          activationStatus: false,
        },
      }),
    ).toBe("activation-failed");
    expect(
      getVerifiedPaymentPhase({
        data: {
          paymentStatus: "completed",
          requiresActivation: true,
          activationStatus: "completed",
        },
      }),
    ).toBe("success");
  });

  it("uses only server-authored payment kinds to require activation", () => {
    expect(
      getVerifiedPaymentPhase({
        data: {
          payment_status: "completed",
          paymentKind: "subscription",
        },
      }),
    ).toBe("activation-pending");
    expect(
      getVerifiedPaymentPhase({
        data: {
          payment_status: "completed",
          payment_kind: "extra_menus",
          activation_status: "completed",
        },
      }),
    ).toBe("success");
  });

  it("does not trust browser customerReference or query kind", () => {
    const forgedBrowserMetadata = {
      data: {
        payment_status: "completed",
        customerReference: JSON.stringify({ kind: "invoice" }),
        kind: "invoice",
      },
    } as unknown as PaymentVerificationResponse;

    expect(getVerifiedPaymentPhase(forgedBrowserMetadata)).toBe("success");
    expect(
      getVerifiedPaymentPhase(forgedBrowserMetadata, {
        knownSubscriptionCallback: true,
      }),
    ).toBe("activation-pending");
  });

  it("fails pending on the subscription callback when contract fields are absent", () => {
    expect(
      getVerifiedPaymentPhase(
        { data: { paymentStatus: "completed" } },
        { knownSubscriptionCallback: true },
      ),
    ).toBe("activation-pending");
  });

  it("treats server-authored activation status as an entitlement contract", () => {
    expect(
      getVerifiedPaymentPhase({
        data: {
          payment_status: "completed",
          activationStatus: "pending",
        },
      }),
    ).toBe("activation-pending");
    expect(
      getVerifiedPaymentPhase({
        data: {
          payment_status: "completed",
          activation_status: "completed",
        },
      }),
    ).toBe("success");
  });

  it("keeps completed non-entitlement payments compatible", () => {
    expect(
      getVerifiedPaymentPhase({
        data: {
          paymentStatus: "completed",
          requiresActivation: false,
        },
      }),
    ).toBe("success");
    expect(
      getVerifiedPaymentPhase({
        data: { payment_status: "completed", paymentKind: "invoice" },
      }),
    ).toBe("success");
  });

  it("recovery re-verifies and does not promote a pending payment", async () => {
    const recover = vi.fn().mockResolvedValue({ status: true });
    const verify = vi.fn().mockResolvedValue({
      status: true,
      data: { data: { payment_status: "pending" } },
    });

    const result = await recoverAndVerifyPayment(recover, verify);

    expect(recover).toHaveBeenCalledOnce();
    expect(verify).toHaveBeenCalledOnce();
    expect(getVerifiedPaymentPhase(result.data ?? {})).toBe("pending");
  });

  it("recovery only succeeds after a completed re-verification", async () => {
    const result = await recoverAndVerifyPayment(
      async () => ({ status: true }),
      async () => ({
        status: true,
        data: { data: { payment_status: "completed" } },
      }),
    );

    expect(getVerifiedPaymentPhase(result.data ?? {})).toBe("success");
  });

  it("does not verify after a failed recovery request", async () => {
    const verify = vi.fn();
    const result = await recoverAndVerifyPayment(
      async () => ({ status: false, statusCode: 503 }),
      verify,
    );

    expect(result.status).toBe(false);
    expect(verify).not.toHaveBeenCalled();
  });
});
