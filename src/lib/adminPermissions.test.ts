import { describe, expect, it } from "vitest";
import {
  adminRouteToPermission,
  canAccessAdminPath,
  hasAdminPermission,
} from "./adminPermissions";

describe("admin permission grants", () => {
  it("fails closed when grants have not loaded", () => {
    expect(hasAdminPermission(undefined, "users")).toBe(false);
    expect(canAccessAdminPath(undefined, "/admin/users")).toBe(false);
  });

  it("treats null as unrestricted supervisor access", () => {
    expect(hasAdminPermission(null, "users")).toBe(true);
    expect(canAccessAdminPath(null, "/admin/payments")).toBe(true);
  });

  it("limits a restricted admin to granted keys", () => {
    expect(hasAdminPermission(["analytics"], "users")).toBe(false);
    expect(canAccessAdminPath(["users"], "/admin/users/12")).toBe(true);
    expect(canAccessAdminPath(["users"], "/admin/analytics")).toBe(false);
  });

  it("maps broadcast and vouchers onto existing keys", () => {
    expect(adminRouteToPermission("/admin/broadcast")).toBe("users");
    expect(adminRouteToPermission("/admin/vouchers")).toBe("promo");
    expect(adminRouteToPermission("/admin")).toBeNull();
  });
});
