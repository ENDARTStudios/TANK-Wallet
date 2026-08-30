import { describe, it, expect } from "bun:test";
import { initSentry, isSentryReady, captureException, setTraceId, getTraceId } from "../sentry-real";

describe("sentry-real", () => {
  it("initSentry sem DSN falha gracioso", async () => {
    const r = await initSentry({ dsn: "", env: "test", release: "1.0.0" });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("No DSN");
  });

  it("initSentry com DSN inválido tenta carregar", async () => {
    const r = await initSentry({ dsn: "https://fake@sentry.io/123", env: "test", release: "1.0.0" });
    expect(typeof r.ok).toBe("boolean");
  });

  it("captureException retorna eventId + timestamp", async () => {
    const r = await captureException(new Error("test"), { tag: "x" });
    expect(r.eventId).toContain("evt_");
    expect(r.timestamp).toBeGreaterThan(0);
  });

  it("setTraceId/getTraceId roundtrip", () => {
    setTraceId("abc-123");
    expect(getTraceId()).toBe("abc-123");
    setTraceId(undefined);
    expect(getTraceId()).toBeUndefined();
  });
});
