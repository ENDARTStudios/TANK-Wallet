/**
 * Release Readiness Metric
 */
import { Check, computeScore, evidenceMissing, evidenceVerified, fileExists, MetricResult, readFile, SCRIPT_VERSION } from "./_shared";
const WEIGHT = 0.15;

export function computeRelease(): MetricResult {
  const ciConfig = readFile(".github/workflows/ci.yml") ?? "";
  const releaseConfig = readFile(".github/workflows/release.yml") ?? "";
  const dastConfig = readFile(".github/workflows/dast.yml") ?? "";

  const checks: Check[] = [
    { name: "CI/CD pipeline", description: "15%", weight: 0.15, state: fileExists(".github/workflows/ci.yml") ? "verified" : "not_implemented", passed: fileExists(".github/workflows/ci.yml"), evidence: fileExists(".github/workflows/ci.yml") ? evidenceVerified(".github/workflows/ci.yml", "filesystem") : evidenceMissing() },
    { name: "Reproducible build", description: "20%", weight: 0.20, state: fileExists("Dockerfile") ? "implemented_unverified" : "not_implemented", passed: fileExists("Dockerfile"), evidence: fileExists("Dockerfile") ? evidenceVerified("Dockerfile (multi-stage)", "filesystem") : evidenceMissing() },
    { name: "SBOM published", description: "10%", weight: 0.10, state: ciConfig.includes("cyclonedx") || releaseConfig.includes("cyclonedx") ? "verified" : "not_implemented", passed: ciConfig.includes("cyclonedx") || releaseConfig.includes("cyclonedx"), evidence: (ciConfig.includes("cyclonedx") || releaseConfig.includes("cyclonedx")) ? evidenceVerified("cyclonedx in CI/release", "filesystem") : evidenceMissing() },
    { name: "Release signed (sigstore)", description: "15%", weight: 0.15, state: releaseConfig.includes("cosign") ? "verified" : "not_implemented", passed: releaseConfig.includes("cosign"), evidence: releaseConfig.includes("cosign") ? evidenceVerified("cosign in release.yml", "filesystem") : evidenceMissing() },
    { name: "SAST in CI (Semgrep + CodeQL)", description: "10%", weight: 0.10, state: ciConfig.includes("semgrep") && ciConfig.includes("codeql") ? "verified" : "not_implemented", passed: ciConfig.includes("semgrep") && ciConfig.includes("codeql"), evidence: (ciConfig.includes("semgrep") && ciConfig.includes("codeql")) ? evidenceVerified("semgrep+codeql in ci.yml", "filesystem") : evidenceMissing() },
    { name: "DAST in CI (ZAP baseline)", description: "5%", weight: 0.05, state: fileExists(".github/workflows/dast.yml") ? "verified" : "not_implemented", passed: fileExists(".github/workflows/dast.yml"), evidence: fileExists(".github/workflows/dast.yml") ? evidenceVerified("dast.yml", "filesystem") : evidenceMissing() },
    { name: "Dependabot/Renovate", description: "5%", weight: 0.05, state: fileExists(".github/dependabot.yml") ? "verified" : "not_implemented", passed: fileExists(".github/dependabot.yml"), evidence: fileExists(".github/dependabot.yml") ? evidenceVerified("dependabot.yml", "filesystem") : evidenceMissing() },
    { name: "Trivy in CI", description: "5%", weight: 0.05, state: ciConfig.includes("trivy") ? "verified" : "not_implemented", passed: ciConfig.includes("trivy"), evidence: ciConfig.includes("trivy") ? evidenceVerified("trivy in ci.yml", "filesystem") : evidenceMissing() },
    { name: "Gitleaks in CI", description: "5%", weight: 0.05, state: ciConfig.includes("gitleaks") ? "verified" : "not_implemented", passed: ciConfig.includes("gitleaks"), evidence: ciConfig.includes("gitleaks") ? evidenceVerified("gitleaks in ci.yml", "filesystem") : evidenceMissing() },
    { name: "CHANGELOG public", description: "5%", weight: 0.05, state: fileExists("CHANGELOG.md") ? "verified" : "not_implemented", passed: fileExists("CHANGELOG.md"), evidence: fileExists("CHANGELOG.md") ? evidenceVerified("CHANGELOG.md", "filesystem") : evidenceMissing() },
    { name: "Release notes published", description: "5%", weight: 0.05, state: releaseConfig.includes("generate_release_notes") ? "verified" : "not_implemented", passed: releaseConfig.includes("generate_release_notes"), evidence: releaseConfig.includes("generate_release_notes") ? evidenceVerified("generate_release_notes in release.yml", "filesystem") : evidenceMissing() },
  ];
  return { name: "Release Readiness", description: "Release pipeline maturity.", score: computeScore(checks), weight: WEIGHT, formula: "Σ(release_item × weight) × 100", checks, computedAt: new Date().toISOString(), scriptVersion: SCRIPT_VERSION };
}
