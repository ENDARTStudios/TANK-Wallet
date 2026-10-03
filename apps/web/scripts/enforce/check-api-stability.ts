import { EnforcementResult, Finding, readFile, rg, SRC_DIR } from "./_shared";
const POLICY_PATH = ".ai/rules/API-STABILITY-POLICY.md";
export function enforceApiStability(): EnforcementResult {
  const findings: Finding[] = [];
  const stableSymbols = parseStableSymbols();
  for (const sym of stableSymbols) { if (rg(`\\b${sym.name}\\b`, [SRC_DIR]).length === 0) findings.push({rule:"missing @stable",severity:"blocker",file:sym.location||"",message:`${sym.name} not found`}); }
  return { rule: "API-STABILITY", description: "@stable symbols present", passed: findings.filter(f=>f.severity==="blocker").length===0, findings, summary: findings.length===0 ? `All ${stableSymbols.length} present` : `${findings.length} findings` };
}
function parseStableSymbols(): Array<{name:string; location:string|null}> {
  const content = readFile(POLICY_PATH); if (!content) return [];
  const symbols: Array<{name:string; location:string|null}> = []; const re = /\|\s*`([A-Z][A-Za-z0-9_]+)`[^|]*\|\s*`?([^|]+?)`?\s*\|/g; let m;
  while ((m = re.exec(content)) !== null) symbols.push({name:m[1], location:m[2].trim()||null});
  return symbols;
}
