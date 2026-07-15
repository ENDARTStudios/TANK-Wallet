/**
 * Release Readiness Metric
 *
 * Formula: Σ(release_item × item_weight) × 100
 *
 * Measures release pipeline maturity: CI/CD, reproducible builds, SBOM,
 * signing, SAST/DAST, dependency management.
 */

import {
  Check,
  computeScore,
  fileExists,
  MetricResult,
  rgCount,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.15; // 15% of Overall Confidence

export function computeRelease(): MetricResult {
  const checks: Check[] = [
    {
      name: "CI/CD pipeline",
      description: ".github/workflows/ with build+test+lint",
      weight: 0.15,
      passed: fileExists(".github/workflows") || fileExists(".gitlab-ci.yml"),
      evidence: fileExists(".github/workflows")
        ? ".github/workflows/ present"
        : "no CI config found",
      notes: "Pipeline must implement full gate sequence per ENGINEERING-STANDARDS.md §11.2.",
    },
    {
      name: "Reproducible build",
      description: "Two builds produce identical hash",
      weight: 0.20,
      passed: false,
      evidence: "not implemented",
      notes: "Requires deterministic Next.js build + locked bun.lockb + container build.",
    },
    {
      name: "SBOM published",
      description: "CycloneDX SBOM at release",
      weight: 0.10,
      passed: fileExists("sbom.cyclonedx.json") || fileExists("reports/sbom.cyclonedx.json"),
      evidence: "no SBOM artefact",
    },
    {
      name: "Release signed (sigstore)",
      description: "Release artefact signed via sigstore/cosign",
      weight: 0.15,
      passed: false,
      evidence: "not implemented",
    },
    {
      name: "SAST in CI (Semgrep + CodeQL)",
      description: "Semgrep + CodeQL running on every PR",
      weight: 0.10,
      passed: checkSast(),
      evidence: checkSast()
        ? "SAST config detected"
        : "no SAST config",
    },
    {
      name: "DAST in CI (ZAP baseline)",
      description: "Weekly ZAP scan in staging",
      weight: 0.05,
      passed: false,
      evidence: "not implemented",
    },
    {
      name: "Dependabot/Renovate",
      description: "Auto PRs for dependency updates",
      weight: 0.05,
      passed: fileExists(".github/dependabot.yml") || fileExists("renovate.json"),
      evidence: "no Dependabot/Renovate config",
    },
    {
      name: "Trivy in CI",
      description: "Container + dependency scan",
      weight: 0.05,
      passed: false,
      evidence: "not implemented",
    },
    {
      name: "Gitleaks in CI",
      description: "Secret scanning on every commit",
      weight: 0.05,
      passed: false,
      evidence: "not implemented",
    },
    {
      name: "CHANGELOG public",
      description: "CHANGELOG.md following Keep a Changelog",
      weight: 0.05,
      passed: fileExists("CHANGELOG.md"),
      evidence: fileExists("CHANGELOG.md") ? "CHANGELOG.md present" : "no CHANGELOG",
    },
    {
      name: "Release notes published",
      description: "GitHub Release with notes per minor",
      weight: 0.05,
      passed: false,
      evidence: "no releases yet",
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Release Readiness",
    description: "Release pipeline maturity. Below 100% = no public GA release.",
    score,
    weight: WEIGHT,
    formula: "Σ(release_item × item_weight) × 100 — 11 release items",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function checkSast(): boolean {
  return fileExists(".github/workflows/semgrep.yml") || fileExists(".semgrep.yml") || fileExists("semgrep.yml");
}
