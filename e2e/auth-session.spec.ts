import { expect, test } from "@playwright/test";

test("browser login keeps credentials HttpOnly and stores token-free UI hints", async ({
  context,
  page,
}) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:3000",
        "access-control-allow-credentials": "true",
        "set-cookie":
          "ens_access=server-only-access; Path=/; HttpOnly; SameSite=Lax",
      },
      body: JSON.stringify({
        user: { id: 42, role: "user", email: "owner@example.test" },
        csrfToken: "signed-csrf-token",
      }),
    });
  });

  await page.goto("/en/auth/login");
  await page.locator("#login-email").fill("owner@example.test");
  await page.locator("#login-password").fill("valid-password");

  const responsePromise = page.waitForResponse("**/api/auth/login");
  await page.locator('button[type="submit"]').click();
  await responsePromise;

  await expect
    .poll(async () => (await context.cookies()).some((cookie) => cookie.name === "ens_access"))
    .toBe(true);

  const cookies = await context.cookies();
  const accessCookie = cookies.find((cookie) => cookie.name === "ens_access");
  const uiCookie = cookies.find((cookie) => cookie.name === "ens_ui");

  expect(accessCookie?.httpOnly).toBe(true);
  expect(uiCookie?.httpOnly).toBe(false);
  expect(uiCookie?.value).not.toContain("server-only-access");
  expect(uiCookie?.value).not.toContain("refresh");
});
