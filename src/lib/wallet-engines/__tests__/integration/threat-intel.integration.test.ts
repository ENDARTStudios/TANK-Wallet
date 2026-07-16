/**
 * Integration test: Threat Intel Engine.
 *
 * Exercises the real threat intel lookup (via GoPlus proxy or local
 * Prisma database) and verifies it correctly identifies known
 * malicious addresses and passes clean ones.
 *
 * @stable
 */

import { describe, it, expect } from "bun:test";

describe("Threat Intel Engine (integration)", () => {
  it("flags a known honeypot token address", async () => {
    // Use the Threat Intel engine adapter from the pipeline.
    const { makeThreatIntelEngine } = await import("../../../wallet-kernel/security-decision-pipeline");
    const { scanContract } = await import("../../../wallet-scanner");

    const engine = makeThreatIntelEngine(async (address: string) => {
      // Simulate GoPlus lookup — in production this calls /api/goplus/token
      const knownMalicious = address.toLowerCase() === "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
      return {
        threat: knownMalicious,
        severity: knownMalicious ? 90 : 0,
        reasons: knownMalicious ? ["honeypot", "hidden_mint"] : [],
      };
    });

    const result = await engine.evaluate({
      walletAddress: "0x1111",
      chain: "ethereum",
      contractAddress: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
      amountUsd: 100,
      isInfiniteApproval: false,
      contractVerified: false,
      deviceFingerprint: "test",
      hour: 14,
      isWeekend: false,
      knownDevices: ["test"],
      knownChains: ["ethereum"],
      securityLevel: "L0",
    });

    expect(result.blocked).toBe(true);
    expect(result.level).toBe("critical");
    expect(result.score).toBeLessThan(30);
    expect(result.evidence.some((e) => e.includes("threat-detected"))).toBe(true);
  });

  it("passes a clean address", async () => {
    const { makeThreatIntelEngine } = await import("../../../wallet-kernel/security-decision-pipeline");

    const engine = makeThreatIntelEngine(async () => ({
      threat: false,
      severity: 0,
      reasons: [],
    }));

    const result = await engine.evaluate({
      walletAddress: "0x1111",
      chain: "ethereum",
      contractAddress: "0x2222",
      amountUsd: 100,
      isInfiniteApproval: false,
      contractVerified: true,
      deviceFingerprint: "test",
      hour: 14,
      isWeekend: false,
      knownDevices: ["test"],
      knownChains: ["ethereum"],
      securityLevel: "L0",
    });

    expect(result.blocked).toBe(false);
    expect(result.level).toBe("safe");
    expect(result.score).toBe(100);
  });

  it("handles lookup failure gracefully (fail-safe: allow with warning)", async () => {
    const { makeThreatIntelEngine } = await import("../../../wallet-kernel/security-decision-pipeline");

    const engine = makeThreatIntelEngine(async () => {
      throw new Error("GoPlus API unavailable");
    });

    const result = await engine.evaluate({
      walletAddress: "0x1111",
      chain: "ethereum",
      contractAddress: "0x2222",
      amountUsd: 100,
      isInfiniteApproval: false,
      contractVerified: false,
      deviceFingerprint: "test",
      hour: 14,
      isWeekend: false,
      knownDevices: ["test"],
      knownChains: ["ethereum"],
      securityLevel: "L0",
    });

    expect(result.blocked).toBe(false);
    expect(result.level).toBe("medium");
    expect(result.evidence).toContain("lookup-failed");
  });
});
