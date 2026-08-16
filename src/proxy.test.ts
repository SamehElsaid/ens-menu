import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}));

vi.mock("./shared/authUiCookie", () => ({
  AUTH_UI_COOKIE_NAME: "ens_ui",
  decodeAuthUiCookieValue: (value: string) => {
    try {
      return JSON.parse(decodeURIComponent(value));
    } catch {
      return null;
    }
  },
}));

import proxy from "./proxy";

function request(path: string, hints?: Record<string, unknown>): NextRequest {
  const headers = new Headers();
  if (hints) {
    headers.set("cookie", `ens_ui=${encodeURIComponent(JSON.stringify(hints))}`);
  }
  return new NextRequest(`https://menu.example.test${path}`, { headers });
}

describe("proxy cookie gating", () => {
  it("redirects a dashboard request without ens_ui", () => {
    const response = proxy(request("/en/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://menu.example.test/en/unauthorized",
    );
  });

  it("allows a hinted owner through dashboard gating", () => {
    const response = proxy(request("/en/dashboard", { role: "user" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirects signed-in admins away from login", () => {
    const response = proxy(request("/en/auth/login", { role: "admin" }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://menu.example.test/en/admin",
    );
  });

  it("keeps staff permission hints as UI gating only", () => {
    const response = proxy(
      request("/en/dashboard/staff", { role: "staff", permissions: [] }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/en/unauthorized");
  });
});
