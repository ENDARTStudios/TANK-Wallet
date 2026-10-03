import { describe, it, expect, beforeEach } from "bun:test";
import { aggregateThreatIntel, clearCacheForTest } from "../aggregator";

describe("threat-intel intent non-interference", () => {
  beforeEach(() => clearCacheForTest());

  it("intent context nao existe no payload e nao altera decisao", async () => {
    const input = { chain: "ethereum", address: "0x00000000000000000000000000000000000000d1" };
    const plain = await aggregateThreatIntel(input, { now: 8001 });
    const withJev = await aggregateThreatIntel(input, {
      now: 8002,
      jev: {
        enabled: true,
        assess: {
          async systemOne() {
            return { answers: { phishing: { noul: 0.99 }, severity: { score: 2.9, confidence: 0.95 } } };
          },
        },
      },
    });
    expect(plain.recommendation).toBe(withJev.recommendation);
    expect("intent" in plain).toBe(false);
    expect("intent" in withJev).toBe(false);
  });
});
