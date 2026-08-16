import { describe, expect, it } from "vitest";
import {
  DecryptError,
  decryptData,
  decryptDataApi,
  encryptData,
  encryptDataApi,
} from "./encryption";

describe("encryption fail-closed decrypt", () => {
  it("round-trips objects and throws on garbage", () => {
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY = "test-encryption-key-32-chars-min";
    const encoded = encryptData({ role: "admin" });
    expect(decryptData(encoded)).toEqual({ role: "admin" });
    expect(() => decryptData("not-ciphertext")).toThrow(DecryptError);
    expect(() => decryptData("")).toThrow(DecryptError);
  });

  it("does not treat a failed API decrypt as an empty success", () => {
    expect(() => decryptDataApi("not-ciphertext", "secret")).toThrow(
      DecryptError,
    );
    const encoded = encryptDataApi("1234.5", "secret");
    expect(decryptDataApi(encoded, "secret")).toBe("1234.5");
  });
});
