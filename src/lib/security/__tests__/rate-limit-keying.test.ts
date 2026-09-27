import { describe, it, expect, beforeEach } from "bun:test";
import { consumeRateLimit, consumeRateLimitAdvanced, resetRateLimitForTest } from "../rate-limit";

function req(ip: string) {
  return { headers: new Headers(), url: "http://127.0.0.1:3000/api/risk", ip };
}

describe("rate-limit keying (T098)", () => {
  beforeEach(() => resetRateLimitForTest());

  it("(a) dois userIds no mesmo IP não se bloqueiam em reads", () => {
    const limit = 3;
    for (let i = 0; i < 3; i++) {
      expect(
        consumeRateLimit(req("9.9.9.9"), { limit, windowMs: 60_000, now: i, userId: "user-A" }).allowed,
      ).toBe(true);
    }
    expect(
      consumeRateLimit(req("9.9.9.9"), { limit, windowMs: 60_000, now: 3, userId: "user-A" }).allowed,
    ).toBe(false);
    expect(
      consumeRateLimit(req("9.9.9.9"), { limit, windowMs: 60_000, now: 4, userId: "user-B" }).allowed,
    ).toBe(true);
  });

  it("(b) anônimos no mesmo IP compartilham budget", () => {
    const limit = 2;
    expect(consumeRateLimit(req("8.8.8.8"), { limit, windowMs: 60_000, now: 0 }).allowed).toBe(true);
    expect(consumeRateLimit(req("8.8.8.8"), { limit, windowMs: 60_000, now: 1 }).allowed).toBe(true);
    expect(consumeRateLimit(req("8.8.8.8"), { limit, windowMs: 60_000, now: 2 }).allowed).toBe(false);
  });

  it("(c) monitor bucket separado 600, fora do budget de negócio", () => {
    const r1 = consumeRateLimitAdvanced(req("7.7.7.7"), { operation: "monitor", windowMs: 60_000, now: 0 });
    expect(r1.limit).toBe(600);
    expect(r1.headers["X-RateLimit-Limit"]).toBe("600");
    for (let i = 0; i < 10; i++) {
      consumeRateLimitAdvanced(req("7.7.7.7"), { userId: "u", operation: "send", windowMs: 60_000, now: i });
    }
    const blocked = consumeRateLimitAdvanced(req("7.7.7.7"), {
      userId: "u",
      operation: "send",
      windowMs: 60_000,
      now: 11,
    });
    expect(blocked.allowed).toBe(false);
    expect(
      consumeRateLimitAdvanced(req("7.7.7.7"), { operation: "monitor", windowMs: 60_000, now: 12 }).allowed,
    ).toBe(true);
  });

  it("(d) writes mantêm 30/min por userId", () => {
    for (let i = 0; i < 30; i++) {
      expect(
        consumeRateLimit(req("6.6.6.6"), { limit: 30, windowMs: 60_000, now: i, userId: "writer" }).allowed,
      ).toBe(true);
    }
    expect(
      consumeRateLimit(req("6.6.6.6"), { limit: 30, windowMs: 60_000, now: 31, userId: "writer" }).allowed,
    ).toBe(false);
    expect(
      consumeRateLimit(req("6.6.6.6"), { limit: 30, windowMs: 60_000, now: 32, userId: "other" }).allowed,
    ).toBe(true);
  });
});
