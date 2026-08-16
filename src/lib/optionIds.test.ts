import { describe, expect, it } from "vitest";
import {
  createPersistentOptionId,
  isPersistentOptionId,
  persistentOptionIdForLegacy,
} from "./optionIds";

describe("persistent option IDs", () => {
  it("matches the backend string format", () => {
    expect(isPersistentOptionId("size-existing-42")).toBe(true);
    expect(isPersistentOptionId(42)).toBe(false);
    expect(isPersistentOptionId("short")).toBe(false);
  });

  it("prefixes generated UUIDs so numeric-leading values stay valid", () => {
    const id = createPersistentOptionId(
      () => "12345678-1234-1234-1234-123456789abc",
    );
    expect(id).toBe("opt_12345678-1234-1234-1234-123456789abc");
    expect(isPersistentOptionId(id)).toBe(true);
  });

  it("preserves valid IDs and deterministically upgrades import legacy IDs", () => {
    expect(
      persistentOptionIdForLegacy("option-stable-id", "item:0"),
    ).toBe("option-stable-id");
    const first = persistentOptionIdForLegacy(7, "item:0");
    const second = persistentOptionIdForLegacy(7, "item:0");
    expect(first).toBe(second);
    expect(isPersistentOptionId(first)).toBe(true);
  });

  it("matches the cross-application legacy fixtures", () => {
    expect(persistentOptionIdForLegacy(undefined, "size:وسط:30")).toBe(
      "opt_1myjiwd1d6l8i9",
    );
    expect(persistentOptionIdForLegacy(undefined, "variant:حار:3")).toBe(
      "opt_18snvy20es1weu",
    );
  });
});
