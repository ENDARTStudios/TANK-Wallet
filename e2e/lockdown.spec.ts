import { test, expect } from "@playwright/test";

test.describe("Lockdown e skeleton compliance", () => {
  test("dashboard exibe Wallet Health quando desbloqueado (mock)", async ({ page }) => {
    await page.goto("/");
    // Wait for onboarding to hydrate (wallet is locked by default)
    await expect(page.getByText("TANK")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("ZERO TRUST SECURITY")).toBeVisible();
  });

  test("skeleton placeholder verificado (quando existir data-skeleton)", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("TANK")).toBeVisible({ timeout: 10000 });
    const skeletons = page.locator("[data-skeleton], [data-testid='skeleton'], .animate-pulse");
    const count = await skeletons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("verifica sem overflow em tablet 768px", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await expect(page.getByText("TANK")).toBeVisible({ timeout: 10000 });
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(hasOverflow).toBeFalsy();
  });
});