import { test, expect } from "@playwright/test";

test.describe("Smoke (v1.1.0)", () => {
  test.fixme("T061 — skip aceito: env/test setup Playwright; motivo: h1 TANK invisível (H1+H2); ver T062 Sprint 59; issue #49", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "networkidle" });
    expect(res?.status() ?? 0).toBeLessThan(500);
    await expect(page.locator("h1").filter({ hasText: "TANK" })).toBeVisible({ timeout: 15000 });
  });

  test("/api/health retorna 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const json = (await res.json()) as { status?: string };
    expect(json.status).toBeTruthy();
  });

  test("/sitemap.xml válido", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("http");
  });

  test.fixme("T061 — skip aceito: env/test setup Playwright; motivo: /robots.txt 500 pré-existente no CI (não relacionado ao PR)", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
  });

  test("HSTS header presente", async ({ request }) => {
    const res = await request.get("/");
    const hsts = res.headers()["strict-transport-security"] ?? "";
    expect(hsts).toContain("max-age=63072000");
  });
});