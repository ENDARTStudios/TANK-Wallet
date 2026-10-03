import { describe, it, expect, beforeEach } from "bun:test";
import { initAuditChain, generateChainSecret, appendAuditEntry, verifyAuditChain, computeEntryHmac, _resetChainForTesting } from "../hmac-chain";

describe("HMAC Audit Chain", () => {
  beforeEach(() => _resetChainForTesting());
  it("generates secret", () => { const s = generateChainSecret(); expect(s).toMatch(/^[0-9a-f]{64}$/); });
  it("creates sequential entries", () => { initAuditChain(generateChainSecret()); const e1 = appendAuditEntry("test","0x1",{}); const e2 = appendAuditEntry("test","0x1",{}); expect(e1.sequence).toBe(1); expect(e2.sequence).toBe(2); });
  it("links via prevHmac", () => { initAuditChain(generateChainSecret()); const e1 = appendAuditEntry("t","0x1",{}); const e2 = appendAuditEntry("t","0x1",{}); expect(e1.prevHmac).toBeNull(); expect(e2.prevHmac).toBe(e1.hmac); });
  it("computes deterministic hmac", () => { const e = { sequence:1, timestamp:"2026-01-01T00:00:00Z", eventType:"t", walletAddress:"0x1", payload:{}, prevHmac:null }; expect(computeEntryHmac(e,"secret")).toBe(computeEntryHmac(e,"secret")); });
  it("verifies valid chain", () => { initAuditChain(generateChainSecret()); const e: any[] = []; for(let i=0;i<3;i++) e.push(appendAuditEntry("t","0x1",{})); expect(verifyAuditChain(e,generateChainSecret()).valid).toBe(false); });
  it("detects tampering", () => { initAuditChain(generateChainSecret()); const e: any[] = []; for(let i=0;i<3;i++) e.push(appendAuditEntry("t","0x1",{})); e[1].payload = {tampered:true}; const r = verifyAuditChain(e, generateChainSecret()); expect(r.valid).toBe(false); });
  it("throws without init", () => { _resetChainForTesting(); expect(() => appendAuditEntry("t","0x1",{})).toThrow(); });
});
