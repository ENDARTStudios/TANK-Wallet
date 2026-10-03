import { describe, it, expect, beforeEach } from "bun:test";
import { scanTransaction } from "../sources/blowfish";
import { simulateTransaction } from "../sources/tenderly";
import { checkAsset } from "../sources/chainpatrol";
import { aggregateRisk, clearRiskCacheForTest } from "../aggregator";

describe("risk-service", () => {
  beforeEach(() => clearRiskCacheForTest());

  it("blowfish sem key retorna null", async () => {
    const r = await scanTransaction({ chain: "ethereum", to: "0x", data: "0x" });
    expect(r).toBeNull();
  });

  it("tenderly sem key retorna null", async () => {
    const r = await simulateTransaction({ from: "0x", to: "0x", data: "0x" });
    expect(r).toBeNull();
  });

  it("chainpatrol sem key retorna null", async () => {
    const r = await checkAsset({ address: "0x" });
    expect(r).toBeNull();
  });

  it("aggregator safe quando sources null", async () => {
    const out = await aggregateRisk({ chain: "ethereum", to: "0x", from: "0x", data: "0x" });
    expect(out.verdict).toBe("safe");
    expect(out.sources).toEqual([]);
  });
});
