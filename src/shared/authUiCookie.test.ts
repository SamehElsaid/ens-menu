import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  cookieRemove: vi.fn(),
  encryptData: vi.fn((value: unknown) => JSON.stringify(value)),
  decryptData: vi.fn((value: string) => JSON.parse(value)),
}));

vi.mock("js-cookie", () => ({
  default: {
    get: mocks.cookieGet,
    set: mocks.cookieSet,
    remove: mocks.cookieRemove,
  },
}));

vi.mock("@/shared/encryption", () => ({
  encryptData: mocks.encryptData,
  decryptData: mocks.decryptData,
}));

import {
  AUTH_UI_COOKIE_NAME,
  decodeAuthUiCookieValue,
  writeAuthUiCookie,
} from "./authUiCookie";

describe("auth UI cookie", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores only allow-listed, token-free UI hints", () => {
    writeAuthUiCookie({
      role: "staff",
      permissions: ["orders.read"],
      menuUuid: "menu-1",
      token: "must-not-persist",
      refreshToken: "must-not-persist",
    } as Parameters<typeof writeAuthUiCookie>[0]);

    expect(mocks.encryptData).toHaveBeenCalledWith({
      role: "staff",
      permissions: ["orders.read"],
      menuUuid: "menu-1",
    });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      AUTH_UI_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({ path: "/", secure: true }),
    );
  });

  it("rejects malformed or role-less cookie values", () => {
    expect(decodeAuthUiCookieValue("{}")).toBeNull();
    mocks.decryptData.mockImplementationOnce(() => {
      throw new Error("invalid");
    });
    expect(decodeAuthUiCookieValue("invalid")).toBeNull();
  });
});
