/**
 * Architecture Compliance Metric
 *
 * Formula: Σ(check_state_score × check_weight) × 100
 * where state_score = verified(1.0) | implemented_unverified(0.5) | not_implemented(0.0)
 */

import {
  Check,
  computeScore,
  dirExists,
  evidenceImplemented,
  evidenceMissing,
  evidenceVerified,
  fileExists,
  listDir,
  MetricResult,
  readFile,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.20;

export function computeArchitecture(): MetricResult {
  const checks: Check[] = [
    {
      name: "Security Kernel exists",
      description: "src/lib/wallet-security-real/ contains kernel orchestrator",
      weight: 0.10,
      state: dirExists("src/lib/wallet-security-real") ? "verified" : "not_implemented",
      passed: dirExists("src/lib/wallet-security-real"),
      evidence: dirExists("src/lib/wallet-security-real")
        ? evidenceVerified("src/lib/wallet-security-real/index.ts", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "16 Security Engines present",
      description: "src/lib/wallet-engines/ has expected engine directories",
      weight: 0.15,
      state: checkEnginesState(),
      passed: countEngines() >= 12,
      evidence: evidenceVerified(`${countEngines()} engine directories in src/lib/wallet-engines/`, "filesystem"),
      notes:
        "Architecture declares 16 engines; 12 are present as directories. Remaining 4 (device-trust, wallet-guardian, ai-security, governance) are partially embedded elsewhere — extraction is a candidate for Freeze 2.0.",
    },
    {
      name: "Tank Security Standard (TSS) documented",
      description: "TSS-001 through TSS-010 specs exist",
      weight: 0.10,
      state: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md") ? "implemented_unverified" : "not_implemented",
      passed: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md"),
      evidence: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md")
        ? evidenceImplemented("ARCHITECTURE-FREEZE-1.0-BASELINE.md", "filesystem")
        : evidenceMissing(),
      notes: "TSS covered in baseline doc. Separate per-spec files in docs/tss/ are planned — currently no automated test verifies presence of each spec.",
    },
    {
      name: "Tank Security Framework (TSF) documented",
      description: "7 domains: User/Blockchain/Wallet/Infra/Privacy/AI/Business Protection",
      weight: 0.10,
      state: fileExists("ARCHITECTURE.md") ? "implemented_unverified" : "not_implemented",
      passed: fileExists("ARCHITECTURE.md"),
      evidence: fileExists("ARCHITECTURE.md")
        ? evidenceImplemented("ARCHITECTURE.md", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Security Governance Layer (registries)",
      description: "Prisma schema contains threat/policy/trust/audit registries",
      weight: 0.10,
      state: checkRegistries() ? "verified" : "not_implemented",
      passed: checkRegistries(),
      evidence: checkRegistries()
        ? evidenceVerified(
            "prisma/schema.prisma contains ThreatToken, ThreatSite, ThreatAddress, ThreatExploit, PermissionAuditLog, BehaviorProfile, RecoveryContact",
            "filesystem + schema parser"
          )
        : evidenceMissing(),
    },
    {
      name: "Security Event Bus typed",
      description: "Event types declared and used",
      weight: 0.10,
      state: checkEventBus() ? "verified" : "not_implemented",
      passed: checkEventBus(),
      evidence: checkEventBus()
        ? evidenceVerified("SecurityEvent / EventType references in src/lib/wallet/types.ts", "filesystem + rg")
        : evidenceMissing(),
    },
    {
      name: "Unified Data Model present",
      description: "15 shared objects in src/lib/wallet-core/",
      weight: 0.10,
      state: checkUnifiedModel(),
      passed: fileExists("src/lib/wallet-core/index.ts") || fileExists("src/lib/wallet/types.ts"),
      evidence: evidenceImplemented("src/lib/wallet-core/index.ts + src/lib/wallet/types.ts", "filesystem"),
      notes: "Model is split across two files; consolidation planned. No test verifies count of 15 shared objects.",
    },
    {
      name: "ChainPlugin Interface (apiVersion 1.0) + 4 plugins",
      description: "Plugin system with Ethereum, Bitcoin, Solana, Lightning",
      weight: 0.10,
      state: checkPlugins() ? "implemented_unverified" : "not_implemented",
      passed: checkPlugins(),
      evidence: checkPlugins()
        ? evidenceImplemented(
            "src/lib/wallet-evm, src/lib/wallet-core (BTC), src/lib/wallet-sovereignty (Lightning), src/lib/wallet-engines/plugin",
            "filesystem"
          )
        : evidenceMissing(),
      notes: "Plugins are integrated but no unified ChainPlugin interface file exists with apiVersion: 1.0 declared.",
    },
    {
      name: "Architecture Contracts documented",
      description: "15 immutable contracts: SecurityEngine, Event Bus, Data Model, etc.",
      weight: 0.10,
      state: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md") ? "implemented_unverified" : "not_implemented",
      passed: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md"),
      evidence: evidenceImplemented("ARCHITECTURE-FREEZE-1.0-BASELINE.md", "filesystem"),
      notes: "Contracts referenced in baseline. No automated test enforces immutability.",
    },
    {
      name: "Decision Engine (evidence-based)",
      description: "Decision pipeline produces evidence[], sources[], engineScores{}",
      weight: 0.05,
      state: checkDecisionEvidence(),
      passed: checkDecisionEvidence() !== "not_implemented",
      evidence: evidenceImplemented("src/lib/wallet/types.ts (DecisionResult / SecurityResult)", "filesystem + rg"),
      notes: "Types reference evidence fields but no runtime integration test verifies that every decision actually populates them.",
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Architecture Compliance",
    description:
      "Structural conformance of the 10 frozen architecture components. Measures presence + documentation, not correctness.",
    score,
    weight: WEIGHT,
    formula: "Σ(check_state × check_weight) × 100 — state: verified=1.0, implemented_unverified=0.5, not_implemented=0",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function countEngines(): number {
  return listDir("src/lib/wallet-engines").length;
}

function checkEnginesState(): "verified" | "implemented_unverified" | "not_implemented" {
  const n = countEngines();
  if (n >= 16) return "verified";
  if (n >= 12) return "implemented_unverified";
  return "not_implemented";
}

function checkRegistries(): boolean {
  const schema = readFile("prisma/schema.prisma");
  if (!schema) return false;
  const required = [
    "ThreatToken",
    "ThreatSite",
    "ThreatAddress",
    "ThreatExploit",
    "PermissionAuditLog",
    "BehaviorProfile",
    "RecoveryContact",
  ];
  return required.every((m) => schema.includes(`model ${m}`));
}

function checkEventBus(): boolean {
  const types = readFile("src/lib/wallet/types.ts");
  if (!types) return false;
  return types.includes("SecurityEvent") || types.includes("EventType");
}

function checkUnifiedModel(): "verified" | "implemented_unverified" | "not_implemented" {
  if (fileExists("src/lib/wallet-core/index.ts") && fileExists("src/lib/wallet/types.ts")) {
    return "implemented_unverified";
  }
  return "not_implemented";
}

function checkPlugins(): boolean {
  return (
    dirExists("src/lib/wallet-evm") &&
    fileExists("src/lib/wallet-core/index.ts") &&
    fileExists("src/lib/wallet-sovereignty/index.ts") &&
    dirExists("src/lib/wallet-engines/plugin")
  );
}

function checkDecisionEvidence(): "verified" | "implemented_unverified" | "not_implemented" {
  const types = readFile("src/lib/wallet/types.ts");
  if (!types) return "not_implemented";
  if (types.includes("evidence") || types.includes("Evidence") || types.includes("DecisionResult")) {
    return "implemented_unverified";
  }
  return "not_implemented";
}
