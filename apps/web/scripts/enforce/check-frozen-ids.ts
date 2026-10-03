import { EnforcementResult, Finding, readFile, rg, SRC_DIR, fileExists } from "./_shared";
const FROZEN_PATH = ".ai/rules/FROZEN-IDS.md";
const ERROR_PATH = ".ai/rules/ERROR-CATALOG.md";
export function enforceFrozenIds(): EnforcementResult {
  const findings: Finding[] = [];
  const catalog = parseCatalog(FROZEN_PATH);
  for (const [id, entry] of parseCatalog(ERROR_PATH)) if (!catalog.has(id)) catalog.set(id, entry);
  if (catalog.size === 0) return { rule: "FROZEN-IDS", description: "IDs immutable", passed: false, findings: [{rule:"parse",severity:"blocker",file:FROZEN_PATH,message:"Parse failed"}], summary: "Parse failure" };
  const patterns = ["SEC-EVT-\\d{3}","CHN-EVT-\\d{3}","ENG-\\d{3}","POL-\\d{3}","THR-\\d{4}","AUD-\\d{3}","TANK-\\d{4}"];
  for (const p of patterns) { for (const m of rg(p, [SRC_DIR])) { const id = m.content.match(new RegExp(p))?.[0]; if (id && !catalog.has(id)) findings.push({rule:"unauthorized ID",severity:"blocker",file:m.file,line:m.line,message:`${id} not catalogued`}); } }
  return { rule: "FROZEN-IDS", description: "IDs match catalogue", passed: findings.length === 0, findings, summary: findings.length === 0 ? `All match (${catalog.size} IDs)` : `${findings.length} unauthorized` };
}
function parseCatalog(path: string): Map<string, {id:string; status:string}> {
  const content = readFile(path); if (!content) return new Map();
  const catalog = new Map(); const re = /((?:SEC-EVT|CHN-EVT|ENG|POL|AUD)-\d{3}|THR-\d{4}|TANK-\d{4})/g; let m;
  while ((m = re.exec(content)) !== null) { if (!catalog.has(m[1])) catalog.set(m[1], {id:m[1], status:"active"}); }
  return catalog;
}
