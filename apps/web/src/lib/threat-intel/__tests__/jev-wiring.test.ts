import { describe, it, expect, beforeEach } from "bun:test";
import { aggregateThreatIntel, clearCacheForTest } from "../aggregator";

function mockAssess(phishing: number, severity: number) {
  return {
    async systemOne() {
      return {
        answers: {
          phishing: { noul: phishing },
          severity: { score: severity, confidence: 0.9 },
        },
      };
    },
  };
}

describe("threat-intel jev wiring", () => {
  beforeEach(() => clearCacheForTest());

  it("flag off produz payload sem campo jev", async () => {
    const res = await aggregateThreatIntel(
      { chain: "ethereum", address: "0x00000000000000000000000000000000000000c1" },
      { now: 7001, jev: { enabled: false, assess: mockAssess(0.99, 2.9) } },
    );
    expect("jev" in res).toBe(false);
    expect(res.recommendation).toBe("allow");
  });

  it("flag on anexa sinal sem alterar decisao", async () => {
    const res = await aggregateThreatIntel(
      { chain: "ethereum", address: "0x00000000000000000000000000000000000000c2" },
      { now: 7002, jev: { enabled: true, assess: mockAssess(0.95, 2.8) } },
    );
    expect(res.jev?.skipped).toBe(false);
    expect(res.jev?.recommendation).toBe("block");
    expect(res.recommendation).toBe("allow");
  });

  it("skip nao altera decisao", async () => {
    const failing = {
      async systemOne(): Promise<never> {
        throw new Error("boom");
      },
    };
    const res = await aggregateThreatIntel(
      { chain: "ethereum", address: "0x00000000000000000000000000000000000000c3" },
      { now: 7003, jev: { enabled: true, assess: failing } },
    );
    expect(res.jev?.skipped).toBe(true);
    expect(res.recommendation).toBe("allow");
  });
});
