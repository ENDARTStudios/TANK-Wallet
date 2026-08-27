import { db } from "@/lib/db";
import { checkGoPlus } from "./sources/goplus";
import { checkChainPatrol } from "./sources/chainpatrol";
import { checkScamSniffer } from "./sources/scamsniffer";

export interface RiskInput { chain?: string; address?: string; url?: string; workspaceId?: string }
export interface RiskSource { source: string; isMalicious: boolean; severity: number; reason: string }
export interface RiskResult { score: number; maxSeverity: number; sources: RiskSource[]; risks: string[]; recommendation: "allow" | "limit" | "block"; cached: boolean }

const cache = new Map<string, { result: RiskResult; at: number }>();
const CACHE_MS = 5 * 60 * 1000;

function cacheKey(input: RiskInput): string {
  return `${input.chain ?? ""}:${input.address ?? ""}:${input.url ?? ""}:${input.workspaceId ?? ""}`;
}

export async function aggregateThreatIntel(input: RiskInput, opts?: { timeoutMs?: number; now?: number }): Promise<RiskResult> {
  const key = cacheKey(input);
  const now = opts?.now ?? Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.at < CACHE_MS) return { ...cached.result, cached: true };

  const timeoutMs = opts?.timeoutMs ?? 2000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const tasks: Promise<RiskSource | null>[] = [];

  if (input.address && input.chain) {
    tasks.push(
      db.threatToken
        .findFirst({ where: { chain: input.chain, address: input.address.toLowerCase(), active: true } })
        .then((t) => (t ? { source: t.source, isMalicious: true, severity: t.severity, reason: t.reason } : null))
        .catch(() => null),
    );
    tasks.push(
      db.threatAddress
        .findFirst({ where: { chain: input.chain, address: input.address.toLowerCase(), active: true } })
        .then((a) => (a ? { source: a.source, isMalicious: true, severity: a.severity, reason: a.reason } : null))
        .catch(() => null),
    );
    tasks.push(checkGoPlus(input.chain, input.address, controller.signal));
    tasks.push(checkScamSniffer(input.address, controller.signal));
  }

  if (input.url) {
    tasks.push(
      db.threatSite
        .findFirst({ where: { url: input.url.toLowerCase(), active: true } })
        .then((s) => (s ? { source: s.source, isMalicious: true, severity: s.severity, reason: s.reason } : null))
        .catch(() => null),
    );
    tasks.push(checkChainPatrol(input.url, controller.signal));
  }

  const settled = await Promise.allSettled(tasks);
  clearTimeout(timeout);

  const sources: RiskSource[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value && s.value.isMalicious) sources.push(s.value);
  }

  const maxSeverity = sources.length ? Math.max(...sources.map((s) => s.severity)) : 0;
  const score = sources.length ? Math.min(100, maxSeverity + Math.min(20, sources.length * 5)) : 0;
  const risks = sources.map((s) => `${s.source}:${s.reason}`);
  let recommendation: RiskResult["recommendation"] = "allow";
  if (score >= 85) recommendation = "block";
  else if (score >= 35) recommendation = "limit";

  const result: RiskResult = { score, maxSeverity, sources, risks, recommendation, cached: false };
  cache.set(key, { result, at: now });
  return result;
}

export function clearCacheForTest(): void {
  cache.clear();
}
