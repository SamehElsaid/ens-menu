import { describe, expect, it } from "vitest";
import {
  extractApiErrorMessage,
  resolveApiErrorMessage,
  unexpectedRequestError,
} from "@/api/apiError";
import { advertisementEndpoints } from "@/api/endpoints/advertisements";
import { orderEndpoints } from "@/api/endpoints/orders";

describe("domain API helpers", () => {
  it("prefers the localized API error", () => {
    const error = {
      error: "Fallback",
      errorAr: "تعذر حفظ التغييرات",
      errorEn: "Could not save changes",
    };

    expect(extractApiErrorMessage(error, "ar")).toBe(
      "تعذر حفظ التغييرات",
    );
    expect(extractApiErrorMessage(error, "en")).toBe(
      "Could not save changes",
    );
  });

  it("provides bilingual fallbacks for thrown request failures", () => {
    expect(unexpectedRequestError("ar")).toContain("تعذر");
    expect(unexpectedRequestError("en")).toContain("could not");
    expect(resolveApiErrorMessage(undefined, "ar")).toContain("تعذر");
    expect(resolveApiErrorMessage(undefined, "en")).toContain("could not");
  });

  it("builds scoped endpoint paths", () => {
    expect(advertisementEndpoints.admin.detail(17)).toBe("/admin/ads/17");
    expect(orderEndpoints.account.detail("entry-1")).toBe(
      "/dashboard/orders/entry-1",
    );
    expect(orderEndpoints.menu.detail(9, "entry-1")).toBe(
      "/menus/9/activity-logs/entry-1",
    );
  });
});
