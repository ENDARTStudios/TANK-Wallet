import { describe, it, expect, beforeEach } from "bun:test";
import { checkRateLimit, resetRateLimitForTest, getRateLimitHeaders } from "../rate-limit";

describe("rate-limit", () => {
  beforeEach(() => resetRateLimitForTest());

  it("permite até o limite e bloqueia depois", () => {
    const key = "1.1.1.1:/api/health";
    const limit = 3;
    const windowMs = 60_000;
    const now = 1_000;

    expect(checkRateLimit(key, { limit, windowMs, now }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit, windowMs, now: now + 1 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit, windowMs, now: now + 2 }).allowed).toBe(true);
    const blocked = checkRateLimit(key, { limit, windowMs, now: now + 3 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.remaining).toBe(0);
  });

  it("reseta após a janela", () => {
    const key = "2.2.2.2:/api/health";
    const limit = 2;
    const windowMs = 1000;
    expect(checkRateLimit(key, { limit, windowMs, now: 0 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit, windowMs, now: 10 }).allowed).toBe(true);
    expect(checkRateLimit(key, { limit, windowMs, now: 20 }).allowed).toBe(false);
    expect(checkRateLimit(key, { limit, windowMs, now: 1100 }).allowed).toBe(true);
  });

  it("headers contêm limites", () => {
    const key = "3.3.3.3:/api/threats/token";
    const res = checkRateLimit(key, { limit: 120, windowMs: 60_000, now: 0 });
    const headers = getRateLimitHeaders(res);
    expect(headers["X-RateLimit-Limit"]).toBe("120");
    expect(headers["X-RateLimit-Remaining"]).toBe("119");
  });

  it("escrita tem limite menor (simulado via opts)", () => {
    const key = "4.4.4.4:/api/threats/token";
    const limit = 30;
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit(key, { limit, windowMs: 60_000, now: i }).allowed).toBe(true);
    }
    expect(checkRateLimit(key, { limit, windowMs: 60_000, now: 31 }).allowed).toBe(false);
  });
});
