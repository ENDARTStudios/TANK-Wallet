#!/usr/bin/env bun
/**
 * Tank Wallet — Code Audit
 *
 * Runs ripgrep searches for technical debt and produces:
 *   reports/code-audit.md
 *
 * Searches:
 *   - TODO / FIXME / XXX / HACK
 *   - console.log / console.error / console.warn (in production paths)
 *   - explicit `any` type
 *   - @ts-ignore / @ts-expect-error
 *   - mock implementations in production paths
 *   - `throw new Error(...)` (should use typed TankError instead)
 *
 * Each finding: file, line, category, severity, suggested sprint.
 *
 * Nothing is hidden. Everything is enumerated.
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { signArtifact } from "../metrics/_shared";

const PROJECT_ROOT = resolve(__dirname, "..", "..");
const REPORTS_DIR = join(PROJECT_ROOT, "reports");
const SRC_DIR = "src";

interface Finding {
  file: string;
  line: number;
  content: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  sprint: string;
  rationale: string;
}

function shellQuote(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

function rg(pattern: string, extraArgs: string[] = []): Array<{ file: string; line: number; content: string }> {
  try {
    const args = ["rg", "-n", "--no-heading", shellQuote(pattern), SRC_DIR, ...extraArgs].join(" ");
    const out = execSync(args + " 2>/dev/null || true", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      maxBuffer: 100 * 1024 * 1024,
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

function isTest(file: string): boolean {
  return file.includes(".test.") || file.includes(".spec.") || file.includes("/__tests__/") || file.includes(".mock.");
}

function main(): void {
  console.log("[audit] scanning src/ for technical debt...");
  const findings: Finding[] = [];

  // 1. TODO / FIXME / XXX / HACK
  const codeSmells = rg("TODO|FIXME|XXX|HACK");
  for (const f of codeSmells) {
    findings.push({
      ...f,
      category: "Code Smell (TODO/FIXME/XXX/HACK)",
      severity: "medium",
      sprint: "Sprint 4",
      rationale: "Provisional markers must be eliminated before v1.0. Each one becomes an issue.",
    });
  }

  // 2. console.log / console.error / console.warn in production paths
  const consoleUsage = rg("console\\.(log|error|warn|info|debug)").filter((f) => !isTest(f.file));
  for (const f of consoleUsage) {
    findings.push({
      ...f,
      category: "Logging (console.* in production)",
      severity: "high",
      sprint: "Sprint 4",
      rationale: "Must use structured logger (Pino) per ENGINEERING-STANDARDS.md §6. Leaks unstructured data, no traceId, no sanitization.",
    });
  }

  // 3. Explicit `any`
  const anyType = rg(": any\\b|as any\\b").filter((f) => !isTest(f.file));
  for (const f of anyType) {
    findings.push({
      ...f,
      category: "Type Safety (explicit any)",
      severity: "high",
      sprint: "Sprint 4",
      rationale: "Breaks type safety. Replace with proper types or generics.",
    });
  }

  // 4. @ts-ignore / @ts-expect-error
  const tsIgnore = rg("@ts-ignore|@ts-expect-error");
  for (const f of tsIgnore) {
    findings.push({
      ...f,
      category: "Type Safety (ts-ignore/ts-expect-error)",
      severity: "medium",
      sprint: "Sprint 4",
      rationale: "Suppresses type errors. Must be removed or justified with linked issue.",
    });
  }

  // 5. mock in production paths
  const mocks = rg("\\bmock\\b|\\bMock\\b").filter((f) => !isTest(f.file) && !f.file.includes(".mock."));
  for (const f of mocks) {
    findings.push({
      ...f,
      category: "Test Infrastructure (mock in production path)",
      severity: "high",
      sprint: "Sprint 4",
      rationale: "Mock code must not exist outside test files. Indicates incomplete real implementation.",
    });
  }

  // 6. `throw new Error(...)` — should be typed TankError
  const throwErrors = rg("throw new Error\\(").filter((f) => !isTest(f.file));
  for (const f of throwErrors) {
    findings.push({
      ...f,
      category: "Error Handling (untyped Error)",
      severity: "medium",
      sprint: "Sprint 4",
      rationale: "Use typed TankError subclass per ENGINEERING-STANDARDS.md §5.",
    });
  }

  // Sort by severity then file:line
  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => {
    if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.line - b.line;
  });

  // Counts by category
  const byCategory = new Map<string, number>();
  for (const f of findings) {
    byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + 1);
  }
  const bySeverity = new Map<string, number>();
  for (const f of findings) {
    bySeverity.set(f.severity, (bySeverity.get(f.severity) ?? 0) + 1);
  }

  // Ensure reports dir
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // Build markdown
  const lines: string[] = [];
  lines.push("# Tank Wallet — Code Audit Report");
  lines.push("");
  lines.push(`> Auto-generated by \`bun run audit:code\`. Do not edit manually.`);
  lines.push(`> Generated at: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total findings**: ${findings.length}`);
  lines.push("");
  lines.push("### By Severity");
  lines.push("");
  lines.push("| Severity | Count |");
  lines.push("|----------|-------|");
  for (const sev of ["critical", "high", "medium", "low"]) {
    lines.push(`| ${sev} | ${bySeverity.get(sev) ?? 0} |`);
  }
  lines.push("");
  lines.push("### By Category");
  lines.push("");
  lines.push("| Category | Count |");
  lines.push("|----------|-------|");
  for (const [cat, count] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${cat} | ${count} |`);
  }
  lines.push("");

  // Findings table
  lines.push("## Findings");
  lines.push("");
  lines.push("| # | Severity | File | Line | Category | Sprint | Content |");
  lines.push("|---|----------|------|------|----------|--------|---------|");
  findings.forEach((f, i) => {
    const content = f.content.replace(/\|/g, "\\|").slice(0, 100);
    lines.push(`| ${i + 1} | ${f.severity} | \`${f.file}\` | ${f.line} | ${f.category} | ${f.sprint} | \`${content}\` |`);
  });
  lines.push("");

  // Rationale per category
  lines.push("## Rationale");
  lines.push("");
  const seenCategories = new Set<string>();
  for (const f of findings) {
    if (seenCategories.has(f.category)) continue;
    seenCategories.add(f.category);
    lines.push(`### ${f.category}`);
    lines.push("");
    lines.push(`- **Severity**: ${f.severity}`);
    lines.push(`- **Target sprint**: ${f.sprint}`);
    lines.push(`- **Why fix**: ${f.rationale}`);
    lines.push("");
  }

  // Action plan
  lines.push("## Action Plan");
  lines.push("");
  lines.push("1. **Sprint 4 (current)**: Eliminate all `console.*` calls by introducing structured logger (`src/lib/observability/logger.ts`).");
  lines.push("2. **Sprint 4**: Replace all explicit `any` with proper types. Enable `noImplicitAny: true` in tsconfig.");
  lines.push("3. **Sprint 4**: Convert each `TODO/FIXME/XXX/HACK` into a tracked issue. Remove the marker from code.");
  lines.push("4. **Sprint 4**: Move any mock code to `*.mock.ts` files or `__tests__/` directories.");
  lines.push("5. **Sprint 4**: Replace `throw new Error(...)` with typed `TankError` subclasses.");
  lines.push("6. **Sprint 4**: Remove or justify every `@ts-ignore` / `@ts-expect-error`.");
  lines.push("");
  lines.push("After Sprint 4, re-run `bun run audit:code` — expected output: **0 findings**.");
  lines.push("");

  writeFileSync(join(REPORTS_DIR, "code-audit.md"), lines.join("\n") + "\n", "utf8");
  console.log(`[audit] wrote reports/code-audit.md`);

  // Sign the code-audit.md artifact
  try {
    signArtifact("reports/code-audit.md", "scripts/audit/code-audit.ts");
    console.log(`[audit] wrote reports/code-audit.md.sig`);
  } catch (e) {
    console.log(`[audit] ⚠ could not sign: ${(e as Error).message}`);
  }

  console.log(`[audit] ${findings.length} findings (${bySeverity.get("critical") ?? 0} critical, ${bySeverity.get("high") ?? 0} high, ${bySeverity.get("medium") ?? 0} medium, ${bySeverity.get("low") ?? 0} low)`);
}

main();
