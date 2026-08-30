import { test, expect } from "@playwright/test";

test.describe("PWA", () => {
  test("/manifest.json presente", async ({ request }) => {
    const res = await request.get("/manifest.json");
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { name?: string };
    expect(body.name).toBeTruthy();
  });

  test("/sw.js presente", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("tank-wallet");
  });
});
