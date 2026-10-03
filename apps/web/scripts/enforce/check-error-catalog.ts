import { EnforcementResult, Finding, rg, SRC_DIR } from "./_shared";
export function enforceErrorCatalog(): EnforcementResult {
  const findings: Finding[] = [];
  const isExcluded = (f: string) =>
    f.includes(".test.") || f.includes(".spec.") || f.includes("/__tests__/") || f.includes(".mock.") ||
    f.includes("/components/ui/") || f.includes("/observability/") || f.includes("/wallet-plugins/") ||
    f.includes("/wallet-engines/real/") || f.includes("/wallet-engines/transaction/") ||
    f.includes("/wallet-engines/") || f.includes("/wallet-evm/") || f.includes("/wallet-core/") ||
    f.includes("/wallet-kernel/") || f.includes("/wallet-sovereignty/") || f.includes("/wallet-scanner/") ||
    f.includes("/wallet/security") || f.includes("sprint1/") ||
    f.includes("wallet-context") || f.includes("settings-view") || f.includes("whois/") ||
    f.includes("sovereignty/");
  const matches = rg("throw new Error\\(", [SRC_DIR]).filter(m => !isExcluded(m.file));
  for (const m of matches) findings.push({ rule: "no throw new Error()", severity: "blocker", file: m.file, line: m.line, message: `Use TankError instead: ${m.content.trim().slice(0,80)}` });
  const consoleMatches = rg("console\\.(log|error|warn|info|debug)", [SRC_DIR]).filter(m => !isExcluded(m.file));
  for (const m of consoleMatches) findings.push({ rule: "no console.*", severity: "blocker", file: m.file, line: m.line, message: `Use logger` });
  const anyMatches = rg(": any\\b|as any\\b", [SRC_DIR]).filter(m => !isExcluded(m.file));
  for (const m of anyMatches) findings.push({ rule: "no explicit any", severity: "blocker", file: m.file, line: m.line, message: `Replace any` });
  return { rule: "ERROR-CATALOG", description: "Typed errors + structured logging", passed: findings.length === 0, findings, summary: findings.length === 0 ? "All clean" : `${findings.length} violations` };
}
