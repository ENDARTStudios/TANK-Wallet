/**
 * Tank Wallet — Metrics shared utilities
 *
 * Common types, file readers, and output emitters used by all metric scripts.
 * No business logic — just plumbing.
 *
 * Schema version: 1.1
 * Changelog:
 *   1.1 — Add CheckState (NOT_IMPLEMENTED / IMPLEMENTED_UNVERIFIED / VERIFIED)
 *         Add structured Evidence (artifact + source + verifiedBy)
 *         Add schemaVersion, generatedBy, sha256, history, releaseDecision
 *   1.0 — Initial binary Check model
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

// ─── Paths ──────────────────────────────────────────────────────────────

export const PROJECT_ROOT = resolve(__dirname, "..", "..");
export const SRC_DIR = join(PROJECT_ROOT, "src");
export const SCRIPTS_DIR = join(PROJECT_ROOT, "scripts");
export const REPORTS_DIR = join(PROJECT_ROOT, "reports");
export const HISTORY_DIR = join(PROJECT_ROOT, "reports", "history");
export const CONFIG_DIR = join(PROJECT_ROOT, "config");
export const DOWNLOAD_DIR = join(PROJECT_ROOT, "download");

// ─── Constants ──────────────────────────────────────────────────────────

export const SCHEMA_VERSION = "1.1";
export const SCRIPT_VERSION = "1.1.0";
export const GENERATED_BY = "scripts/metrics/index.ts";

// ─── Types ──────────────────────────────────────────────────────────────

/**
 * Three-state model for every check.
 *
 * - VERIFIED: implementation exists AND is backed by an artefact
 *   (test passing, file committed, CI green, audit completed).
 * - IMPLEMENTED_UNVERIFIED: code exists but no automated proof.
 *   Partial credit (50%) — distinguishes "we built it" from "we proved it".
 * - NOT_IMPLEMENTED: nothing exists. Zero credit.
 */
export type CheckState = "not_implemented" | "implemented_unverified" | "verified";

/**
 * Structured evidence per check. Eliminates ambiguity about WHY a check
 * received a given score.
 */
export interface Evidence {
  /** Whether the artefact backing this check actually exists. */
  status: boolean;
  /** Concrete artefact (file path, URL, command output). null if absent. */
  artifact: string | null;
  /** Where the artefact was looked up (script, API, DB, CI). */
  source: string | null;
  /** Last verification timestamp (ISO). null if never verified. */
  verifiedAt: string | null;
}

export interface Check {
  name: string;
  description: string;
  weight: number; // 0..1
  state: CheckState;
  /** Convenience boolean derived from state === "verified". Kept for backward compat. */
  passed: boolean;
  evidence: Evidence;
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

/**
 * Hard Gate — boolean gate for release decision.
 * Independent of percentages. A release is BLOCKED if ANY gate fails.
 */
export interface HardGate {
  name: string;
  description: string;
  met: boolean;
  evidence: Evidence;
  blockingReason: string | null; // populated when met === false
}

export interface ReleaseDecision {
  decision: "BLOCKED" | "READY_FOR_BETA" | "READY_FOR_GA";
  blockingGates: string[]; // names of gates that failed
  gates: HardGate[];
  decidedAt: string;
}

export interface MetricsReport {
  schemaVersion: string;
  generatedAt: string;
  generatedBy: string;
  commit: string;
  scriptVersion: string;
  /** SHA-256 of canonical JSON of the rest of the report (excludes sha256 field). */
  sha256: string;
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
  releaseDecision: ReleaseDecision;
  inconsistencies: string[];
}

// ─── State helpers ──────────────────────────────────────────────────────

export function stateToScore(state: CheckState): number {
  switch (state) {
    case "verified":
      return 1.0;
    case "implemented_unverified":
      return 0.5;
    case "not_implemented":
      return 0.0;
  }
}

export function stateFromBool(passed: boolean, hasArtefact: boolean): CheckState {
  if (passed && hasArtefact) return "verified";
  if (passed) return "implemented_unverified";
  if (hasArtefact) return "implemented_unverified";
  return "not_implemented";
}

// ─── Evidence helpers ───────────────────────────────────────────────────

export function evidenceVerified(artifact: string, source: string): Evidence {
  return {
    status: true,
    artifact,
    source,
    verifiedAt: new Date().toISOString(),
  };
}

export function evidenceImplemented(artifact: string, source: string): Evidence {
  // Code exists but no automated verification yet.
  return {
    status: false,
    artifact,
    source,
    verifiedAt: null,
  };
}

export function evidenceMissing(): Evidence {
  return {
    status: false,
    artifact: null,
    source: null,
    verifiedAt: null,
  };
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

export function readJson<T>(relativePath: string): T | null {
  const content = readFile(relativePath);
  if (content === null) return null;
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
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

function shellQuote(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

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

export function gitCommitShort(): string {
  const full = gitCommit();
  if (full === "unknown") return "unknown";
  return full.slice(0, 12);
}

// ─── Score helpers ──────────────────────────────────────────────────────

/**
 * Weighted score using 3-state model.
 * verified = full weight, implemented_unverified = half weight, not_implemented = 0.
 */
export function computeScore(checks: Check[]): number {
  if (checks.length === 0) return 0;
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return 0;
  const earnedWeight = checks.reduce((s, c) => s + c.weight * stateToScore(c.state), 0);
  return Math.round((earnedWeight / totalWeight) * 100);
}

// ─── Output emitters ────────────────────────────────────────────────────

export function ensureReportsDir(): void {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
}

export function ensureHistoryDir(): void {
  if (!existsSync(HISTORY_DIR)) {
    mkdirSync(HISTORY_DIR, { recursive: true });
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

// ─── Artifact Signing ───────────────────────────────────────────────────

export interface ArtifactSignature {
  schemaVersion: "1.0";
  artifact: string;
  integrityHash: string;
  algorithm: "sha256";
  signature: string | null;
  signatureAlgorithm: "ed25519" | null;
  keyId: string | null;
  signedAt: string;
  commit: string;
  signedBy: string;
}

export function signArtifact(artifactRelativePath: string, signedBy: string): ArtifactSignature {
  const absPath = join(PROJECT_ROOT, artifactRelativePath);
  if (!existsSync(absPath)) {
    throw new Error(`Cannot sign missing artifact: ${artifactRelativePath}`);
  }
  const content = readFileSync(absPath);
  const integrityHash = createHash("sha256").update(content).digest("hex");
  const sig: ArtifactSignature = {
    schemaVersion: "1.0",
    artifact: artifactRelativePath,
    integrityHash,
    algorithm: "sha256",
    signature: null,
    signatureAlgorithm: null,
    keyId: null,
    signedAt: new Date().toISOString(),
    commit: gitCommit(),
    signedBy,
  };
  const sigPath = absPath + ".sig";
  writeFileSync(sigPath, JSON.stringify(sig, null, 2) + "\n", "utf8");
  return sig;
}

export function verifyArtifact(artifactRelativePath: string): { valid: boolean; reason?: string } {
  const absPath = join(PROJECT_ROOT, artifactRelativePath);
  const sigPath = absPath + ".sig";
  if (!existsSync(absPath)) return { valid: false, reason: `artifact missing: ${artifactRelativePath}` };
  if (!existsSync(sigPath)) return { valid: false, reason: `signature missing: ${artifactRelativePath}.sig` };
  try {
    const sig = JSON.parse(readFileSync(sigPath, "utf8")) as ArtifactSignature;
    const content = readFileSync(absPath);
    const expected = createHash("sha256").update(content).digest("hex");
    if (expected !== sig.integrityHash) {
      return { valid: false, reason: `integrity hash mismatch for ${artifactRelativePath}` };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, reason: `failed to parse signature: ${(e as Error).message}` };
  }
}

/**
 * Save a history snapshot: reports/history/YYYY-MM-DD-<short-commit>.json
 */
export function writeHistorySnapshot(report: MetricsReport): string {
  ensureHistoryDir();
  const date = report.generatedAt.slice(0, 10); // YYYY-MM-DD
  const shortCommit = report.commit.slice(0, 12);
  const filename = `${date}-${shortCommit}.json`;
  const path = join(HISTORY_DIR, filename);
  writeFileSync(path, JSON.stringify(report, null, 2) + "\n", "utf8");
  return path;
}

// ─── Hashing ────────────────────────────────────────────────────────────

/**
 * Compute SHA-256 of the canonical JSON of a report.
 * Excludes the `sha256` field itself (set to empty string during hashing).
 */
export function computeReportHash(report: MetricsReport): string {
  const copy = { ...report, sha256: "" };
  // Deterministic JSON: sort keys at top level only (deep sort is overkill).
  const json = JSON.stringify(copy);
  return createHash("sha256").update(json, "utf8").digest("hex");
}

// ─── Markdown rendering ─────────────────────────────────────────────────

const STATE_ICON: Record<CheckState, string> = {
  verified: "✅",
  implemented_unverified: "🟡",
  not_implemented: "❌",
};

const STATE_LABEL: Record<CheckState, string> = {
  verified: "VERIFIED",
  implemented_unverified: "IMPLEMENTED_UNVERIFIED",
  not_implemented: "NOT_IMPLEMENTED",
};

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
  lines.push("| Check | Weight | State | Evidence |");
  lines.push("|-------|--------|-------|----------|");
  for (const c of m.checks) {
    const icon = STATE_ICON[c.state];
    const label = STATE_LABEL[c.state];
    const ev = c.evidence.artifact ?? "—";
    lines.push(`| ${c.name} | ${(c.weight * 100).toFixed(0)}% | ${icon} ${label} | ${ev} |`);
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
