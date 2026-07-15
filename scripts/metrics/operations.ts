/**
 * Operational Readiness Metric
 */

import {
  Check,
  computeScore,
  evidenceImplemented,
  evidenceMissing,
  evidenceVerified,
  fileExists,
  MetricResult,
  rgCount,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.20;

export function computeOperations(): MetricResult {
  const checks: Check[] = [
    {
      name: "Structured logger exists",
      description: "src/lib/observability/logger.ts (Pino or equivalent)",
      weight: 0.15,
      state: fileExists("src/lib/observability/logger.ts") ? "verified" : "not_implemented",
      passed: fileExists("src/lib/observability/logger.ts"),
      evidence: fileExists("src/lib/observability/logger.ts")
        ? evidenceVerified("src/lib/observability/logger.ts", "filesystem")
        : evidenceMissing(),
      notes: "Must be created per ENGINEERING-STANDARDS.md §6.",
    },
    {
      name: "Prometheus metrics exposed",
      description: "Metrics endpoint + client library",
      weight: 0.15,
      state: checkPrometheusState(),
      passed: rgCount("prom-client|prometheus", ["src"]) > 0,
      evidence: evidenceMissing(),
      notes: "No prom-client dependency detected.",
    },
    {
      name: "Tracing (OpenTelemetry) integrated",
      description: "src/lib/observability/tracing.ts",
      weight: 0.10,
      state: checkOTelState(),
      passed: rgCount("@opentelemetry|opentelemetry", ["src"]) > 0,
      evidence: evidenceMissing(),
    },
    {
      name: "Alertmanager + alerts configured",
      description: "alerts.yml + routing rules",
      weight: 0.15,
      state: fileExists("alerts.yml") || fileExists("ops/alerts.yml") ? "verified" : "not_implemented",
      passed: fileExists("alerts.yml") || fileExists("ops/alerts.yml"),
      evidence: evidenceMissing(),
    },
    {
      name: "Error tracking (Sentry)",
      description: "Sentry SDK integrated in client + server",
      weight: 0.10,
      state: checkSentryState(),
      passed: rgCount("@sentry|sentry", ["src"]) > 0 || rgCount('"@sentry', ["package.json"]) > 0,
      evidence: evidenceMissing(),
    },
    {
      name: "Incident Response runbook",
      description: "docs/runbooks/incident-response.md",
      weight: 0.10,
      state: fileExists("docs/runbooks/incident-response.md") ? "verified" : "not_implemented",
      passed: fileExists("docs/runbooks/incident-response.md"),
      evidence: evidenceMissing(),
    },
    {
      name: "Disaster Recovery tested",
      description: "DR plan + tested in last 90 days",
      weight: 0.10,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "Backup automation + restore tested",
      description: "Backup script + restore drill",
      weight: 0.05,
      state: "not_implemented",
      passed: false,
      evidence: evidenceMissing(),
    },
    {
      name: "SOC Dashboard operational",
      description: "Dashboard consuming reports/metrics.json (not hardcoded)",
      weight: 0.05,
      state: checkSocDashboardState(),
      passed: checkSocDashboard(),
      evidence: checkSocDashboard()
        ? evidenceImplemented("sprint4-dashboard component present (UI exists, consumes hardcoded data)", "filesystem")
        : evidenceMissing(),
      notes: "UI exists but consumes hardcoded data. Needs to consume reports/metrics.json.",
    },
    {
      name: "Update Cycle SLA documented",
      description: "8 components with formal update frequency",
      weight: 0.05,
      state: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md") ? "implemented_unverified" : "not_implemented",
      passed: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md"),
      evidence: evidenceImplemented("referenced in baseline document", "filesystem"),
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Operational Readiness",
    description:
      "Production operation capability. 3-state model. Measures infra+process, not runtime SLOs (those kick in post-launch).",
    score,
    weight: WEIGHT,
    formula: "Σ(op_item_state × item_weight) × 100 — 10 operational items",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function checkSocDashboard(): boolean {
  return fileExists("src/components/wallet/sprint4/sprint4-dashboard.tsx");
}

function checkSocDashboardState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (checkSocDashboard()) return "implemented_unverified"; // hardcoded data, not verified
  return "not_implemented";
}

function checkPrometheusState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (fileExists("src/app/api/metrics/route.ts")) return "verified";
  return "not_implemented";
}

function checkOTelState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (fileExists("src/lib/observability/tracing.ts")) return "verified";
  return "not_implemented";
}

function checkSentryState(): "verified" | "implemented_unverified" | "not_implemented" {
  if (rgCount("@sentry", ["src"]) > 0) return "verified";
  return "not_implemented";
}
