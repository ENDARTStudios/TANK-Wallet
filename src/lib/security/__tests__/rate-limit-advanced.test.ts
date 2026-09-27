import { describe, it, expect, beforeEach } from "bun:test";
import {
  consumeRateLimitAdvanced,
  resetRateLimitForTest,
  snapshotRateLimitCounters,
  OPERATION_LIMITS,
} from "../rate-limit";

function req(ip: string) {
  return { headers: new Headers({ "x-forwarded-for": ip }), url: "https://app.test/api/broadcast", ip };
}

describe("rate-limit advanced", () => {
  beforeEach(() => resetRateLimitForTest());

  it("isola buckets por usuario na mesma operacao", () => {
    for (let i = 0; i < OPERATION_LIMITS.approve; i++) {
      expect(consumeRateLimitAdvanced(req("9.9.9.9"), { userId: "u1", operation: "approve", now: i }).allowed).toBe(true);
    }
    expect(consumeRateLimitAdvanced(req("9.9.9.9"), { userId: "u1", operation: "approve", now: 99 }).allowed).toBe(false);
    expect(consumeRateLimitAdvanced(req("9.9.9.9"), { userId: "u2", operation: "approve", now: 99 }).allowed).toBe(true);
  });

  it("limites distintos por operacao", () => {
    for (let i = 0; i < OPERATION_LIMITS.approve; i++) {
      consumeRateLimitAdvanced(req("8.8.8.8"), { userId: "u9", operation: "approve", now: i });
    }
    expect(consumeRateLimitAdvanced(req("8.8.8.8"), { userId: "u9", operation: "approve", now: 50 }).allowed).toBe(false);
    expect(consumeRateLimitAdvanced(req("8.8.8.8"), { userId: "u9", operation: "send", now: 50 }).allowed).toBe(true);
  });

  it("teto global por IP vale para qualquer operacao", async () => {
    const ip = "7.7.7.7";
    for (let i = 0; i < 100; i++) {
      consumeRateLimitAdvanced(req(ip), { userId: `u${i}`, operation: "send", now: 0 });
    }
    const blocked = consumeRateLimitAdvanced(req(ip), { userId: "fresh", operation: "send", now: 1 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("headers incluem operacao e retry-after no bloqueio", () => {
    for (let i = 0; i < OPERATION_LIMITS.swap; i++) {
      consumeRateLimitAdvanced(req("6.6.6.6"), { userId: "ux", operation: "swap", now: i });
    }
    const res = consumeRateLimitAdvanced(req("6.6.6.6"), { userId: "ux", operation: "swap", now: 70 });
    expect(res.allowed).toBe(false);
    expect(res.headers["X-RateLimit-Operation"]).toBe("swap");
    expect(res.headers["Retry-After"]).toBeDefined();
  });

  it("headers de allowed refletem o bucket da operacao", () => {
    const res = consumeRateLimitAdvanced(req("4.4.4.4"), { userId: "uh", operation: "send", now: 0 });
    expect(res.headers["X-RateLimit-Limit"]).toBe("10");
    expect(res.headers["X-RateLimit-Operation"]).toBe("send");
  });

  it("contadores observaveis por operacao e resultado", () => {
    consumeRateLimitAdvanced(req("5.5.5.5"), { userId: "uc", operation: "send", now: 0 });
    const snap = snapshotRateLimitCounters();
    expect(snap["send:allowed"]).toBe(1);
  });
});
