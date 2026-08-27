import { test, expect } from "@playwright/test";

test.describe("Onboarding", () => {
  test("exibe TANK Wallet e ZERO TRUST SECURITY na tela inicial", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("TANK", { exact: true })).toBeVisible();
    await expect(page.getByText("ZERO TRUST SECURITY")).toBeVisible();
  });

  test("fluxo criar carteira mostra escolha criar/importar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Criar nova carteira/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Importar com seed phrase/i })).toBeVisible();
  });

  test("comportamento responsivo sem overflow horizontal em 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("teclado não cobre formulário em mobile (input focável)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Importar com seed phrase/i }).click();
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    await textarea.focus();
    await expect(textarea).toBeFocused();
    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();
  });
});
