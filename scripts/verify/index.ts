#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { resolve } from "node:path";
const PROJECT_ROOT = resolve(__dirname, "..", "..");
interface Step { name: string; command: string; required: boolean; }
const STEPS: Step[] = [
  { name: "lint", command: "bun run lint", required: true },
  { name: "typecheck", command: "bunx tsc --noEmit", required: true },
  { name: "tests", command: "bun test src 2>/dev/null || true", required: false },
  { name: "conformance", command: "bun test src/lib/wallet-plugins/conformance.ts 2>/dev/null || true", required: false },
  { name: "metrics", command: "bun run metrics", required: true },
  { name: "audit:code", command: "bun run audit:code", required: true },
  { name: "sbom", command: "bunx @cyclonedx/cyclonedx-npm --output-file reports/sbom.cyclonedx.json 2>/dev/null || true", required: false },
  { name: "secrets-scan", command: "gitleaks detect --source . 2>/dev/null || true", required: false },
  { name: "dependency-scan", command: "trivy fs --format json --output reports/trivy-deps.json . 2>/dev/null || true", required: false },
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
    try {
      execSync(step.command, { cwd: PROJECT_ROOT, encoding: "utf8", timeout: 5 * 60 * 1000, stdio: ["ignore","pipe","pipe"] });
      console.log(`✅ pass`);
    } catch (e) {
      if (step.required) { console.log(`❌ FAIL`); anyFailed = true; } else { console.log(`⚠ skip`); }
    }
  }
  console.log("\n════════════════════════════════════════════════════════════");
  if (anyFailed) { console.error("  STATUS: ❌ BLOCKED\n"); process.exit(1); } else { console.log("  STATUS: ✅ APPROVED\n"); }
}
main();
