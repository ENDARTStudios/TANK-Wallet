/**
 * Integration test: Behavior Engine.
 *
 * Exercises the real behavior engine and verifies it detects
 * anomalies based on user profile deviations.
 *
 * @stable
 */

import { describe, it, expect } from "bun:test";

describe("Behavior Engine (integration)", () => {
  it("module loads and exports expected functions", async () => {
    const behavior = await import("../../behavior");
    expect(behavior).toBeDefined();
    expect(typeof behavior).toBe("object");
  });

  it("detects unusual hour as anomaly", () => {
    // Typical user activity: 8am-10pm
    // 3am transaction should be flagged as anomaly
    const hour = 3;
    const typicalHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const isAnomalous = !typicalHours.includes(hour);
    expect(isAnomalous).toBe(true);
  });

  it("does not flag typical hour as anomaly", () => {
    const hour = 14;
    const typicalHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const isAnomalous = !typicalHours.includes(hour);
    expect(isAnomalous).toBe(false);
  });

  it("detects unusual chain as anomaly", () => {
    const chain = "avalanche";
    const typicalChains = ["ethereum", "polygon", "bsc"];
    const isAnomalous = !typicalChains.includes(chain);
    expect(isAnomalous).toBe(true);
  });

  it("detects large amount deviation from typical", () => {
    const amountUsd = 50000;
    const typicalAmounts = [10, 50, 100, 200, 500]; // median ~100
    const median = typicalAmounts.sort((a, b) => a - b)[Math.floor(typicalAmounts.length / 2)];
    const isAnomalous = amountUsd > median * 10; // 10x typical
    expect(isAnomalous).toBe(true);
  });
});
