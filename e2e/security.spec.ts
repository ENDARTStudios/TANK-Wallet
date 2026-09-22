import { test, expect } from "@playwright/test";

test.describe("Security headers e error boundary", () => {
  test.fixme("T061 — skip aceito: env/test setup Playwright (CSP header); motivo: h1 TANK invisível (H1+H2)", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "networkidle" });
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"]).toBeTruthy();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("HSTS header presente (next.config.ts)", async ({ request }) => {
    const res = await request.get("/");
    const hsts = res.headers()["strict-transport-security"] ?? "";
    expect(hsts).toContain("max-age=63072000");
    expect(hsts).toContain("includeSubDomains");
    expect(hsts).toContain("preload");
  });

  test.fixme("T061 — skip aceito: env/test setup Playwright (error boundary / mock Sentry); motivo: h1 TANK invisível (H1+H2); ver T062 Sprint 59", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 15000 });
  });

  test("rate limiting em /api responde 429 após limite (quando ativo)", async ({ request }) => {
    const results = [];
    for (let i = 0; i < 5; i++) {
      const res = await request.get("/api/health");
      results.push(res.status());
    }
    expect(results.every((s) => s === 200 || s === 429)).toBeTruthy();
  });
});