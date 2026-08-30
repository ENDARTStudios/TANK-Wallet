import { scanTransaction } from "./sources/blowfish";
import { simulateTransaction } from "./sources/tenderly";
import { checkAsset } from "./sources/chainpatrol";

export interface RiskInput { chain: string; to: string; from: string; data: string; url?: string; address?: string }
export interface RiskOutput { score: number; verdict: "safe" | "warn" | "block"; sources: string[]; reasons: string[] }

const cache = new Map<string, { output: RiskOutput; at: number }>();
const CACHE_MS = 60_000;

export async function aggregateRisk(input: RiskInput): Promise<RiskOutput> {
  const key = JSON.stringify(input);
  const c = cache.get(key);
  if (c && Date.now() - c.at < CACHE_MS) return c.output;
  const sources: string[] = [];
  const reasons: string[] = [];
  let score = 0;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  const [blowfish, tenderly, chainpatrol] = await Promise.all([
    scanTransaction({ chain: input.chain, to: input.to, data: input.data }).catch(() => null),
    simulateTransaction({ from: input.from, to: input.to, data: input.data }).catch(() => null),
    checkAsset({ url: input.url, address: input.address }).catch(() => null),
  ]);
  clearTimeout(timer);
  void controller;
  if (blowfish?.isMalicious) {
    score += blowfish.severity;
    sources.push("blowfish");
    reasons.push(blowfish.reason);
  }
  if (tenderly?.revert) {
    score += 70;
    sources.push("tenderly");
    reasons.push("tx_will_revert");
  }
  if (chainpatrol?.flagged) {
    score += 90;
    sources.push("chainpatrol");
    reasons.push(chainpatrol.reason);
  }
  score = Math.min(100, score);
  const verdict: RiskOutput["verdict"] = score >= 80 ? "block" : score >= 35 ? "warn" : "safe";
  const output: RiskOutput = { score, verdict, sources, reasons };
  cache.set(key, { output, at: Date.now() });
  return output;
}

export function clearRiskCacheForTest(): void {
  cache.clear();
}
