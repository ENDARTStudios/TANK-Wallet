#!/usr/bin/env bun
/**
 * Tank Wallet — Metrics Master Runner
 *
 * Usage:  bun run metrics     (configured in package.json)
 *         bun run scripts/metrics/index.ts
 *
 * Reads only real sources (filesystem, git, source code). Never app logic.
 * Recomputes every KPI from scratch. Writes:
 *   - reports/metrics.json
 *   - reports/metrics.md
 *
 * Exits 1 if any inconsistency detected (e.g., metric script crashed,
 * weight sum != 1.0, missing required metric).
 */

import {
  MetricsReport,
  writeJson,
  writeMarkdown,
  renderMetricMarkdown,
  gitCommit,
  SCRIPT_VERSION,
} from "./_shared";
import { computeArchitecture } from "./architecture";
import { computeEngineering } from "./engineering";
import { computeSecurity } from "./security";
import { computeAssurance } from "./assurance";
import { computeEvidence } from "./evidence";
import { computeOperations } from "./operations";
import { computeRelease } from "./release";
import { computeConfidence } from "./confidence";

function main(): void {
  const startedAt = new Date().toISOString();
  console.log(`[metrics] computing KPIs at ${startedAt}`);
  console.log(`[metrics] commit: ${gitCommit()}`);
  console.log("");

  // Compute each metric independently.
  const architecture = computeArchitecture();
  const engineering = computeEngineering();
  const security = computeSecurity();
  const assurance = computeAssurance();
  const evidence = computeEvidence();
  const operations = computeOperations();
  const release = computeRelease();

  // Composite last.
  const confidence = computeConfidence({
    architecture,
    engineering,
    security,
    assurance,
    evidence,
    operations,
    release,
  });

  // Validate consistency.
  const inconsistencies: string[] = [];

  // Rule 1: weight sum in confidence must equal 1.0
  const weightSum = confidence.checks.reduce((s, c) => s + c.weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.001) {
    inconsistencies.push(`Confidence weight sum = ${weightSum}, expected 1.0`);
  }

  // Rule 2: each metric weight must be in [0, 1]
  for (const m of [architecture, engineering, security, assurance, evidence, operations, release]) {
    if (m.weight < 0 || m.weight > 1) {
      inconsistencies.push(`Metric ${m.name} has weight ${m.weight} outside [0,1]`);
    }
    if (m.score < 0 || m.score > 100) {
      inconsistencies.push(`Metric ${m.name} has score ${m.score} outside [0,100]`);
    }
  }

  // Rule 3: confidence score must equal recomputed raw
  const securityAvg = (security.score + assurance.score) / 2;
  const rawConfidence =
    architecture.score * 0.20 +
    engineering.score * 0.20 +
    securityAvg * 0.15 +
    evidence.score * 0.10 +
    operations.score * 0.20 +
    release.score * 0.15;
  if (Math.abs(rawConfidence - confidence.score) > 1) {
    inconsistencies.push(
      `Confidence score (${confidence.score}) != recomputed (${Math.round(rawConfidence)})`
    );
  }

  // Rule 4: Security Readiness without Audit cannot exceed 91%
  // (because Audit weight is 0%, max = sum of other engine weights × 100)
  if (security.score > 91) {
    const auditCheck = security.checks.find((c) => c.name.includes("Audit"));
    if (auditCheck && !auditCheck.passed) {
      inconsistencies.push(
        `Security Readiness is ${security.score}% but Audit engine not passed (max should be 91%)`
      );
    }
  }

  // Rule 5: Assurance without external audit cannot exceed 30%
  if (assurance.score > 30) {
    const auditChecks = assurance.checks.filter((c) =>
      c.name.toLowerCase().includes("audit") || c.name.toLowerCase().includes("pentest")
    );
    const anyAuditPassed = auditChecks.some((c) => c.passed);
    if (!anyAuditPassed) {
      inconsistencies.push(
        `Assurance is ${assurance.score}% but no external audit/pentest completed (max should be ~5%)`
      );
    }
  }

  // Build report
  const report: MetricsReport = {
    generatedAt: startedAt,
    commit: gitCommit(),
    scriptVersion: SCRIPT_VERSION,
    metrics: {
      architecture,
      engineering,
      security,
      assurance,
      evidence,
      operations,
      release,
      confidence,
    },
    inconsistencies,
  };

  // Write JSON
  writeJson("metrics.json", report);
  console.log(`[metrics] wrote reports/metrics.json`);

  // Write Markdown
  const md = renderMarkdownReport(report);
  writeMarkdown("metrics.md", md);
  console.log(`[metrics] wrote reports/metrics.md`);
  console.log("");

  // Console summary
  console.log("════════════════════════════════════════════════════════════");
  console.log("  TANK WALLET — KPI SUMMARY");
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  Generated: ${startedAt}`);
  console.log(`  Commit:    ${report.commit.slice(0, 12)}`);
  console.log("");
  console.log(`  Architecture Compliance : ${architecture.score}%`);
  console.log(`  Engineering Readiness   : ${engineering.score}%`);
  console.log(`  Security Readiness      : ${security.score}%  (max 91% pre-audit)`);
  console.log(`  Security Assurance      : ${assurance.score}%  (max ~5% pre-audit)`);
  console.log(`  Security Evidence       : ${evidence.score}%`);
  console.log(`  Operational Readiness   : ${operations.score}%`);
  console.log(`  Release Readiness       : ${release.score}%`);
  console.log("");
  console.log(`  ▶ OVERALL CONFIDENCE    : ${confidence.score}%`);
  console.log("════════════════════════════════════════════════════════════");
  console.log("");

  if (inconsistencies.length > 0) {
    console.error(`[metrics] ❌ ${inconsistencies.length} inconsistency(ies) detected:`);
    for (const i of inconsistencies) {
      console.error(`  - ${i}`);
    }
    console.error("");
    console.error("[metrics] Reports written but exit code = 1 due to inconsistencies.");
    process.exit(1);
  } else {
    console.log("[metrics] ✅ all consistency checks passed");
  }
}

function renderMarkdownReport(r: MetricsReport): string {
  const lines: string[] = [];
  lines.push("# Tank Wallet — KPI Report");
  lines.push("");
  lines.push(`> Auto-generated by \`bun run metrics\`. Do not edit manually.`);
  lines.push(`> Dashboard must consume \`reports/metrics.json\` — never hardcoded values.`);
  lines.push("");
  lines.push(`- **Generated at**: ${r.generatedAt}`);
  lines.push(`- **Commit**: \`${r.commit}\``);
  lines.push(`- **Script version**: ${r.scriptVersion}`);
  lines.push("");

  // Summary table
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Score | Weight | Target | Gap |");
  lines.push("|--------|-------|--------|--------|-----|");
  const targets: Record<string, number> = {
    architecture: 100,
    engineering: 95,
    security: 95,
    assurance: 100,
    evidence: 95,
    operations: 90,
    release: 100,
    confidence: 100,
  };
  for (const [key, m] of Object.entries(r.metrics)) {
    const target = targets[key] ?? 100;
    const gap = Math.max(0, target - m.score);
    lines.push(
      `| ${m.name} | ${m.score}% | ${(m.weight * 100).toFixed(0)}% | ${target}% | ${gap > 0 ? `-${gap}%` : "✓"} |`
    );
  }
  lines.push("");

  // Overall
  lines.push("## Overall Confidence");
  lines.push("");
  lines.push("```");
  lines.push(r.metrics.confidence.formula);
  lines.push("```");
  lines.push("");

  // Inconsistencies
  if (r.inconsistencies.length > 0) {
    lines.push("## ⚠ Inconsistencies");
    lines.push("");
    for (const i of r.inconsistencies) {
      lines.push(`- ${i}`);
    }
    lines.push("");
  } else {
    lines.push("## ✅ Consistency Checks");
    lines.push("");
    lines.push("All consistency rules passed (weight sum, score bounds, recomputation, audit cap).");
    lines.push("");
  }

  // Per-metric detail
  for (const m of Object.values(r.metrics)) {
    if (m.name === "Overall Confidence") continue;
    lines.push(renderMetricMarkdown(m));
  }

  lines.push("---");
  lines.push("");
  lines.push("> KPIs are indicators, not proofs. Real assurance requires external audit + bug bounty + production operation.");
  lines.push("");

  return lines.join("\n");
}

main();
