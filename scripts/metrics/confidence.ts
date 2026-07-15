/**
 * Overall Confidence Metric (Composite)
 *
 * Formula:
 *   Overall Confidence =
 *       (Architecture × 0.20)
 *     + (Engineering × 0.20)
 *     + (Average(Security Readiness, Security Assurance) × 0.15)
 *     + (Security Evidence × 0.10)
 *     + (Operations × 0.20)
 *     + (Release × 0.15)
 *
 * Weights (sum to 1.00):
 *   - Architecture   20%  (foundation; frozen; high weight)
 *   - Engineering    20%  (where bugs live)
 *   - Security*      15%  (avg of Readiness + Assurance)
 *   - Evidence       10%  (auto-provable proof — distinct dimension)
 *   - Operations     20%  (no observability = flying blind)
 *   - Release        15%  (release gate)
 *
 * *Security is split: half for Readiness (implementation), half for
 *  Assurance (external validation). This penalises projects without audit.
 */

import { MetricResult, SCRIPT_VERSION } from "./_shared";

const WEIGHTS = {
  architecture: 0.20,
  engineering: 0.20,
  security: 0.15, // (readiness + assurance) / 2
  evidence: 0.10,
  operations: 0.20,
  release: 0.15,
};

export function computeConfidence(metrics: {
  architecture: MetricResult;
  engineering: MetricResult;
  security: MetricResult;
  assurance: MetricResult;
  evidence: MetricResult;
  operations: MetricResult;
  release: MetricResult;
}): MetricResult {
  const securityAvg = (metrics.security.score + metrics.assurance.score) / 2;

  const raw =
    metrics.architecture.score * WEIGHTS.architecture +
    metrics.engineering.score * WEIGHTS.engineering +
    securityAvg * WEIGHTS.security +
    metrics.evidence.score * WEIGHTS.evidence +
    metrics.operations.score * WEIGHTS.operations +
    metrics.release.score * WEIGHTS.release;

  const score = Math.round(raw);

  return {
    name: "Overall Confidence",
    description:
      "Composite weighted score. NOT a security claim — only a progress indicator. Real assurance requires external audit (see Assurance metric).",
    score,
    weight: 1.0, // this IS the composite
    formula: `Architecture×20% + Engineering×20% + Avg(SecReadiness, SecAssurance)×15% + Evidence×10% + Operations×20% + Release×15%
Inputs: Arch=${metrics.architecture.score}, Eng=${metrics.engineering.score}, SecR=${metrics.security.score}, SecA=${metrics.assurance.score}, SecAvg=${securityAvg.toFixed(1)}, Ev=${metrics.evidence.score}, Ops=${metrics.operations.score}, Rel=${metrics.release.score}
Raw = ${raw.toFixed(2)}`,
    checks: [
      {
        name: "Architecture Compliance",
        description: "20% weight",
        weight: WEIGHTS.architecture,
        passed: metrics.architecture.score >= 100,
        evidence: `${metrics.architecture.score}% × 0.20 = ${(metrics.architecture.score * WEIGHTS.architecture).toFixed(1)}`,
      },
      {
        name: "Engineering Readiness",
        description: "20% weight",
        weight: WEIGHTS.engineering,
        passed: metrics.engineering.score >= 95,
        evidence: `${metrics.engineering.score}% × 0.20 = ${(metrics.engineering.score * WEIGHTS.engineering).toFixed(1)}`,
      },
      {
        name: "Security (avg Readiness + Assurance)",
        description: "15% weight",
        weight: WEIGHTS.security,
        passed: securityAvg >= 95,
        evidence: `(${metrics.security.score} + ${metrics.assurance.score}) / 2 × 0.15 = ${(securityAvg * WEIGHTS.security).toFixed(1)}`,
      },
      {
        name: "Security Evidence",
        description: "10% weight",
        weight: WEIGHTS.evidence,
        passed: metrics.evidence.score >= 95,
        evidence: `${metrics.evidence.score}% × 0.10 = ${(metrics.evidence.score * WEIGHTS.evidence).toFixed(1)}`,
      },
      {
        name: "Operational Readiness",
        description: "20% weight",
        weight: WEIGHTS.operations,
        passed: metrics.operations.score >= 90,
        evidence: `${metrics.operations.score}% × 0.20 = ${(metrics.operations.score * WEIGHTS.operations).toFixed(1)}`,
      },
      {
        name: "Release Readiness",
        description: "15% weight",
        weight: WEIGHTS.release,
        passed: metrics.release.score >= 100,
        evidence: `${metrics.release.score}% × 0.15 = ${(metrics.release.score * WEIGHTS.release).toFixed(1)}`,
      },
    ],
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}
