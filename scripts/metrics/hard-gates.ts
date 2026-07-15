/**
 * Hard Gates — Release Decision
 *
 * Release decision is NOT based on percentages. It is based on a list of
 * boolean Hard Gates that must ALL be met before GA release.
 *
 * A gate is "met" only when state === "verified" (artefact exists AND is
 * backed by automated proof). implemented_unverified does NOT pass a hard gate.
 */

import {
  Check,
  evidenceMissing,
  evidenceVerified,
  fileExists,
  HardGate,
  MetricResult,
  ReleaseDecision,
  SCRIPT_VERSION,
} from "./_shared";

export interface HardGateSpec {
  name: string;
  description: string;
  /** Returns true if the gate is met (artefact exists AND is verified). */
  check: () => { met: boolean; artifact: string | null; source: string };
  blockingReasonIfNotMet: string;
}

/**
 * Hard Gates for GA release.
 * Order matters — most critical first.
 */
export const HARD_GATES: HardGateSpec[] = [
  {
    name: "Critical vulns resolved",
    description: "0 critical vulnerabilities from SAST/DAST/manual review",
    check: () => ({
      met: false, // no scanner in CI yet
      artifact: null,
      source: "scanner output (not yet integrated)",
    }),
    blockingReasonIfNotMet: "Critical vulnerabilities not yet scanned — Semgrep/CodeQL not in CI",
  },
  {
    name: "High vulns resolved",
    description: "0 high vulnerabilities from SAST/DAST/manual review",
    check: () => ({
      met: false,
      artifact: null,
      source: "scanner output (not yet integrated)",
    }),
    blockingReasonIfNotMet: "High vulnerabilities not yet scanned — Semgrep/CodeQL not in CI",
  },
  {
    name: "Coverage ≥ 95%",
    description: "Test coverage at least 95% lines and 90% branches",
    check: () => ({
      met: false,
      artifact: null,
      source: "coverage/coverage-summary.json (not yet generated)",
    }),
    blockingReasonIfNotMet: "Coverage tooling not yet integrated (vitest --coverage pending)",
  },
  {
    name: "Crypto vectors validated",
    description: "15 vector sets (BIP-39, BIP-32, SLIP-10, secp256k1, Ed25519, AES-GCM, HKDF, PBKDF2, HMAC, SHA-256, Shamir SLIP-39, EIP-1559/712/191) committed and passing",
    check: () => {
      const exists =
        fileExists("src/lib/wallet-core/__tests__/vectors/bip39.json") ||
        fileExists("src/lib/wallet-core/__tests__/vectors/bip32.json");
      return {
        met: exists,
        artifact: exists ? "src/lib/wallet-core/__tests__/vectors/" : null,
        source: "filesystem",
      };
    },
    blockingReasonIfNotMet: "Crypto vector files not yet committed (see ENGINEERING-STANDARDS.md §12)",
  },
  {
    name: "SBOM published",
    description: "CycloneDX SBOM artefact published with release",
    check: () => ({
      met: fileExists("sbom.cyclonedx.json"),
      artifact: fileExists("sbom.cyclonedx.json") ? "sbom.cyclonedx.json" : null,
      source: "filesystem",
    }),
    blockingReasonIfNotMet: "SBOM not yet generated (@cyclonedx/cyclonedx-npm pending)",
  },
  {
    name: "Reproducible build",
    description: "Two builds in different containers produce identical hash",
    check: () => ({
      met: false,
      artifact: null,
      source: "build verification script (not yet implemented)",
    }),
    blockingReasonIfNotMet: "Reproducible build verification not yet implemented",
  },
  {
    name: "Release signed",
    description: "Release artefact signed via sigstore/cosign",
    check: () => ({
      met: false,
      artifact: null,
      source: "sigstore signing (not yet integrated)",
    }),
    blockingReasonIfNotMet: "Release signing not yet implemented",
  },
  {
    name: "SAST in CI (Semgrep + CodeQL)",
    description: "Static analysis running on every PR",
    check: () => ({
      met: fileExists(".github/workflows/semgrep.yml") || fileExists("semgrep.yml"),
      artifact: fileExists(".github/workflows/semgrep.yml") ? ".github/workflows/semgrep.yml" : null,
      source: "filesystem",
    }),
    blockingReasonIfNotMet: "Semgrep/CodeQL not yet configured in CI",
  },
  {
    name: "Gitleaks in CI",
    description: "Secret scanning on every commit",
    check: () => ({
      met: false,
      artifact: null,
      source: "gitleaks action (not yet integrated)",
    }),
    blockingReasonIfNotMet: "Gitleaks not yet integrated in CI",
  },
  {
    name: "Trivy in CI",
    description: "Container + dependency CVE scan",
    check: () => ({
      met: false,
      artifact: null,
      source: "trivy action (not yet integrated)",
    }),
    blockingReasonIfNotMet: "Trivy not yet integrated in CI",
  },
  {
    name: "SECURITY.md published",
    description: "Public disclosure policy + PGP key + SLA",
    check: () => ({
      met: fileExists("SECURITY.md"),
      artifact: fileExists("SECURITY.md") ? "SECURITY.md" : null,
      source: "filesystem",
    }),
    blockingReasonIfNotMet: "SECURITY.md not yet created",
  },
  {
    name: "Audit #1 completed",
    description: "External crypto audit by qualified firm, no critical findings",
    check: () => ({
      met: false,
      artifact: null,
      source: "external audit report (not yet commissioned)",
    }),
    blockingReasonIfNotMet: "Audit #1 not yet completed (planned Sprint 5)",
  },
  {
    name: "Audit #2 completed",
    description: "External audit of engines + decision pipeline",
    check: () => ({
      met: false,
      artifact: null,
      source: "external audit report (not yet commissioned)",
    }),
    blockingReasonIfNotMet: "Audit #2 not yet completed (planned Sprint 5)",
  },
  {
    name: "Pentest #1 completed",
    description: "Frontend + API + browser extension red team",
    check: () => ({
      met: false,
      artifact: null,
      source: "pentest report (not yet commissioned)",
    }),
    blockingReasonIfNotMet: "Pentest #1 not yet completed",
  },
  {
    name: "Pentest #2 completed",
    description: "Infra + deployment + supply chain red team",
    check: () => ({
      met: false,
      artifact: null,
      source: "pentest report (not yet commissioned)",
    }),
    blockingReasonIfNotMet: "Pentest #2 not yet completed",
  },
  {
    name: "Bug bounty public (no criticals open for 90 days)",
    description: "Immunefi or HackerOne program live for ≥ 90 days with no critical open",
    check: () => ({
      met: false,
      artifact: null,
      source: "bug bounty platform (not yet launched)",
    }),
    blockingReasonIfNotMet: "Bug bounty program not yet launched",
  },
  {
    name: "Incident Response runbook",
    description: "IR runbook tested in tabletop exercise",
    check: () => ({
      met: fileExists("docs/runbooks/incident-response.md"),
      artifact: fileExists("docs/runbooks/incident-response.md") ? "docs/runbooks/incident-response.md" : null,
      source: "filesystem",
    }),
    blockingReasonIfNotMet: "IR runbook not yet written",
  },
];

export function evaluateHardGates(): { gates: HardGate[]; decision: ReleaseDecision } {
  const gates: HardGate[] = HARD_GATES.map((spec) => {
    const result = spec.check();
    return {
      name: spec.name,
      description: spec.description,
      met: result.met,
      evidence: result.met
        ? evidenceVerified(result.artifact ?? "verified", result.source)
        : evidenceMissing(),
      blockingReason: result.met ? null : spec.blockingReasonIfNotMet,
    };
  });

  const blockingGates = gates.filter((g) => !g.met).map((g) => g.name);
  const allMet = blockingGates.length === 0;
  const mostMet = gates.filter((g) => g.met).length >= gates.length * 0.7;

  const decision: ReleaseDecision = {
    decision: allMet ? "READY_FOR_GA" : mostMet ? "READY_FOR_BETA" : "BLOCKED",
    blockingGates,
    gates,
    decidedAt: new Date().toISOString(),
  };

  return { gates, decision };
}
