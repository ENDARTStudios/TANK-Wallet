/**
 * Integration test: Simulation Engine.
 *
 * Exercises the transaction simulation adapter and verifies it
 * correctly detects reverts and approval changes.
 *
 * @stable
 */

import { describe, it, expect } from "bun:test";

describe("Simulation Engine (integration)", () => {
  it("flags a transaction that would revert", async () => {
    const { makeSimulationEngine } = await import("../../../wallet-kernel/security-decision-pipeline");

    const engine = makeSimulationEngine(async () => ({
      success: false,
      revertReason: "ERC20: transfer amount exceeds balance",
      stateChanges: 0,
      approvalChanges: 0,
      humanExplanation: "Transaction would revert: insufficient balance.",
    }));

    const result = await engine.evaluate({
      walletAddress: "0x1111",
      chain: "ethereum",
      contractAddress: "0x2222",
      amountUsd: 1000,
      isInfiniteApproval: false,
      contractVerified: true,
      deviceFingerprint: "test",
      hour: 14,
      isWeekend: false,
      knownDevices: ["test"],
      knownChains: ["ethereum"],
      securityLevel: "L0",
    });

    expect(result.blocked).toBe(true);
    expect(result.level).toBe("high");
    expect(result.score).toBeLessThan(60);
    expect(result.evidence.some((e) => e.includes("simulation-success=false"))).toBe(true);
  });

  it("flags infinite approval change", async () => {
    const { makeSimulationEngine } = await import("../../../wallet-kernel/security-decision-pipeline");

    const engine = makeSimulationEngine(async () => ({
      success: true,
      stateChanges: 2,
      approvalChanges: 1,
      humanExplanation: "Transaction grants infinite approval to spender.",
    }));

    const result = await engine.evaluate({
      walletAddress: "0x1111",
      chain: "ethereum",
      contractAddress: "0x2222",
      amountUsd: 0,
      isInfiniteApproval: true,
      contractVerified: true,
      deviceFingerprint: "test",
      hour: 14,
      isWeekend: false,
      knownDevices: ["test"],
      knownChains: ["ethereum"],
      securityLevel: "L0",
    });

    expect(result.blocked).toBe(true);
    expect(result.evidence.some((e) => e.includes("approval-changes=1"))).toBe(true);
  });

  it("passes a clean simple transfer", async () => {
    const { makeSimulationEngine } = await import("../../../wallet-kernel/security-decision-pipeline");

    const engine = makeSimulationEngine(async () => ({
      success: true,
      stateChanges: 1,
      approvalChanges: 0,
      humanExplanation: "Transaction will transfer 1 ETH to recipient.",
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
    expect(result.score).toBe(100);
    expect(result.level).toBe("safe");
  });
});
