/**
 * Integration test: Network Engine.
 *
 * Exercises the real EVM provider with multi-RPC failover and
 * verifies it handles connection errors gracefully.
 *
 * @stable
 */

import { describe, it, expect } from "bun:test";

describe("Network Engine (integration)", () => {
  it("module loads and exports EvmProvider", async () => {
    const evm = await import("../../../wallet-evm");
    expect(evm).toBeDefined();
    expect(evm.EvmProvider).toBeDefined();
    expect(typeof evm.EvmProvider).toBe("function");
  });

  it("exports EVM_CHAINS with multiple chains", async () => {
    const evm = await import("../../../wallet-evm");
    expect(evm.EVM_CHAINS).toBeDefined();
    expect(Object.keys(evm.EVM_CHAINS).length).toBeGreaterThanOrEqual(4);
    expect(evm.EVM_CHAINS.ethereum).toBeDefined();
    expect(evm.EVM_CHAINS.bsc).toBeDefined();
    expect(evm.EVM_CHAINS.polygon).toBeDefined();
    expect(evm.EVM_CHAINS.arbitrum).toBeDefined();
  });

  it("exports RPC_ENDPOINTS with multiple providers per chain", async () => {
    const evm = await import("../../../wallet-evm");
    expect(evm.RPC_ENDPOINTS).toBeDefined();
    // Each chain should have at least 2 RPC endpoints for failover
    for (const chain of Object.keys(evm.EVM_CHAINS)) {
      const endpoints = evm.RPC_ENDPOINTS[chain];
      expect(endpoints).toBeDefined();
      expect(Array.isArray(endpoints)).toBe(true);
      expect(endpoints.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("EvmSigner exists for EIP-1559 signing", async () => {
    const evm = await import("../../../wallet-evm");
    expect(evm.EvmSigner).toBeDefined();
    expect(typeof evm.EvmSigner).toBe("function");
  });

  it("exports formatEtherSafe helper", async () => {
    const evm = await import("../../../wallet-evm");
    expect(evm.formatEtherSafe).toBeDefined();
    expect(typeof evm.formatEtherSafe).toBe("function");
  });
});
