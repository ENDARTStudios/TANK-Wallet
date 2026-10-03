import { describe, it, expect } from "bun:test";
import { runSecurityDecisionPipeline, makeThreatIntelEngine, makeSimulationEngine, makeContractScannerEngine } from "../security-decision-pipeline";
import type { SecurityContext } from "../architecture-freeze";

function ctx(o: Partial<SecurityContext> = {}): SecurityContext {
  return { walletAddress:"0x1", chain:"ethereum", contractAddress:"0x2", amountUsd:100, isInfiniteApproval:false, contractVerified:false, deviceFingerprint:"d", hour:14, isWeekend:false, knownDevices:["d"], knownChains:["ethereum"], securityLevel:"L0", ...o };
}
const safeTI = makeThreatIntelEngine(async () => ({ threat:false, severity:0, reasons:[] }));
const malTI = makeThreatIntelEngine(async () => ({ threat:true, severity:90, reasons:["honeypot"] }));
const safeSim = makeSimulationEngine(async () => ({ success:true, stateChanges:1, approvalChanges:0, humanExplanation:"ok" }));
const malSim = makeSimulationEngine(async () => ({ success:false, revertReason:"reverted", stateChanges:0, approvalChanges:1, humanExplanation:"bad" }));
const safeScan = makeContractScannerEngine(async () => ({ score:90, findings:["clean"], humanExplanation:"clean" }));
const malScan = makeContractScannerEngine(async () => ({ score:20, findings:["delegatecall"], humanExplanation:"dangerous" }));

describe("SecurityDecisionPipeline", () => {
  it("allows safe tx", async () => { const r = await runSecurityDecisionPipeline(ctx(), { engines:[safeTI,safeSim,safeScan] }); expect(r.decision).toBe("allow"); expect(r.securityLevel).toBe("L0"); });
  it("blocks malicious tx", async () => { const r = await runSecurityDecisionPipeline(ctx(), { engines:[malTI,safeSim,safeScan] }); expect(r.decision).toBe("block"); });
  it("blocks on simulation revert + infinite approval", async () => { const r = await runSecurityDecisionPipeline(ctx({isInfiniteApproval:true}), { engines:[safeTI,malSim,safeScan] }); expect(r.decision).toBe("block"); });
  it("produces evidence", async () => { const r = await runSecurityDecisionPipeline(ctx(), { engines:[safeTI] }); expect(r.evidence.length).toBeGreaterThan(0); expect(r.evidence[0].source).toBe("eng-004-threat-intel"); });
  it("records duration", async () => { const r = await runSecurityDecisionPipeline(ctx(), { engines:[safeTI,safeSim,safeScan] }); expect(r.durationMs).toBeGreaterThanOrEqual(0); expect(r.reproducible).toBe(true); });
  it("handles timeout (fail-safe block)", async () => { const slow = { id:"slow", async evaluate(){ await new Promise(r=>setTimeout(r,200)); return { engineId:"slow", engineVersion:"1", score:100, level:"safe" as const, blocked:false, evidence:[], explanation:"", evaluatedAt:Date.now(), durationMs:200 }; } }; const r = await runSecurityDecisionPipeline(ctx(), { engines:[slow], engineTimeoutMs:50 }); expect(r.decision).toBe("block"); expect(r.errors.length).toBe(1); });
  it("aggregates from multiple engines", async () => { const r = await runSecurityDecisionPipeline(ctx(), { engines:[safeTI,safeSim,safeScan] }); expect(new Set(r.evidence.map(e=>e.source)).size).toBe(3); });
});
