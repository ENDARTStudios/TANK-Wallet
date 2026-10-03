import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

test.describe("Lighthouse budget", () => {
  test(".lighthouserc.json existe com budgets", () => {
    const path = join(process.cwd(), ".lighthouserc.json");
    expect(existsSync(path)).toBe(true);
    const config = JSON.parse(readFileSync(path, "utf8")) as { ci?: { assert?: { assertions?: Record<string, unknown> } } };
    expect(config.ci?.assert?.assertions).toBeDefined();
  });

  test("LCP/CLS/TBT presentes", () => {
    const config = JSON.parse(readFileSync(join(process.cwd(), ".lighthouserc.json"), "utf8")) as { ci?: { assert?: { assertions?: Record<string, unknown> } } };
    const a = config.ci?.assert?.assertions ?? {};
    expect(a["largest-contentful-paint"]).toBeDefined();
    expect(a["cumulative-layout-shift"]).toBeDefined();
    expect(a["total-blocking-time"]).toBeDefined();
  });
});
