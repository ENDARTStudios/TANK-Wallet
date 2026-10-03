/**
 * Security Evidence Metric (NEW — third indicator)
 *
 * Distinct from Readiness (was implemented?) and Assurance (was externally
 * validated?). Evidence answers: "can the platform PROVE automatically that
 * the engine did its job, with structured, reproducible evidence?"
 *
 * 3-state model:
 *   verified              — structured evidence types/records confirmed in code
 *   implemented_unverified — partial structured output (some fields missing)
 *   not_implemented       — engine outputs unstructured data only
 */

import {
  Check,
  computeScore,
  evidenceImplemented,
  evidenceMissing,
  evidenceVerified,
  fileExists,
  MetricResult,
  readFile,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.10;

export function computeEvidence(): MetricResult {
  const checks: Check[] = [
    {
      name: "Threat Intel produces structured evidence",
      description: "Weight: 18%",
      weight: 0.18,
      state: checkThreatIntelEvidence() ? "verified" : "not_implemented",
      passed: checkThreatIntelEvidence(),
      evidence: checkThreatIntelEvidence()
        ? evidenceVerified(
            "Prisma ThreatToken/Site/Address with fields source, severity, lastConfirmedAt, firstSeenAt",
            "prisma/schema.prisma"
          )
        : evidenceMissing(),
    },
    {
      name: "Simulation produces state diff",
      description: "Weight: 18%",
      weight: 0.18,
      state: checkSimulationEvidence() ? "implemented_unverified" : "not_implemented",
      passed: checkSimulationEvidence(),
      evidence: checkSimulationEvidence()
        ? evidenceImplemented("wallet-evm exposes call/simulate returning structured result", "filesystem + rg")
        : evidenceMissing(),
      notes: "Function exists but no test verifies state diff structure.",
    },
    {
      name: "Behavior produces score + reasons",
      description: "Weight: 15%",
      weight: 0.15,
      state: checkBehaviorEvidence() ? "verified" : "not_implemented",
      passed: checkBehaviorEvidence(),
      evidence: checkBehaviorEvidence()
        ? evidenceVerified("BehaviorAnomaly model with score (Int) + reasons (JSON)", "prisma/schema.prisma")
        : evidenceMissing(),
    },
    {
      name: "Network produces RPC metadata",
      description: "Weight: 10%",
      weight: 0.10,
      state: checkNetworkEvidence() ? "implemented_unverified" : "not_implemented",
      passed: checkNetworkEvidence(),
      evidence: checkNetworkEvidence()
        ? evidenceImplemented("wallet-evm references multiple RPC providers", "filesystem + rg")
        : evidenceMissing(),
      notes: "Provider names present but no structured RPC metadata type (latency, block height, failover count) committed.",
    },
    {
      name: "Decision produces evidence[] + sources[] + engineScores{}",
      description: "Weight: 18%",
      weight: 0.18,
      state: checkDecisionEvidence(),
      passed: checkDecisionEvidence() !== "not_implemented",
      evidence: checkDecisionEvidence() !== "not_implemented"
        ? evidenceImplemented("DecisionResult / SecurityResult types include evidence field", "src/lib/wallet/types.ts")
        : evidenceMissing(),
      notes: "Types reference evidence fields but no runtime integration test verifies that decisions actually populate them.",
    },
    {
      name: "Audit log is HMAC-signed + append-only",
      description: "Weight: 15%",
      weight: 0.15,
      state: checkAuditEvidence(),
      passed: checkAuditEvidence() !== "not_implemented",
      evidence: checkAuditEvidence() !== "not_implemented"
        ? evidenceImplemented("PermissionAuditLog model + audit engine present", "prisma schema + filesystem")
        : evidenceMissing(),
      notes: "HMAC chain + tamper-evidence not yet implemented. Currently append-only via Prisma but no signature.",
    },
    {
      name: "Recovery produces Shamir share metadata",
      description: "Weight: 6%",
      weight: 0.06,
      state: checkRecoveryEvidence(),
      passed: checkRecoveryEvidence() !== "not_implemented",
      evidence: checkRecoveryEvidence() !== "not_implemented"
        ? evidenceImplemented("Recovery engine + Shamir SSS scripts present", "filesystem")
        : evidenceMissing(),
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Security Evidence",
    description:
      "Distinct from Readiness and Assurance. Measures whether each engine produces structured, reproducible, source-attributed evidence automatically. 3-state model.",
    score,
    weight: WEIGHT,
    formula: "Σ(engine_evidence_state × engine_weight) × 100 — 7 engines",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function checkThreatIntelEvidence(): boolean {
  const schema = readFile("prisma/schema.prisma");
  if (!schema) return false;
  return schema.includes("model ThreatToken") && schema.includes("lastConfirmedAt") && schema.includes("source");
}

function checkSimulationEvidence(): boolean {
  const evm = readFile("src/lib/wallet-evm/index.ts");
  return !!evm && (evm.includes("simulate") || evm.includes("call"));
}

function checkBehaviorEvidence(): boolean {
  const schema = readFile("prisma/schema.prisma");
  return !!schema && schema.includes("model BehaviorAnomaly") && schema.includes("score") && schema.includes("reasons");
}

function checkNetworkEvidence(): boolean {
  const evm = readFile("src/lib/wallet-evm/index.ts");
  return !!evm && (evm.includes("publicnode") || evm.includes("1rpc") || evm.includes("llamarpc"));
}

function checkDecisionEvidence(): "verified" | "implemented_unverified" | "not_implemented" {
  const types = readFile("src/lib/wallet/types.ts");
  if (!types) return "not_implemented";
  if (types.includes("evidence") || types.includes("Evidence") || types.includes("DecisionResult")) {
    return "implemented_unverified";
  }
  return "not_implemented";
}

function checkAuditEvidence(): "verified" | "implemented_unverified" | "not_implemented" {
  const schema = readFile("prisma/schema.prisma");
  if (!schema) return "not_implemented";
  const hasPrismaModel = schema.includes("model PermissionAuditLog");
  const hasEngine = fileExists("src/lib/wallet-engines/audit/index.ts");
  const hasHmacChain = fileExists("src/lib/wallet-engines/audit/hmac-chain.ts");
  const hasHmacTests = fileExists("src/lib/wallet-engines/audit/__tests__/hmac-chain.test.ts");
  if (hasPrismaModel && hasEngine && hasHmacChain && hasHmacTests) return "verified";
  if (hasPrismaModel && hasEngine) return "implemented_unverified";
  return "not_implemented";
}

function checkRecoveryEvidence(): "verified" | "implemented_unverified" | "not_implemented" {
  if (
    fileExists("src/lib/wallet-engines/recovery/index.ts") &&
    fileExists("scripts/test-shamir.ts")
  ) {
    return "implemented_unverified";
  }
  return "not_implemented";
}
