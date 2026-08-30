import { describe, it, expect } from "bun:test";
import { newTraceId, withTraceId, withTraceIdAsync, getCurrentTraceId } from "../traceid";

describe("traceid", () => {
  it("newTraceId retorna string com prefixo", () => {
    const id = newTraceId();
    expect(id.startsWith("trace_")).toBe(true);
    expect(id.length).toBeGreaterThan(8);
  });

  it("withTraceId propaga contexto", () => {
    withTraceId(() => {
      expect(getCurrentTraceId()).toBeTruthy();
    }, "trace_test_001");
  });

  it("withTraceIdAsync propaga em await", async () => {
    await withTraceIdAsync(async () => {
      await Promise.resolve();
      expect(getCurrentTraceId()).toBeTruthy();
    }, "trace_async_001");
  });

  it("getCurrentTraceId undefined fora do contexto", () => {
    expect(getCurrentTraceId()).toBeUndefined();
  });
});
