import { expect, test } from "@playwright/test";

test("dashboard app serves crawlable HTML without a live backend", async ({
  request,
}) => {
  const response = await request.get("/en/auth/login");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toMatch(/<!DOCTYPE html/i);
  expect(html.length).toBeGreaterThan(200);
});

test("login page exposes a credential form and no JWT payload", async ({
  page,
}) => {
  await page.goto("/en/auth/login");
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
  const html = await page.content();
  expect(html).not.toMatch(/"accessToken"\s*:/);
  expect(html).not.toMatch(/"refreshToken"\s*:/);
});

test("login form validates empty credentials on the client", async ({
  page,
}) => {
  await page.goto("/en/auth/login");
  await page.locator('button[type="submit"]').first().click();
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Password is required")).toBeVisible();
});
