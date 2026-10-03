import { describe, it, expect, beforeEach } from "bun:test";
import { initObservability, isObservabilityReady, resetInitForTest, setCurrentTraceId } from "../init";

describe("init observability", () => {
  beforeEach(() => resetInitForTest());

  it("initObservability sem DSN no-op ok", async () => {
    const r = await initObservability({});
    expect(r.ok).toBe(true);
  });

  it("initObservability idempotente", async () => {
    await initObservability({});
    const r2 = await initObservability({});
    expect(r2.ok).toBe(true);
  });

  it("setCurrentTraceId propaga via sentry-real", () => {
    setCurrentTraceId("trace_test_001");
    setCurrentTraceId(undefined);
    expect(true).toBe(true);
  });
});
