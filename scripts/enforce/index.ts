#!/usr/bin/env bun
import { EnforcementResult } from "./_shared";
import { enforceErrorCatalog } from "./check-error-catalog";
import { enforceFrozenIds } from "./check-frozen-ids";
import { enforceApiStability } from "./check-api-stability";
import { enforceChangeControl } from "./check-change-control";
function main(): void {
  const results: EnforcementResult[] = [enforceErrorCatalog(), enforceFrozenIds(), enforceApiStability(), enforceChangeControl()];
  let blockers = 0, warnings = 0;
  for (const r of results) {
    const b = r.findings.filter(f => f.severity === "blocker").length;
    const w = r.findings.filter(f => f.severity === "warning").length;
    blockers += b; warnings += w;
    console.log(`${r.passed ? "✅" : b > 0 ? "❌" : "⚠"} ${r.rule}: ${r.summary}`);
  }
  console.log(`\nTotal: ${blockers} blocker(s), ${warnings} warning(s)`);
  if (blockers > 0) { console.error("❌ BLOCKED"); process.exit(1); } else { console.log("✅ no blockers"); }
}
main();
