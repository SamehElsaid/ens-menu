import { describe, expect, it } from "vitest";
import { stripSensitiveSentryContext } from "./sentryPrivacy";

describe("Sentry privacy filtering", () => {
  it("removes user, request, account, and breadcrumb context", () => {
    const sanitized = stripSensitiveSentryContext({
      message: "render failed",
      tags: { boundary: "dashboard" },
      user: { email: "owner@example.test" },
      request: {
        cookies: { session: "secret" },
        data: { phone: "+201234567890" },
      },
      contexts: { account: { id: 123 } },
      extra: { menuOwner: "Private Owner" },
      breadcrumbs: [{ data: { customerName: "Private Customer" } }],
    });

    expect(sanitized).toEqual({
      message: "render failed",
      tags: { boundary: "dashboard" },
    });
    expect(JSON.stringify(sanitized)).not.toMatch(
      /owner@example|session|phone|account|private|customer/i,
    );
  });
});
