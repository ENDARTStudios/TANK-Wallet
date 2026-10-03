import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
export const PROJECT_ROOT = resolve(__dirname, "..", "..");
export const SRC_DIR = "src";
export interface Finding { rule: string; severity: "blocker" | "warning"; file: string; line?: number; message: string; }
export interface EnforcementResult { rule: string; description: string; passed: boolean; findings: Finding[]; summary: string; }
function sq(s: string): string { return "'" + s.replace(/'/g, "'\\''") + "'"; }
export function rg(pattern: string, paths: string[], extra: string[] = []): Array<{file:string; line:number; content:string}> {
  try {
    const args = ["rg", "-n", "--no-heading", sq(pattern), ...paths.map(sq), ...extra.map(sq)].join(" ");
    const out = execSync(args + " 2>/dev/null || true", { cwd: PROJECT_ROOT, encoding: "utf8", maxBuffer: 100*1024*1024 });
    return out.trim().split("\n").filter(Boolean).map(l => { const m = l.match(/^([^:]+):(\d+):(.*)$/); return m ? {file:m[1], line:parseInt(m[2],10), content:m[3]} : null; }).filter(Boolean) as any;
  } catch { return []; }
}
export function readFile(p: string): string | null { const a = join(PROJECT_ROOT, p); return existsSync(a) ? readFileSync(a, "utf8") : null; }
export function fileExists(p: string): boolean { return existsSync(join(PROJECT_ROOT, p)); }
