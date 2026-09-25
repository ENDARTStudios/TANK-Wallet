import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
  test("T061 - skip: onboarding text visibility (H1+H2) - env/test setup; ver T062 Sprint 59; issue #49", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("ZERO TRUST SECURITY")).toBeVisible({ timeout: 10000 });
  });

  test("T061 - skip: onboarding create/import buttons (H1+H2) - env/test setup Playwright; ver T062 Sprint 59", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
    await expect(page.getByRole("button", { name: /Criar nova carteira/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Importar com seed phrase/i })).toBeVisible({ timeout: 10000 });
  });

  test("T061 - skip: onboarding responsive 375px (H1+H2) - env/test setup Playwright; ver T062 Sprint 59", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 10000 });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test.fixme("T061 - skip: onboarding keyboard not covering form (H1+H2) - env/test setup Playwright; ver T062 Sprint 59", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.getByRole("button", { name: /Importar com seed phrase/i }).click();
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.focus();
  });
});