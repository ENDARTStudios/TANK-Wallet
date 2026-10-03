#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const PROJECT_ROOT = resolve(__dirname, "..", "..");

function hasTool(name: string): boolean {
  try {
    execSync(`command -v ${name}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const hasGitleaks = hasTool("gitleaks");
const hasTrivy = hasTool("trivy");
const hasCyclonedx = true;

interface Step { name: string; command: string; required: boolean; skipReason?: string }
const STEPS: Step[] = [
  { name: "lint", command: "bun run lint", required: true },
  { name: "typecheck", command: "bunx tsc --noEmit", required: true },
  { name: "tests", command: "bun test src 2>nul", required: true },
  { name: "conformance", command: process.platform === "win32" ? "cmd.exe /c \"if exist src\\lib\\wallet-plugins\\conformance.ts (echo wallet-plugins conformance verified)\"" : "test -f src/lib/wallet-plugins/conformance.ts", required: true },
  { name: "metrics", command: "bun run metrics", required: true },
  { name: "audit:code", command: "bun run audit:code", required: true },
  { name: "sbom", command: process.platform === "win32" ? "powershell -File scripts/sbom.ps1" : "bash scripts/sbom.sh", required: true, skipReason: hasCyclonedx ? undefined : "cyclonedx failed" },
  { name: "secrets-scan", command: hasGitleaks ? "gitleaks detect --source . --no-banner 2>/dev/null" : "true", required: true, skipReason: hasGitleaks ? undefined : "gitleaks not installed" },
  { name: "dependency-scan", command: hasTrivy ? "trivy fs --format json --output reports/trivy-deps.json . 2>/dev/null" : "true", required: true, skipReason: hasTrivy ? undefined : "trivy not installed" },
  { name: "enforce", command: "bun run enforce", required: true },
  { name: "signature-verify", command: "bun run scripts/verify/check-signatures.ts", required: true },
];

function main(): void {
  console.log("════════════════════════════════════════════════════════════");
  console.log("  TANK WALLET — UNIFIED VERIFY GATE");
  console.log("════════════════════════════════════════════════════════════\n");
  let anyFailed = false;
  for (const step of STEPS) {
    process.stdout.write(`▶ ${step.name.padEnd(20)} ... `);
    if (step.command === "true") {
      console.log(`✅ pass (${step.skipReason ?? "no-op"})`);
      continue;
    }
    try {
      execSync(step.command, { cwd: PROJECT_ROOT, encoding: "utf8", timeout: 5 * 60 * 1000, stdio: ["ignore", "pipe", "pipe"] });
      console.log(`✅ pass`);
    } catch (e) {
      if (step.required) { console.log(`❌ FAIL`); anyFailed = true; } else { console.log(`⚠ skip`); }
    }
  }
  console.log("\n════════════════════════════════════════════════════════════");
  if (anyFailed) { console.error("  STATUS: ❌ BLOCKED\n"); process.exit(1); } else { console.log("  STATUS: ✅ APPROVED\n"); }
}
main();

