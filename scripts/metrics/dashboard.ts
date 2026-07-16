#!/usr/bin/env bun
/**
 * Generates reports/dashboard.html with visual KPI summary.
 * Run: bun run scripts/metrics/dashboard.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(__dirname, "..", "..");
const REPORTS_DIR = join(PROJECT_ROOT, "reports");

function loadMetrics() {
  const path = join(REPORTS_DIR, "metrics.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadTrends() {
  const path = join(REPORTS_DIR, "trends", "kpi-trends.json");
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  const metrics = loadMetrics();
  if (!metrics) { console.error("No metrics.json found. Run `bun run metrics` first."); process.exit(1); }

  const m = metrics.metrics;
  const rd = metrics.releaseDecision;
  const trends = loadTrends();

  const kpiData = [
    { name: "Architecture", score: m.architecture.score, weight: m.architecture.weight, target: 100, color: m.architecture.score >= 80 ? "#10b981" : m.architecture.score >= 50 ? "#f59e0b" : "#ef4444" },
    { name: "Engineering", score: m.engineering.score, weight: m.engineering.weight, target: 95, color: m.engineering.score >= 80 ? "#10b981" : m.engineering.score >= 50 ? "#f59e0b" : "#ef4444" },
    { name: "Security Readiness", score: m.security.score, weight: m.security.weight, target: 95, color: m.security.score >= 80 ? "#10b981" : m.security.score >= 50 ? "#f59e0b" : "#ef4444" },
    { name: "Security Assurance", score: m.assurance.score, weight: m.assurance.weight, target: 100, color: m.assurance.score >= 80 ? "#10b981" : m.assurance.score >= 50 ? "#f59e0b" : "#ef4444" },
    { name: "Security Evidence", score: m.evidence.score, weight: m.evidence.weight, target: 95, color: m.evidence.score >= 80 ? "#10b981" : m.evidence.score >= 50 ? "#f59e0b" : "#ef4444" },
    { name: "Operations", score: m.operations.score, weight: m.operations.weight, target: 90, color: m.operations.score >= 80 ? "#10b981" : m.operations.score >= 50 ? "#f59e0b" : "#ef4444" },
    { name: "Release", score: m.release.score, weight: m.release.weight, target: 100, color: m.release.score >= 80 ? "#10b981" : m.release.score >= 50 ? "#f59e0b" : "#ef4444" },
  ];

  const confidence = m.confidence.score;
  const decision = rd.decision;

  const barsHtml = kpiData.map(k => `
    <div class="kpi-bar">
      <div class="kpi-label">${k.name} <span class="kpi-weight">(${(k.weight*100).toFixed(0)}%)</span></div>
      <div class="bar-container">
        <div class="bar-fill" style="width: ${k.score}%; background: ${k.color}"></div>
        <span class="bar-value">${k.score}%</span>
      </div>
      <div class="kpi-target">target: ${k.target}%</div>
    </div>
  `).join("");

  const gatesHtml = rd.gates.map(g => `
    <div class="gate ${g.met ? "gate-met" : "gate-fail"}">
      <span class="gate-icon">${g.met ? "✅" : "❌"}</span>
      <span class="gate-name">${g.name}</span>
    </div>
  `).join("");

  const trendsHtml = trends.length > 0 ? `
    <div class="trends">
      <h3>KPI Evolution (${trends.length} snapshots)</h3>
      <table class="trends-table">
        <tr><th>Date</th><th>Commit</th><th>Confidence</th><th>Security</th><th>Engineering</th><th>Release</th><th>Decision</th></tr>
        ${trends.slice(-10).reverse().map(t => `
          <tr>
            <td>${t.date}</td>
            <td>${t.commit?.slice(0,8) ?? "—"}</td>
            <td>${t.scores?.confidence ?? "—"}</td>
            <td>${t.scores?.security ?? "—"}</td>
            <td>${t.scores?.engineering ?? "—"}</td>
            <td>${t.scores?.release ?? "—"}</td>
            <td>${t.releaseDecision ?? "—"}</td>
          </tr>
        `).join("")}
      </table>
    </div>
  ` : "<p>No trend data yet. Run `bun run metrics` multiple times to build history.</p>";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tank Wallet — KPI Dashboard</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 20px; }
  h1 { color: #10b981; font-size: 24px; margin-bottom: 4px; }
  h2 { color: #888; font-size: 14px; font-weight: normal; margin-top: 0; }
  h3 { color: #aaa; font-size: 16px; margin-top: 24px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .confidence-box { text-align: center; padding: 20px; border-radius: 12px; background: ${confidence >= 70 ? "#10b98120" : confidence >= 50 ? "#f59e0b20" : "#ef444420"}; border: 2px solid ${confidence >= 70 ? "#10b981" : confidence >= 50 ? "#f59e0b" : "#ef4444"}; }
  .confidence-value { font-size: 48px; font-weight: bold; color: ${confidence >= 70 ? "#10b981" : confidence >= 50 ? "#f59e0b" : "#ef4444"}; }
  .confidence-label { font-size: 12px; color: #888; text-transform: uppercase; }
  .decision-badge { display: inline-block; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-top: 8px; background: ${decision === "READY_FOR_GA" ? "#10b981" : decision === "READY_FOR_BETA" ? "#f59e0b" : "#ef4444"}; color: #000; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .card { background: #111; border-radius: 8px; padding: 16px; border: 1px solid #222; }
  .kpi-bar { margin-bottom: 12px; }
  .kpi-label { font-size: 13px; margin-bottom: 4px; }
  .kpi-weight { color: #666; font-size: 11px; }
  .bar-container { position: relative; height: 24px; background: #1a1a1a; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
  .bar-value { position: absolute; right: 8px; top: 4px; font-size: 11px; color: #fff; }
  .kpi-target { font-size: 10px; color: #555; margin-top: 2px; }
  .gates { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .gate { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 4px; font-size: 12px; }
  .gate-met { background: #10b98110; }
  .gate-fail { background: #ef444410; }
  .gate-icon { font-size: 14px; }
  .trends-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .trends-table th { text-align: left; padding: 6px; border-bottom: 1px solid #333; color: #888; }
  .trends-table td { padding: 6px; border-bottom: 1px solid #1a1a1a; }
  .footer { margin-top: 24px; font-size: 11px; color: #555; text-align: center; }
  code { background: #1a1a1a; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>TANK Wallet — KPI Dashboard</h1>
      <h2>Generated: ${metrics.generatedAt} · Commit: ${metrics.commit?.slice(0,12)} · SHA-256: ${metrics.sha256?.slice(0,16)}...</h2>
    </div>
    <div class="confidence-box">
      <div class="confidence-value">${confidence}%</div>
      <div class="confidence-label">Overall Confidence</div>
      <div class="decision-badge">${decision}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>KPI Breakdown</h3>
      ${barsHtml}
    </div>
    <div class="card">
      <h3>Release Gates (${rd.gates.filter((g: any) => g.met).length}/${rd.gates.length} met)</h3>
      <div class="gates">${gatesHtml}</div>
    </div>
  </div>

  ${trendsHtml}

  <div class="footer">
    <p>Auto-generated by <code>bun run scripts/metrics/dashboard.ts</code></p>
    <p>Dashboard must consume <code>reports/metrics.json</code> — never hardcoded values.</p>
  </div>
</body>
</html>`;

  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(join(REPORTS_DIR, "dashboard.html"), html, "utf8");
  console.log("[dashboard] wrote reports/dashboard.html");
  console.log(`[dashboard] Overall Confidence: ${confidence}% | Decision: ${decision}`);
}

main();
