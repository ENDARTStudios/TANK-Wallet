import { describe, it, expect, beforeEach } from "bun:test";
import { getDashboardMetrics, resetCountersForTest } from "../dashboard";

describe("dashboard", () => {
  beforeEach(() => resetCountersForTest());

  it("getDashboardMetrics retorna rps/erroRate/p95/users", () => {
    const m = getDashboardMetrics({ now: 1000 });
    expect(typeof m.rps).toBe("number");
    expect(typeof m.errorRate).toBe("number");
    expect(m.p95).toBeGreaterThanOrEqual(0);
    expect(m.generatedAt).toBe(1000);
  });

  it("incrementa counters via increment", () => {
    const m = getDashboardMetrics({ now: 1000, increment: { requests: 10, errors: 1, users: 5 } });
    expect(m.rps).toBe(10);
    expect(m.errorRate).toBeCloseTo(0.1, 1);
    expect(m.activeUsers).toBe(5);
  });

  it("errorRate próximo de 0 sem erros", () => {
    getDashboardMetrics({ now: 1000, increment: { requests: 100 } });
    const m = getDashboardMetrics({ now: 2000 });
    expect(m.errorRate).toBe(0);
  });

  it("errorRate = 0.5 com 50% erros", () => {
    getDashboardMetrics({ now: 1000, increment: { requests: 2, errors: 1 } });
    const m = getDashboardMetrics({ now: 2000 });
    expect(m.errorRate).toBeCloseTo(0.5, 1);
  });
});
