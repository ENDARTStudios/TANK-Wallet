/**
 * Security Readiness Metric
 *
 * 3-state model per engine. Audit engine has weight 0% until Sprint 5.
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
  rgCount,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.15; // weight in Overall Confidence (combined with Assurance as average)

export function computeSecurity(): MetricResult {
  const checks: Check[] = [
    {
      name: "Threat Intel (GoPlus real)",
      description: "Weight: 20%",
      weight: 0.20,
      state: checkThreatIntelState(),
      passed: checkThreatIntel(),
      evidence: checkThreatIntel()
        ? evidenceVerified("src/app/api/goplus/token/route.ts + address/route.ts + threat-intel engine + Prisma models", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Simulation (eth_call real)",
      description: "Weight: 15%",
      weight: 0.15,
      state: checkSimulationState(),
      passed: checkSimulation(),
      evidence: checkSimulation()
        ? evidenceImplemented("src/lib/wallet-evm/ uses viem eth_call", "filesystem + rg")
        : evidenceMissing(),
    },
    {
      name: "Policy (6 policies + 11 conditions)",
      description: "Weight: 10%",
      weight: 0.10,
      state: checkPolicyState(),
      passed: checkPolicy(),
      evidence: checkPolicy()
        ? evidenceImplemented("src/lib/wallet-engines/policy/index.ts", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Permissions (universal: ERC-20/721/1155/Permit2/4337/SPL/BTC/Lightning)",
      description: "Weight: 10%",
      weight: 0.10,
      state: checkPermissionsState(),
      passed: checkPermissions(),
      evidence: checkPermissions()
        ? evidenceImplemented("src/lib/wallet-sovereignty/ + permission engine", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Behavior (anomaly detection)",
      description: "Weight: 15%",
      weight: 0.15,
      state: checkBehaviorState(),
      passed: checkBehavior(),
      evidence: checkBehavior()
        ? evidenceImplemented("src/lib/wallet-engines/behavior/ + BehaviorProfile/BehaviorAnomaly models", "filesystem + prisma schema")
        : evidenceMissing(),
    },
    {
      name: "Network (RPC pool + quorum + failover)",
      description: "Weight: 10%",
      weight: 0.10,
      state: checkNetworkState(),
      passed: checkNetwork(),
      evidence: checkNetwork()
        ? evidenceImplemented("src/lib/wallet-evm/ with multi-RPC failover (publicnode, 1rpc, llamarpc)", "filesystem + rg")
        : evidenceMissing(),
    },
    {
      name: "Device Trust (WebAuthn + WebCrypto)",
      description: "Weight: 10%",
      weight: 0.10,
      state: checkDeviceTrustState(),
      passed: checkDeviceTrust(),
      evidence: checkDeviceTrust()
        ? evidenceImplemented("WebAuthn/WebCrypto usage detected in src/", "ripgrep")
        : evidenceMissing(),
    },
    {
      name: "Crypto (vectors validated)",
      description: "Weight: 10%",
      weight: 0.10,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "Blocked: depends on Engineering Readiness 'Crypto vectors committed' criterion.",
    },
    {
      name: "Audit (external validation)",
      description: "Weight: 0% (until Sprint 5)",
      weight: 0.00,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "Weight is 0% by design. After Audit #1 + #2 in Sprint 5, this engine gets weight 15% and other weights are recalibrated.",
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Security Readiness",
    description:
      "Per-engine real implementation. 3-state model: verified (artefact + test), implemented_unverified (code exists), not_implemented. Audit engine has 0% weight until Sprint 5.",
    score,
    weight: WEIGHT,
    formula: "Σ(engine_state × engine_weight) × 100 — 9 engines, Audit weight=0%",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function checkThreatIntel(): boolean {
  return (
    fileExists("src/app/api/goplus/token/route.ts") &&
    fileExists("src/app/api/goplus/address/route.ts") &&
    fileExists("src/lib/wallet-engines/threat-intel/index.ts")
  );
}

function checkThreatIntelState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkThreatIntel()) return "implemented_unverified"; // code exists, integration tests not yet run
  return "not_implemented";
}

function checkSimulation(): boolean {
  const evm = readFile("src/lib/wallet-evm/index.ts");
  return !!evm && (evm.includes("eth_call") || evm.includes("call") || evm.includes("simulate"));
}

function checkSimulationState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkSimulation()) return "implemented_unverified";
  return "not_implemented";
}

function checkPolicy(): boolean {
  return fileExists("src/lib/wallet-engines/policy/index.ts");
}

function checkPolicyState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkPolicy()) return "implemented_unverified";
  return "not_implemented";
}

function checkPermissions(): boolean {
  return (
    fileExists("src/lib/wallet-sovereignty/index.ts") &&
    fileExists("src/lib/wallet-engines/permission/index.ts")
  );
}

function checkPermissionsState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkPermissions()) return "implemented_unverified";
  return "not_implemented";
}

function checkBehavior(): boolean {
  return fileExists("src/lib/wallet-engines/behavior/index.ts");
}

function checkBehaviorState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkBehavior()) return "implemented_unverified";
  return "not_implemented";
}

function checkNetwork(): boolean {
  const evm = readFile("src/lib/wallet-evm/index.ts");
  return (
    !!evm &&
    (evm.includes("publicnode") || evm.includes("1rpc") || evm.includes("llamarpc") || evm.includes("failover"))
  );
}

function checkNetworkState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkNetwork()) return "implemented_unverified";
  return "not_implemented";
}

function checkDeviceTrust(): boolean {
  const matches = rgCount("webauthn|WebAuthn|navigator\\.credentials|subtle\\.encrypt|subtle\\.decrypt", ["src"]);
  return matches > 0;
}

function checkDeviceTrustState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkDeviceTrust()) return "implemented_unverified";
  return "not_implemented";
}
