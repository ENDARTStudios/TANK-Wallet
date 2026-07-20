/**
 * Security Assurance Metric
 *
 * External validation only. Without external audit, max is ~5% by design.
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

const WEIGHT = 0.15; // weight in Overall Confidence (combined with Security Readiness as average)

export function computeAssurance(): MetricResult {
  const checks: Check[] = [
    {
      name: "Audit #1 completed (no criticals)",
      description: "External crypto audit by qualified firm, no critical findings",
      weight: 0.25,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "Planned Sprint 5.",
    },
    {
      name: "Audit #2 completed (no criticals)",
      description: "External audit of engines + decision pipeline",
      weight: 0.25,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "Planned Sprint 5.",
    },
    {
      name: "Pentest #1 completed (no criticals)",
      description: "Frontend + API + browser extension red team",
      weight: 0.15,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "Pentest #2 completed (no criticals)",
      description: "Infra + deployment + supply chain red team",
      weight: 0.10,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "Bug bounty public (no criticals open for 90 days)",
      description: "Immunefi or HackerOne program live",
      weight: 0.15,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
      notes: "After Audit #1.",
    },
    {
      name: "SECURITY.md published",
      description: "Public disclosure policy + PGP key + SLA",
      weight: 0.05,
      state: fileExists("SECURITY.md") ? "verified" : "not_implemented",
      passed: fileExists("SECURITY.md"),
      evidence: fileExists("SECURITY.md")
        ? evidenceVerified("SECURITY.md at repo root", "filesystem")
        : evidenceMissing(),
      notes: "To be created in Sprint 5.",
    },
    {
      name: "2+ independent validation sources",
      description: "Two separate external firms have validated",
      weight: 0.05,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Security Assurance",
    description:
      "External validation only. 3-state model: verified = external artefact exists. Without audit, max achievable is ~5% (only SECURITY.md).",
    score,
    weight: WEIGHT,
    formula: "Σ(item_state × item_weight) × 100 — 7 external validation items",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}
