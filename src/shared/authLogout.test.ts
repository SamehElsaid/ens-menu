import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  cookieRemove: vi.fn(),
  decryptDataApi: vi.fn(),
  encryptDataApi: vi.fn(),
  resetFcmSync: vi.fn(),
  resolveFcmTokenForLogout: vi.fn(),
  clearAuthUiCookie: vi.fn(),
  clearStoredCsrfToken: vi.fn(),
  getStoredCsrfToken: vi.fn(),
  storeCsrfToken: vi.fn(),
}));

vi.mock("axios", () => ({
  default: { get: mocks.get, post: mocks.post },
}));
vi.mock("js-cookie", () => ({
  default: { remove: mocks.cookieRemove },
}));
vi.mock("./encryption", () => ({
  decryptDataApi: mocks.decryptDataApi,
  encryptDataApi: mocks.encryptDataApi,
}));
vi.mock("./syncFcmToken", () => ({
  resetFcmSync: mocks.resetFcmSync,
  resolveFcmTokenForLogout: mocks.resolveFcmTokenForLogout,
}));
vi.mock("./authUiCookie", () => ({
  clearAuthUiCookie: mocks.clearAuthUiCookie,
}));
vi.mock("./csrfToken", () => ({
  clearStoredCsrfToken: mocks.clearStoredCsrfToken,
  getStoredCsrfToken: mocks.getStoredCsrfToken,
  storeCsrfToken: mocks.storeCsrfToken,
}));
vi.mock("@/i18n/routing", () => ({
  routing: { defaultLocale: "ar", locales: ["ar", "en"] },
  localePathPrefix: (locale: string) => (locale === "ar" ? "" : `/${locale}`),
}));

import { performAuthLogout } from "./authLogout";

describe("performAuthLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = "https://api.example.test";
    process.env.NEXT_PUBLIC_SECRET_KEY = "secret";
    mocks.resolveFcmTokenForLogout.mockResolvedValue("fcm-token");
    mocks.decryptDataApi.mockReturnValue(1234);
    mocks.encryptDataApi.mockReturnValue("api-key");
    mocks.getStoredCsrfToken.mockReturnValue("csrf-token");
    mocks.post.mockResolvedValue({ data: {} });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ fx_dyn: "time" }),
    }));
    vi.stubGlobal("window", {
      location: { pathname: "/en/dashboard", href: "" },
    });
  });

  it("logs out with cookies and no browser-stored refresh token", async () => {
    await performAuthLogout();

    expect(mocks.post).toHaveBeenCalledWith(
      "https://api.example.test/auth/logout",
      { fcmToken: "fcm-token" },
      expect.objectContaining({
        withCredentials: true,
        headers: expect.objectContaining({
          "X-CSRF-Token": "csrf-token",
        }),
      }),
    );
    expect(mocks.post.mock.calls[0]?.[1]).not.toHaveProperty("refreshToken");
    expect(mocks.clearAuthUiCookie).toHaveBeenCalled();
    expect(mocks.clearStoredCsrfToken).toHaveBeenCalled();
    expect(mocks.cookieRemove).toHaveBeenCalledWith("sub", { path: "/" });
    expect(window.location.href).toBe("/en");
  });

  it("still clears local state when the backend call fails", async () => {
    mocks.post.mockRejectedValueOnce(new Error("offline"));
    await performAuthLogout();
    expect(mocks.clearAuthUiCookie).toHaveBeenCalled();
    expect(mocks.resetFcmSync).toHaveBeenCalled();
  });
});
