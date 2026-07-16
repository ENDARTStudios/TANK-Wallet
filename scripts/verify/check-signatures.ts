import { verifyArtifact, PROJECT_ROOT } from "../metrics/_shared";
const ARTIFACTS = ["reports/metrics.json", "reports/code-audit.md"];
function main(): void {
  let allValid = true;
  for (const a of ARTIFACTS) {
    const r = verifyArtifact(a);
    if (r.valid) console.log(`✅ ${a} — verified`); else { console.error(`❌ ${a} — ${r.reason}`); allValid = false; }
  }
  if (!allValid) process.exit(1);
}
main();
