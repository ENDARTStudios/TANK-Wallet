/**
 * Overall Confidence Metric (Composite)
 *
 * Reads weights from config/kpi-weights.json (not hardcoded).
 * If config file missing or invalid, falls back to defaults declared here
 * AND logs an inconsistency.
 */

import {
  Check,
  evidenceMissing,
  evidenceVerified,
  MetricResult,
  readJson,
  SCRIPT_VERSION,
} from "./_shared";

interface KpiWeightsConfig {
  version: string;
  weights: {
    architecture: number;
    engineering: number;
    security: number; // (readiness + assurance) / 2
    evidence: number;
    operations: number;
    release: number;
  };
  securitySubWeights: {
    readiness: number;
    assurance: number;
  };
}

const DEFAULT_WEIGHTS: KpiWeightsConfig["weights"] = {
  architecture: 0.20,
  engineering: 0.20,
  security: 0.15,
  evidence: 0.10,
  operations: 0.20,
  release: 0.15,
};

const DEFAULT_SUB_WEIGHTS: KpiWeightsConfig["securitySubWeights"] = {
  readiness: 0.5,
  assurance: 0.5,
};

/**
 * Load weights from config/kpi-weights.json.
 * Returns null if config invalid or weights don't sum to 1.0.
 * Caller should treat null as inconsistency.
 */
export function loadWeights(): { config: KpiWeightsConfig | null; warnings: string[] } {
  const warnings: string[] = [];
  const config = readJson<KpiWeightsConfig>("config/kpi-weights.json");

  if (!config) {
    warnings.push("config/kpi-weights.json not found — using defaults");
    return { config: null, warnings };
  }

  const w = config.weights;
  const sum = w.architecture + w.engineering + w.security + w.evidence + w.operations + w.release;
  if (Math.abs(sum - 1.0) > 0.001) {
    warnings.push(`config/kpi-weights.json weights sum to ${sum.toFixed(4)}, expected 1.0000 — using defaults`);
    return { config: null, warnings };
  }

  const subSum = config.securitySubWeights.readiness + config.securitySubWeights.assurance;
  if (Math.abs(subSum - 1.0) > 0.001) {
    warnings.push(`securitySubWeights sum to ${subSum.toFixed(4)}, expected 1.0000 — using defaults`);
    return { config: null, warnings };
  }

  return { config, warnings };
}

export function computeConfidence(
  metrics: {
    architecture: MetricResult;
    engineering: MetricResult;
    security: MetricResult;
    assurance: MetricResult;
    evidence: MetricResult;
    operations: MetricResult;
    release: MetricResult;
  },
  weights: KpiWeightsConfig["weights"] = DEFAULT_WEIGHTS,
  subWeights: KpiWeightsConfig["securitySubWeights"] = DEFAULT_SUB_WEIGHTS
): MetricResult {
  const securityAvg =
    metrics.security.score * subWeights.readiness + metrics.assurance.score * subWeights.assurance;

  const raw =
    metrics.architecture.score * weights.architecture +
    metrics.engineering.score * weights.engineering +
    securityAvg * weights.security +
    metrics.evidence.score * weights.evidence +
    metrics.operations.score * weights.operations +
    metrics.release.score * weights.release;

  const score = Math.round(raw);

  return {
    name: "Overall Confidence",
    description:
      "Composite weighted score from config/kpi-weights.json. NOT a security claim — only a progress indicator. Real assurance requires external audit.",
    score,
    weight: 1.0,
    formula: `Architecture×${(weights.architecture * 100).toFixed(0)}% + Engineering×${(weights.engineering * 100).toFixed(0)}% + Security(readiness×${(subWeights.readiness * 100).toFixed(0)}%+assurance×${(subWeights.assurance * 100).toFixed(0)}%)×${(weights.security * 100).toFixed(0)}% + Evidence×${(weights.evidence * 100).toFixed(0)}% + Operations×${(weights.operations * 100).toFixed(0)}% + Release×${(weights.release * 100).toFixed(0)}%
Inputs: Arch=${metrics.architecture.score}, Eng=${metrics.engineering.score}, SecR=${metrics.security.score}, SecA=${metrics.assurance.score}, SecAvg=${securityAvg.toFixed(1)}, Ev=${metrics.evidence.score}, Ops=${metrics.operations.score}, Rel=${metrics.release.score}
Raw = ${raw.toFixed(2)}`,
    checks: [
      {
        name: "Architecture Compliance",
        description: `${(weights.architecture * 100).toFixed(0)}% weight`,
        weight: weights.architecture,
        state: metrics.architecture.score >= 100 ? "verified" : "implemented_unverified",
        passed: metrics.architecture.score >= 100,
        evidence: evidenceVerified(
          `${metrics.architecture.score}% × ${weights.architecture} = ${(metrics.architecture.score * weights.architecture).toFixed(1)}`,
          "computed"
        ),
      },
      {
        name: "Engineering Readiness",
        description: `${(weights.engineering * 100).toFixed(0)}% weight`,
        weight: weights.engineering,
        state: metrics.engineering.score >= 95 ? "verified" : metrics.engineering.score > 0 ? "implemented_unverified" : "not_implemented",
        passed: metrics.engineering.score >= 95,
        evidence: evidenceVerified(
          `${metrics.engineering.score}% × ${weights.engineering} = ${(metrics.engineering.score * weights.engineering).toFixed(1)}`,
          "computed"
        ),
      },
      {
        name: "Security (readiness + assurance)",
        description: `${(weights.security * 100).toFixed(0)}% weight`,
        weight: weights.security,
        state: securityAvg >= 95 ? "verified" : securityAvg > 0 ? "implemented_unverified" : "not_implemented",
        passed: securityAvg >= 95,
        evidence: evidenceVerified(
          `(${metrics.security.score}×${subWeights.readiness} + ${metrics.assurance.score}×${subWeights.assurance}) × ${weights.security} = ${(securityAvg * weights.security).toFixed(1)}`,
          "computed"
        ),
      },
      {
        name: "Security Evidence",
        description: `${(weights.evidence * 100).toFixed(0)}% weight`,
        weight: weights.evidence,
        state: metrics.evidence.score >= 95 ? "verified" : metrics.evidence.score > 0 ? "implemented_unverified" : "not_implemented",
        passed: metrics.evidence.score >= 95,
        evidence: evidenceVerified(
          `${metrics.evidence.score}% × ${weights.evidence} = ${(metrics.evidence.score * weights.evidence).toFixed(1)}`,
          "computed"
        ),
      },
      {
        name: "Operational Readiness",
        description: `${(weights.operations * 100).toFixed(0)}% weight`,
        weight: weights.operations,
        state: metrics.operations.score >= 90 ? "verified" : metrics.operations.score > 0 ? "implemented_unverified" : "not_implemented",
        passed: metrics.operations.score >= 90,
        evidence: evidenceVerified(
          `${metrics.operations.score}% × ${weights.operations} = ${(metrics.operations.score * weights.operations).toFixed(1)}`,
          "computed"
        ),
      },
      {
        name: "Release Readiness",
        description: `${(weights.release * 100).toFixed(0)}% weight`,
        weight: weights.release,
        state: metrics.release.score >= 100 ? "verified" : metrics.release.score > 0 ? "implemented_unverified" : "not_implemented",
        passed: metrics.release.score >= 100,
        evidence: evidenceVerified(
          `${metrics.release.score}% × ${weights.release} = ${(metrics.release.score * weights.release).toFixed(1)}`,
          "computed"
        ),
      },
    ],
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

export { DEFAULT_WEIGHTS, DEFAULT_SUB_WEIGHTS };
export type { KpiWeightsConfig };
