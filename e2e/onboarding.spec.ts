import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
  test.fixme("T061 — skip: onboarding text visibility (H1+H2)", async ({ page }) => {
    await page.goto("/", { waitUntil: "load", timeout: 20000 });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText("ZERO TRUST SECURITY")).toBeVisible();
  });

  test.fixme("T061 — skip: onboarding (H1+H2) — env/test setup Playwright; ver T062 Sprint 59" async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /Criar nova carteira/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Importar com seed phrase/i })).toBeVisible();
  });

  test.fixme("T061 — skip: onboarding (H1+H2) — env/test setup Playwright; ver T062 Sprint 59" async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 15000 });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test.fixme("T061 — skip: onboarding (H1+H2) — env/test setup Playwright; ver T062 Sprint 59" async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Importar com seed phrase/i }).click();
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    await textarea.focus();
    await expect(textarea).toBeFocused();
    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();
  });
});