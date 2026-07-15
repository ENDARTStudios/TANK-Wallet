/**
 * Security Assurance Metric
 *
 * Formula: Σ(validation_item × item_weight) × 100
 *
 * Measures EXTERNAL validation only. Implementation does not count here.
 * Without external audit, max achievable is ~30% by design.
 */

import {
  Check,
  computeScore,
  fileExists,
  MetricResult,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.25; // 25% of Overall Confidence (combined with Security Readiness as average)
// In Overall Confidence: (Security Readiness + Assurance) / 2 × 25%

export function computeAssurance(): MetricResult {
  const checks: Check[] = [
    {
      name: "Audit #1 completed (no criticals)",
      description: "External crypto audit by qualified firm, no critical findings",
      weight: 0.25,
      passed: false,
      evidence: "not yet started (planned Sprint 5)",
    },
    {
      name: "Audit #2 completed (no criticals)",
      description: "External audit of engines + decision pipeline",
      weight: 0.25,
      passed: false,
      evidence: "not yet started (planned Sprint 5)",
    },
    {
      name: "Pentest #1 completed (no criticals)",
      description: "Frontend + API + browser extension red team",
      weight: 0.15,
      passed: false,
      evidence: "not yet started",
    },
    {
      name: "Pentest #2 completed (no criticals)",
      description: "Infra + deployment + supply chain red team",
      weight: 0.10,
      passed: false,
      evidence: "not yet started",
    },
    {
      name: "Bug bounty public (no criticals open for 90 days)",
      description: "Immunefi or HackerOne program live",
      weight: 0.15,
      passed: false,
      evidence: "not yet started (after Audit #1)",
    },
    {
      name: "SECURITY.md published",
      description: "Public disclosure policy + PGP key + SLA",
      weight: 0.05,
      passed: fileExists("SECURITY.md"),
      evidence: fileExists("SECURITY.md") ? "SECURITY.md present at repo root" : "no SECURITY.md",
      notes: "To be created in Sprint 5.",
    },
    {
      name: "2+ independent validation sources",
      description: "Two separate external firms have validated",
      weight: 0.05,
      passed: false,
      evidence: "0 sources so far",
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Security Assurance",
    description:
      "EXTERNAL validation only. Without audit, max achievable is ~5% (only SECURITY.md). Implementation does not count here.",
    score,
    weight: WEIGHT,
    formula: "Σ(validation_item × item_weight) × 100 — 7 external validation items",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}
