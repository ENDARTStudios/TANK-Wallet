/**
 * Tank Wallet — Metrics shared utilities
 *
 * Common types, file readers, and output emitters used by all metric scripts.
 * No business logic — just plumbing.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { execSync } from "node:child_process";

// ─── Paths ──────────────────────────────────────────────────────────────

export const PROJECT_ROOT = resolve(__dirname, "..", "..");
export const SRC_DIR = join(PROJECT_ROOT, "src");
export const SCRIPTS_DIR = join(PROJECT_ROOT, "scripts");
export const REPORTS_DIR = join(PROJECT_ROOT, "reports");
export const DOWNLOAD_DIR = join(PROJECT_ROOT, "download");

// ─── Types ──────────────────────────────────────────────────────────────

export interface Check {
  name: string;
  description: string;
  weight: number; // 0..1
  passed: boolean;
  evidence: string; // concrete proof (file path, command, value)
  notes?: string;
}

export interface MetricResult {
  name: string;
  description: string;
  score: number; // 0..100
  weight: number; // for composite
  formula: string;
  checks: Check[];
  computedAt: string; // ISO
  scriptVersion: string;
}

export interface MetricsReport {
  generatedAt: string;
  commit: string;
  scriptVersion: string;
  metrics: {
    architecture: MetricResult;
    engineering: MetricResult;
    security: MetricResult;
    assurance: MetricResult;
    evidence: MetricResult;
    operations: MetricResult;
    release: MetricResult;
    confidence: MetricResult;
  };
  inconsistencies: string[];
}

// ─── File readers ───────────────────────────────────────────────────────

export function fileExists(relativePath: string): boolean {
  return existsSync(join(PROJECT_ROOT, relativePath));
}

export function readFile(relativePath: string): string | null {
  const abs = join(PROJECT_ROOT, relativePath);
  if (!existsSync(abs)) return null;
  return readFileSync(abs, "utf8");
}

export function listDir(relativePath: string): string[] {
  const abs = join(PROJECT_ROOT, relativePath);
  if (!existsSync(abs)) return [];
  return readdirSync(abs);
}

export function dirExists(relativePath: string): boolean {
  const abs = join(PROJECT_ROOT, relativePath);
  return existsSync(abs) && statSync(abs).isDirectory();
}

// ─── Search helpers ─────────────────────────────────────────────────────

/**
 * Shell-escape a string so it survives execSync.
 */
function shellQuote(s: string): string {
  // Use single quotes; escape any embedded single quote.
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

/**
 * Run ripgrep and return count of matches.
 * Returns 0 if no matches or rg unavailable.
 */
export function rgCount(pattern: string, paths: string[], extraArgs: string[] = []): number {
  try {
    const args = ["rg", "-c", shellQuote(pattern), ...paths.map(shellQuote), ...extraArgs.map(shellQuote)].join(" ");
    const out = execSync(args + " 2>/dev/null || true", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    });
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .reduce((sum, line) => {
        const parts = line.split(":");
        const n = parseInt(parts[parts.length - 1], 10);
        return sum + (isNaN(n) ? 0 : n);
      }, 0);
  } catch {
    return 0;
  }
}

/**
 * Run ripgrep and return list of matches with file:line:content.
 */
export function rgList(
  pattern: string,
  paths: string[],
  extraArgs: string[] = []
): Array<{ file: string; line: number; content: string }> {
  try {
    const args = ["rg", "-n", "--no-heading", shellQuote(pattern), ...paths.map(shellQuote), ...extraArgs.map(shellQuote)].join(" ");
    const out = execSync(args + " 2>/dev/null || true", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      maxBuffer: 50 * 1024 * 1024,
    });
    return out
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const m = line.match(/^([^:]+):(\d+):(.*)$/);
        if (!m) return null;
        return { file: m[1], line: parseInt(m[2], 10), content: m[3] };
      })
      .filter((x): x is { file: string; line: number; content: string } => x !== null);
  } catch {
    return [];
  }
}

// ─── Git ────────────────────────────────────────────────────────────────

export function gitCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: PROJECT_ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

// ─── Score helpers ──────────────────────────────────────────────────────

export function computeScore(checks: Check[]): number {
  if (checks.length === 0) return 0;
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return 0;
  const passedWeight = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  return Math.round((passedWeight / totalWeight) * 100);
}

// ─── Output emitters ────────────────────────────────────────────────────

export function ensureReportsDir(): void {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

export function writeJson(filename: string, data: unknown): void {
  ensureReportsDir();
  const path = join(REPORTS_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function writeMarkdown(filename: string, content: string): void {
  ensureReportsDir();
  const path = join(REPORTS_DIR, filename);
  writeFileSync(path, content, "utf8");
}

// ─── Markdown rendering ─────────────────────────────────────────────────

export function renderMetricMarkdown(m: MetricResult): string {
  const lines: string[] = [];
  lines.push(`## ${m.name}`);
  lines.push("");
  lines.push(`- **Score**: ${m.score}%`);
  lines.push(`- **Weight in Overall Confidence**: ${(m.weight * 100).toFixed(0)}%`);
  lines.push(`- **Formula**: \`${m.formula}\``);
  lines.push(`- **Computed at**: ${m.computedAt}`);
  lines.push(`- **Script version**: ${m.scriptVersion}`);
  lines.push("");
  lines.push("### Checks");
  lines.push("");
  lines.push("| Check | Weight | Passed | Evidence |");
  lines.push("|-------|--------|--------|----------|");
  for (const c of m.checks) {
    const passed = c.passed ? "✅" : "❌";
    lines.push(`| ${c.name} | ${(c.weight * 100).toFixed(0)}% | ${passed} | ${c.evidence} |`);
  }
  lines.push("");
  if (m.checks.some((c) => c.notes)) {
    lines.push("### Notes");
    lines.push("");
    for (const c of m.checks) {
      if (c.notes) {
        lines.push(`- **${c.name}**: ${c.notes}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}

// ─── Versioning ─────────────────────────────────────────────────────────

export const SCRIPT_VERSION = "1.0.0";
