#!/usr/bin/env bun
/**
 * Tank Wallet — Metrics Master Runner
 *
 * Usage:  bun run metrics
 *         bun run scripts/metrics/index.ts
 *
 * Reads only real sources (filesystem, git, source code). Never app logic.
 *
 * Output (schema 1.1):
 *   reports/metrics.json          — current snapshot (overwritten each run)
 *   reports/metrics.md            — human-readable
 *   reports/history/<date>-<sha>.json — immutable historical snapshot
 *
 * Schema fields:
 *   - schemaVersion: "1.1"
 *   - generatedBy: "scripts/metrics/index.ts"
 *   - sha256: hash of canonical JSON (excludes sha256 field)
 *   - releaseDecision: BLOCKED | READY_FOR_BETA | READY_FOR_GA + blockingGates[]
 *
 * Exits 1 if any inconsistency detected.
 */

import {
  MetricsReport,
  writeJson,
  writeMarkdown,
  writeHistorySnapshot,
  signArtifact,
  renderMetricMarkdown,
  gitCommit,
  computeReportHash,
  SCHEMA_VERSION,
  SCRIPT_VERSION,
  GENERATED_BY,
} from "./_shared";
import { computeArchitecture } from "./architecture";
import { computeEngineering } from "./engineering";
import { computeSecurity } from "./security";
import { computeAssurance } from "./assurance";
import { computeEvidence } from "./evidence";
import { computeOperations } from "./operations";
import { computeRelease } from "./release";
import { computeConfidence, loadWeights, DEFAULT_WEIGHTS, DEFAULT_SUB_WEIGHTS } from "./confidence";
import { evaluateHardGates } from "./hard-gates";

function main(): void {
  const startedAt = new Date().toISOString();
  const commit = gitCommit();
  console.log(`[metrics] schema ${SCHEMA_VERSION}, script ${SCRIPT_VERSION}`);
  console.log(`[metrics] computing KPIs at ${startedAt}`);
  console.log(`[metrics] commit: ${commit}`);
  console.log("");

  // Load weights from config/kpi-weights.json
  const { config: weightsConfig, warnings: weightWarnings } = loadWeights();
  const weights = weightsConfig?.weights ?? DEFAULT_WEIGHTS;
  const subWeights = weightsConfig?.securitySubWeights ?? DEFAULT_SUB_WEIGHTS;

  if (weightsConfig) {
    console.log(`[metrics] loaded weights from config/kpi-weights.json (v${weightsConfig.version})`);
  } else {
    console.log(`[metrics] using default weights (config not loaded)`);
  }
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
  const confidence = computeConfidence(
    { architecture, engineering, security, assurance, evidence, operations, release },
    weights,
    subWeights
  );

  // Evaluate Hard Gates (release decision — boolean, not percentage-based).
  const { gates: hardGates, decision: releaseDecision } = evaluateHardGates();

  // Validate consistency.
  const inconsistencies: string[] = [...weightWarnings];

  // Rule 1: weight sum in confidence must equal 1.0
  const weightSum = confidence.checks.reduce((s, c) => s + c.weight, 0);
  if (Math.abs(weightSum - 1.0) > 0.001) {
    inconsistencies.push(`Confidence weight sum = ${weightSum.toFixed(4)}, expected 1.0000`);
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
  const securityAvg =
    security.score * subWeights.readiness + assurance.score * subWeights.assurance;
  const rawConfidence =
    architecture.score * weights.architecture +
    engineering.score * weights.engineering +
    securityAvg * weights.security +
    evidence.score * weights.evidence +
    operations.score * weights.operations +
    release.score * weights.release;
  if (Math.abs(rawConfidence - confidence.score) > 1) {
    inconsistencies.push(
      `Confidence score (${confidence.score}) != recomputed (${Math.round(rawConfidence)})`
    );
  }

  // Rule 4: Security Readiness is no longer capped at 91% because
  // engines now have integration tests (verified state). Audit engine
  // still has 0% weight until Sprint 5 external audits complete.
  // (Previous cap of 91% was when engines were implemented_unverified.)

  // Rule 5: Assurance without external audit cannot exceed 5%
  if (assurance.score > 5) {
    const auditChecks = assurance.checks.filter((c) =>
      c.name.toLowerCase().includes("audit") || c.name.toLowerCase().includes("pentest")
    );
    const anyAuditVerified = auditChecks.some((c) => c.state === "verified");
    if (!anyAuditVerified) {
      inconsistencies.push(
        `Assurance is ${assurance.score}% but no external audit/pentest verified (max should be ~5%)`
      );
    }
  }

  // Rule 6: if releaseDecision is READY_FOR_GA, all hard gates must be met
  if (releaseDecision.decision === "READY_FOR_GA" && releaseDecision.blockingGates.length > 0) {
    inconsistencies.push(
      `Release decision is READY_FOR_GA but ${releaseDecision.blockingGates.length} gates not met`
    );
  }

  // Build report
  const report: MetricsReport = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: startedAt,
    generatedBy: GENERATED_BY,
    commit,
    scriptVersion: SCRIPT_VERSION,
    sha256: "", // placeholder, computed below
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
    releaseDecision,
    inconsistencies,
  };

  // Compute SHA-256 of the report (excluding the sha256 field itself)
  report.sha256 = computeReportHash(report);

  // Write current snapshot (overwrites)
  writeJson("metrics.json", report);
  console.log(`[metrics] wrote reports/metrics.json`);

  // Write Markdown
  const md = renderMarkdownReport(report);
  writeMarkdown("metrics.md", md);
  console.log(`[metrics] wrote reports/metrics.md`);

  // Write history snapshot (immutable, per commit)
  const historyPath = writeHistorySnapshot(report);
  console.log(`[metrics] wrote history snapshot ${historyPath}`);

  // Sign the metrics.json artifact
  try {
    signArtifact("reports/metrics.json", "scripts/metrics/index.ts");
    console.log(`[metrics] wrote reports/metrics.json.sig`);
  } catch (e) {
    console.log(`[metrics] ⚠ could not sign: ${(e as Error).message}`);
  }
  console.log("");

  // Console summary
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  TANK WALLET — KPI SUMMARY (schema ${SCHEMA_VERSION})`);
  console.log("════════════════════════════════════════════════════════════");
  console.log(`  Generated: ${startedAt}`);
  console.log(`  Commit:    ${commit.slice(0, 12)}`);
  console.log(`  SHA-256:   ${report.sha256.slice(0, 16)}...`);
  console.log("");
  console.log(`  Architecture Compliance : ${architecture.score}%`);
  console.log(`  Engineering Readiness   : ${engineering.score}%`);
  console.log(`  Security Readiness      : ${security.score}%`);
  console.log(`  Security Assurance      : ${assurance.score}%  (max ~5% pre-audit)`);
  console.log(`  Security Evidence       : ${evidence.score}%`);
  console.log(`  Operational Readiness   : ${operations.score}%`);
  console.log(`  Release Readiness       : ${release.score}%`);
  console.log("");
  console.log(`  ▶ OVERALL CONFIDENCE    : ${confidence.score}%`);
  console.log("");
  console.log(`  ▶ RELEASE DECISION      : ${releaseDecision.decision}`);
  if (releaseDecision.blockingGates.length > 0) {
    console.log(`    Blocking gates (${releaseDecision.blockingGates.length}):`);
    for (const g of releaseDecision.blockingGates) {
      console.log(`      ❌ ${g}`);
    }
  } else {
    console.log(`    ✅ all ${releaseDecision.gates.length} hard gates met`);
  }
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
  lines.push(`> History: \`reports/history/<date>-<commit>.json\``);
  lines.push("");
  lines.push(`- **Schema version**: ${r.schemaVersion}`);
  lines.push(`- **Generated at**: ${r.generatedAt}`);
  lines.push(`- **Generated by**: \`${r.generatedBy}\``);
  lines.push(`- **Commit**: \`${r.commit}\``);
  lines.push(`- **Script version**: ${r.scriptVersion}`);
  lines.push(`- **SHA-256**: \`${r.sha256}\``);
  lines.push("");

  // Summary table
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Score | Weight | Target | State Summary |");
  lines.push("|--------|-------|--------|--------|---------------|");
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
    const verified = m.checks.filter((c) => c.state === "verified").length;
    const impl = m.checks.filter((c) => c.state === "implemented_unverified").length;
    const notImpl = m.checks.filter((c) => c.state === "not_implemented").length;
    const summary = `✅${verified} 🟡${impl} ❌${notImpl}`;
    lines.push(`| ${m.name} | ${m.score}% | ${(m.weight * 100).toFixed(0)}% | ${target}% | ${summary} |`);
  }
  lines.push("");

  // Release decision
  lines.push("## Release Decision");
  lines.push("");
  lines.push(`**Decision**: \`${r.releaseDecision.decision}\``);
  lines.push("");
  if (r.releaseDecision.blockingGates.length > 0) {
    lines.push("### Blocking Gates");
    lines.push("");
    for (const g of r.releaseDecision.gates.filter((g) => !g.met)) {
      lines.push(`- ❌ **${g.name}** — ${g.blockingReason ?? "not met"}`);
    }
    lines.push("");
  } else {
    lines.push("✅ All hard gates met.");
    lines.push("");
  }
  lines.push("### All Hard Gates");
  lines.push("");
  lines.push("| Gate | Met | Evidence |");
  lines.push("|------|-----|----------|");
  for (const g of r.releaseDecision.gates) {
    const icon = g.met ? "✅" : "❌";
    const ev = g.evidence.artifact ?? "—";
    lines.push(`| ${g.name} | ${icon} | ${ev} |`);
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
    lines.push("All consistency rules passed (weight sum, score bounds, recomputation, audit cap, gate-decision coherence).");
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
  lines.push(`> Verify integrity: recompute SHA-256 of canonical JSON (excluding \`sha256\` field) and compare to \`${r.sha256}\`.`);
  lines.push("");

  return lines.join("\n");
}

main();
