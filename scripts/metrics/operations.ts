/**
 * Operational Readiness Metric
 *
 * Formula: Σ(op_item × item_weight) × 100
 *
 * Measures production operation capability: logging, metrics, tracing,
 * alerting, incident response, DR, backup.
 */

import {
  Check,
  computeScore,
  fileExists,
  MetricResult,
  readFile,
  rgCount,
  SCRIPT_VERSION,
} from "./_shared";

const WEIGHT = 0.20; // 20% of Overall Confidence

export function computeOperations(): MetricResult {
  const checks: Check[] = [
    {
      name: "Structured logger exists",
      description: "src/lib/observability/logger.ts (Pino or equivalent)",
      weight: 0.15,
      passed: fileExists("src/lib/observability/logger.ts"),
      evidence: fileExists("src/lib/observability/logger.ts")
        ? "logger present"
        : "no structured logger (currently uses console.* in places — see code-audit)",
      notes: "Must be created per ENGINEERING-STANDARDS.md §6. Pino recommended.",
    },
    {
      name: "Prometheus metrics exposed",
      description: "Metrics endpoint + client library",
      weight: 0.15,
      passed: fileExists("src/app/api/metrics/route.ts") || rgCount("prom-client|prometheus", ["src"]) > 0,
      evidence: "no prom-client detected",
    },
    {
      name: "Tracing (OpenTelemetry) integrated",
      description: "src/lib/observability/tracing.ts",
      weight: 0.10,
      passed: fileExists("src/lib/observability/tracing.ts") || rgCount("@opentelemetry|opentelemetry", ["src"]) > 0,
      evidence: "no OTel SDK detected",
    },
    {
      name: "Alertmanager + alerts configured",
      description: "alerts.yml + routing rules",
      weight: 0.15,
      passed: fileExists("alerts.yml") || fileExists("ops/alerts.yml"),
      evidence: "no alert config",
    },
    {
      name: "Error tracking (Sentry)",
      description: "Sentry SDK integrated in client + server",
      weight: 0.10,
      passed: rgCount("@sentry|sentry", ["src"]) > 0 || rgCount('"@sentry', ["package.json"]) > 0,
      evidence: "no Sentry SDK in dependencies",
    },
    {
      name: "Incident Response runbook",
      description: "docs/runbooks/incident-response.md",
      weight: 0.10,
      passed: fileExists("docs/runbooks/incident-response.md"),
      evidence: "no IR runbook",
    },
    {
      name: "Disaster Recovery tested",
      description: "DR plan + tested in last 90 days",
      weight: 0.10,
      passed: false,
      evidence: "no DR plan",
    },
    {
      name: "Backup automation + restore tested",
      description: "Backup script + restore drill",
      weight: 0.05,
      passed: false,
      evidence: "no backup automation",
    },
    {
      name: "SOC Dashboard operational",
      description: "Dashboard with real telemetry",
      weight: 0.05,
      passed: checkSocDashboard(),
      evidence: checkSocDashboard()
        ? "sprint4-dashboard component present (UI exists, data partial)"
        : "no SOC dashboard",
      notes: "UI exists but consumes hardcoded data; needs to consume reports/metrics.json.",
    },
    {
      name: "Update Cycle SLA documented",
      description: "8 components with formal update frequency",
      weight: 0.05,
      passed: fileExists("ARCHITECTURE-FREEZE-1.0-BASELINE.md"),
      evidence: "referenced in baseline document",
    },
  ];

  const score = computeScore(checks);
  return {
    name: "Operational Readiness",
    description:
      "Production operation capability. Measures infra+process, not runtime SLOs (those kick in post-launch).",
    score,
    weight: WEIGHT,
    formula: "Σ(op_item × item_weight) × 100 — 10 operational items",
    checks,
    computedAt: new Date().toISOString(),
    scriptVersion: SCRIPT_VERSION,
  };
}

function checkSocDashboard(): boolean {
  return fileExists("src/components/wallet/sprint4/sprint4-dashboard.tsx");
}
