/**
 * Release Readiness Metric
 */

import {
  Check,
  computeScore,
  evidenceMissing,
  evidenceVerified,
  fileExists,
  MetricResult,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.15;

export function computeRelease(): MetricResult {
  const checks: Check[] = [
    {
      name: "CI/CD pipeline",
      description: ".github/workflows/ with build+test+lint",
      weight: 0.15,
      state: fileExists(".github/workflows") ? "verified" : "not_implemented",
      passed: fileExists(".github/workflows") || fileExists(".gitlab-ci.yml"),
      evidence: fileExists(".github/workflows")
        ? evidenceVerified(".github/workflows/ present", "filesystem")
        : evidenceMissing(),
      notes: "Pipeline must implement full gate sequence per ENGINEERING-STANDARDS.md §11.2.",
    },
    {
      name: "Reproducible build",
      description: "Two builds produce identical hash",
      weight: 0.20,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "Requires deterministic Next.js build + locked bun.lockb + container build.",
    },
    {
      name: "SBOM published",
      description: "CycloneDX SBOM at release",
      weight: 0.10,
      state: fileExists("sbom.cyclonedx.json") ? "verified" : "not_implemented",
      passed: fileExists("sbom.cyclonedx.json") || fileExists("reports/sbom.cyclonedx.json"),
      evidence: fileExists("sbom.cyclonedx.json")
        ? evidenceVerified("sbom.cyclonedx.json", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Release signed (sigstore)",
      description: "Release artefact signed via sigstore/cosign",
      weight: 0.15,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "SAST in CI (Semgrep + CodeQL)",
      description: "Semgrep + CodeQL running on every PR",
      weight: 0.10,
      state: checkSastState(),
      passed: checkSast(),
      evidence: checkSast()
        ? evidenceVerified("SAST config detected", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "DAST in CI (ZAP baseline)",
      description: "Weekly ZAP scan in staging",
      weight: 0.05,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "Dependabot/Renovate",
      description: "Auto PRs for dependency updates",
      weight: 0.05,
      state: fileExists(".github/dependabot.yml") || fileExists("renovate.json") ? "verified" : "not_implemented",
      passed: fileExists(".github/dependabot.yml") || fileExists("renovate.json"),
      evidence: evidenceMissing(),
    },
    {
      name: "Trivy in CI",
      description: "Container + dependency scan",
      weight: 0.05,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "Gitleaks in CI",
      description: "Secret scanning on every commit",
      weight: 0.05,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "CHANGELOG public",
      description: "CHANGELOG.md following Keep a Changelog",
      weight: 0.05,
      state: fileExists("CHANGELOG.md") ? "verified" : "not_implemented",
      passed: fileExists("CHANGELOG.md"),
      evidence: fileExists("CHANGELOG.md")
        ? evidenceVerified("CHANGELOG.md", "filesystem")
        : evidenceMissing(),
    },
    {
      name: "Release notes published",
      description: "GitHub Release with notes per minor",
      weight: 0.05,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Release Readiness",
    description:
      "Release pipeline maturity. 3-state model. Below 100% = no public GA release.",
    score,
    weight: WEIGHT,
    formula: "Σ(release_item_state × item_weight) × 100 — 11 release items",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function checkSast(): boolean {
  return fileExists(".github/workflows/semgrep.yml") || fileExists(".semgrep.yml") || fileExists("semgrep.yml");
}

function checkSastState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkSast()) return "verified";
  return "not_implemented";
}
