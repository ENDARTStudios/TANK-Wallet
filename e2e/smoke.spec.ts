import { test, expect } from "@playwright/test";

test.describe("Smoke (v1.1.0)", () => {
  test("home renderiza TANK Wallet", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status() ?? 0).toBeLessThan(500);
    await expect(page.getByText("TANK", { exact: true })).toBeVisible();
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

  test("/robots.txt presente", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
  });

  test("HSTS header presente", async ({ request }) => {
    const res = await request.get("/");
    const hsts = res.headers()["strict-transport-security"] ?? "";
    expect(hsts).toContain("max-age=63072000");
  });
});
