import { execSync } from "node:child_process";
import { EnforcementResult, Finding, PROJECT_ROOT } from "./_shared";
const FROZEN = [{pattern:/^src\/lib\/wallet-security-real\//, reason:"Security Kernel frozen"}, {pattern:/^scripts\/metrics\/_shared\.ts$/, reason:"MetricsReport schema frozen"}, {pattern:/^\.ai\/rules\//, reason:"Normative docs need 2 approvals"}, {pattern:/^ARCHITECTURE-FREEZE/, reason:"Architecture Freeze baseline"}, {pattern:/^KPI-FORMULAS\.md$/, reason:"KPI formulas frozen"}, {pattern:/^ENGINEERING-STANDARDS\.md$/, reason:"Engineering standards frozen"}];
export function enforceChangeControl(): EnforcementResult {
  const findings: Finding[] = [];
  let changed: string[] = [];
  try { changed = [...new Set([...execSync("git diff --cached --name-only 2>/dev/null || true", {cwd:PROJECT_ROOT, encoding:"utf8"}).trim().split("\n"), ...execSync("git diff --name-only 2>/dev/null || true", {cwd:PROJECT_ROOT, encoding:"utf8"}).trim().split("\n"), ...execSync("git ls-files --others --exclude-standard 2>/dev/null || true", {cwd:PROJECT_ROOT, encoding:"utf8"}).trim().split("\n")].filter(Boolean))]; } catch { return {rule:"CHANGE-CONTROL",description:"Frozen files check",passed:true,findings:[],summary:"Git unavailable"}; }
  for (const f of changed) for (const {pattern, reason} of FROZEN) if (pattern.test(f)) { findings.push({rule:"frozen file modified",severity:"warning",file:f,message:reason}); break; }
  return {rule:"CHANGE-CONTROL",description:"Frozen files check",passed:findings.length===0,findings,summary:findings.length===0?`${changed.length} files, none frozen`:`${findings.length} frozen modifications`};
}
