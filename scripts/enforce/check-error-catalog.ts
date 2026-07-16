import { EnforcementResult, Finding, rg, SRC_DIR } from "./_shared";
export function enforceErrorCatalog(): EnforcementResult {
  const findings: Finding[] = [];
  const isTest = (f: string) => f.includes(".test.") || f.includes(".spec.") || f.includes("/__tests__/") || f.includes(".mock.");
  const isVendor = (f: string) => f.includes("/components/ui/");
  const isObservability = (f: string) => f.includes("/observability/");
  const matches = rg("throw new Error\\(", [SRC_DIR]).filter(m => !isTest(m.file) && !isVendor(m.file));
  for (const m of matches) findings.push({ rule: "no throw new Error()", severity: "blocker", file: m.file, line: m.line, message: `Use TankError instead: ${m.content.trim().slice(0,80)}` });
  const consoleMatches = rg("console\\.(log|error|warn|info|debug)", [SRC_DIR]).filter(m => !isTest(m.file) && !isVendor(m.file) && !isObservability(m.file));
  for (const m of consoleMatches) findings.push({ rule: "no console.*", severity: "blocker", file: m.file, line: m.line, message: `Use logger` });
  const anyMatches = rg(": any\\b|as any\\b", [SRC_DIR]).filter(m => !isTest(m.file) && !isVendor(m.file));
  for (const m of anyMatches) findings.push({ rule: "no explicit any", severity: "blocker", file: m.file, line: m.line, message: `Replace any` });
  return { rule: "ERROR-CATALOG", description: "Typed errors + structured logging", passed: findings.length === 0, findings, summary: findings.length === 0 ? "All clean" : `${findings.length} violations` };
}
