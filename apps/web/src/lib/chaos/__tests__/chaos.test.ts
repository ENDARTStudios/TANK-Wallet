import { describe, it, expect } from "bun:test";
import { injectChaos, injectLatency } from "../index";

describe("chaos", () => {
  it("latência injeta delay", async () => {
    const start = Date.now();
    const res = await injectChaos(() => 42, { type: "latency", delayMs: 50, probability: 1 });
    expect(res).toBe(42);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  it("rpc_failure lança erro", async () => {
    await expect(injectChaos(() => 1, { type: "rpc_failure", probability: 1 })).rejects.toThrow("RPC failure");
  });

  it("injectLatency helper", async () => {
    const res = await injectLatency(() => "ok", 20);
    expect(res).toBe("ok");
  });
});
